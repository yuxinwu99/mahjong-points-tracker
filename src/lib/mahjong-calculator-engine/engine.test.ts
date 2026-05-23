import { describe, it, expect } from "vitest";
import { MahjongEngine } from "./engine";
import type { GameState } from "../../types/game";

describe("MahjongEngine", () => {
  const playerNames = ["P1", "P2", "P3", "P4"];
  const baseScore = 5;

  describe("getPlayerBase", () => {
    const createMockState = (
      dealerIndex: number,
      streaks: number[],
    ): GameState => ({
      players: playerNames.map((name, i) => ({
        name,
        streak: streaks[i],
        history: [],
      })),
      baseScore,
      dealerIndex,
      lastWinnerIndex: null,
      currentStreakCount: 0,
      roundHistory: [],
      roundNum: 1,
    });

    it("should return 5 for basic non-dealer (0 streaks)", () => {
      const state = createMockState(0, [0, 0, 0, 0]);
      expect(MahjongEngine.getPlayerBase(1, state)).toBe(5);
    });

    it("should return 10 for basic dealer (0 streaks)", () => {
      const state = createMockState(0, [0, 0, 0, 0]);
      expect(MahjongEngine.getPlayerBase(0, state)).toBe(10);
    });

    it("should return 10 for 1-win non-dealer", () => {
      const state = createMockState(0, [0, 1, 0, 0]);
      expect(MahjongEngine.getPlayerBase(1, state)).toBe(10);
    });

    it("should return 20 for 1-win dealer", () => {
      const state = createMockState(0, [1, 0, 0, 0]);
      expect(MahjongEngine.getPlayerBase(0, state)).toBe(20);
    });

    it("should cap non-dealer base at 20 (2+ wins)", () => {
      const state = createMockState(0, [0, 2, 0, 0]);
      expect(MahjongEngine.getPlayerBase(1, state)).toBe(20);

      const state3 = createMockState(0, [0, 3, 0, 0]);
      expect(MahjongEngine.getPlayerBase(1, state3)).toBe(20);
    });

    it("should cap dealer base at 40 (2+ wins)", () => {
      const state = createMockState(0, [2, 0, 0, 0]);
      expect(MahjongEngine.getPlayerBase(0, state)).toBe(40);

      const state3 = createMockState(0, [3, 0, 0, 0]);
      expect(MahjongEngine.getPlayerBase(0, state3)).toBe(40);
    });
  });

  describe("calculateRoundChanges", () => {
    it("should calculate dealer win (0 streak, 0 field points, x1 mult)", () => {
      const state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      const changes = MahjongEngine.calculateRoundChanges(
        state,
        0,
        1,
        [0, 0, 0, 0],
      );
      // Everyone pays 10. Winner +30.
      expect(changes).toEqual([30, -10, -10, -10]);
    });

    it("should calculate non-dealer win (0 streak, 0 field points, x1 mult)", () => {
      const state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      const changes = MahjongEngine.calculateRoundChanges(
        state,
        1,
        1,
        [0, 0, 0, 0],
      );
      // Dealer pays 10. Others pay 5. Winner +20.
      expect(changes).toEqual([-10, 20, -5, -5]);
    });

    it("should apply multiplier (x2) to payouts", () => {
      const state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      const changes = MahjongEngine.calculateRoundChanges(
        state,
        1,
        2,
        [0, 0, 0, 0],
      );
      // Dealer pays 20. Others pay 10. Winner +40.
      expect(changes).toEqual([-20, 40, -10, -10]);
    });

    it("should handle Water settlement (Field Points)", () => {
      // Scenario: P1 Wins, Multiplier x1, Base 5. (P0 is Dealer)
      // Field Points: P0=10, P1=5 (Winner), P2=2, P3=0.
      const state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      const fieldPoints = [10, 5, 2, 0];
      const changes = MahjongEngine.calculateRoundChanges(
        state,
        1,
        1,
        fieldPoints,
      );

      // 1. Payouts (Each loser pays Base + Winner's FP of 5):
      // P0 (Dealer): 10 + 5 = 15
      // P2: 5 + 5 = 10
      // P3: 5 + 5 = 10
      // Winner Gain: +35

      // 2. Water (Loser field point exchange):
      // P0(10), P2(2), P3(0)
      // P0 vs P2: P0 gets +8
      // P0 vs P3: P0 gets +10
      // P2 vs P3: P2 gets +2
      // Net Water: P0: +18, P2: -6, P3: -12

      // 3. Totals:
      // P0: -15 + 18 = +3
      // P1: +35
      // P2: -10 - 6 = -16
      // P3: -10 - 12 = -22

      expect(changes).toEqual([3, 35, -16, -22]);
    });
  });

  describe("nextState", () => {
    it("should rotate dealer when dealer loses", () => {
      const state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      const next = MahjongEngine.nextState(state, 1, 1, [0, 0, 0, 0]);
      expect(next.dealerIndex).toBe(1);
      expect(next.players[0].streak).toBe(0);
      expect(next.players[1].streak).toBe(1);
    });

    it("should retain dealer when dealer wins", () => {
      const state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      const next = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]);
      expect(next.dealerIndex).toBe(0);
      expect(next.players[0].streak).toBe(1);
    });

    it("should update history and roundNum", () => {
      const state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      const next = MahjongEngine.nextState(state, 1, 1, [0, 0, 0, 0]);
      expect(next.roundNum).toBe(2);
      expect(next.roundHistory).toHaveLength(1);
      expect(next.players[1].history).toEqual([20]);
    });
  });

  describe("History Management", () => {
    it("recalculateState should cascade changes correctly", () => {
      // Round 1: P0 (Dealer) wins
      let state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      state = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]);

      // Round 2: P0 (Dealer) wins again (Streak 1)
      state = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]);

      expect(state.players[0].streak).toBe(2);

      // Edit Round 1: P1 won instead
      const editedState = MahjongEngine.recalculateState(state, 1, {
        winnerIndex: 1,
        multiplier: 1,
        fieldPoints: [0, 0, 0, 0],
      });

      // In new Round 1: P1 wins, Dealer moves to P1.
      // So in Round 2, P1 is the Dealer.
      expect(editedState.roundHistory[0].winnerIndex).toBe(1);
      expect(editedState.roundHistory[1].dealerIndex).toBe(1);
      // P0's streak after Round 2 should be 1 because they lost Round 1 but won Round 2
      expect(editedState.players[0].streak).toBe(1);
    });

    it("deleteRound should shift subsequent state", () => {
      let state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      state = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]); // R1: P0 wins
      state = MahjongEngine.nextState(state, 1, 1, [0, 0, 0, 0]); // R2: P1 wins

      // Delete R1
      const deletedState = MahjongEngine.deleteRound(state, 1);

      expect(deletedState.roundHistory).toHaveLength(1);
      // The original R2 becomes the new R1
      // It should have started with P0 as dealer
      expect(deletedState.roundHistory[0].dealerIndex).toBe(0);
      expect(deletedState.roundHistory[0].roundNum).toBe(1);
    });
  });

  describe("Multiple Rounds Scenario", () => {
    it("should correctly calculate state across a full multi-round game", () => {
      let state = MahjongEngine.createInitialState(playerNames, baseScore, 0);

      // Round 1: P0 (Dealer) Wins. Mult x1. Field: [5, 2, 0, 1]
      state = MahjongEngine.nextState(state, 0, 1, [5, 2, 0, 1]);
      expect(state.dealerIndex).toBe(0);
      expect(state.players.map((p) => p.streak)).toEqual([1, 0, 0, 0]);
      expect(state.roundHistory[0].scoreChanges).toEqual([45, -12, -18, -15]);

      // Round 2: P1 Wins. Mult x2. Field: [0, 10, 5, 2]
      state = MahjongEngine.nextState(state, 1, 2, [0, 10, 5, 2]);
      expect(state.dealerIndex).toBe(1);
      expect(state.players.map((p) => p.streak)).toEqual([0, 1, 0, 0]);
      expect(state.roundHistory[1].scoreChanges).toEqual([-57, 90, -12, -21]);

      // Round 3: P1 (Dealer) Wins. Mult x1. Field: [2, 5, 0, 0]
      state = MahjongEngine.nextState(state, 1, 1, [2, 5, 0, 0]);
      expect(state.dealerIndex).toBe(1);
      expect(state.players.map((p) => p.streak)).toEqual([0, 2, 0, 0]);
      expect(state.roundHistory[2].scoreChanges).toEqual([-21, 75, -27, -27]);

      // Verify total scores
      const totals = state.players.map((p) =>
        p.history.reduce((a, b) => a + b, 0),
      );
      expect(totals).toEqual([-33, 153, -57, -63]);
    });

    it("should correctly calculate capping for dealer streak and subsequent loss", () => {
      let state = MahjongEngine.createInitialState(playerNames, baseScore, 0);

      // Round 1: P0 (Dealer) Wins (Streak 0 -> Base 10)
      state = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]);
      expect(state.players[0].streak).toBe(1);
      expect(state.roundHistory[0].scoreChanges).toEqual([30, -10, -10, -10]);

      // Round 2: P0 Wins again (Streak 1 -> Base 20)
      state = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]);
      expect(state.players[0].streak).toBe(2);
      expect(state.roundHistory[1].scoreChanges).toEqual([60, -20, -20, -20]);

      // Round 3: P0 Wins again (Streak 2 -> Base 40, Capped)
      state = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]);
      expect(state.players[0].streak).toBe(2); // Streak value is capped at 2 in engine
      expect(state.roundHistory[2].scoreChanges).toEqual([120, -40, -40, -40]);

      // Round 4: P1 Wins (P0 Loses, P0 pays their high base of 40)
      // Base: P1=5 (non-dealer). Dealer P0 pays 40. P2 pays 5. P3 pays 5. P1 gets 50.
      state = MahjongEngine.nextState(state, 1, 1, [0, 0, 0, 0]);
      expect(state.dealerIndex).toBe(1); // Dealer rotates
      expect(state.players.map((p) => p.streak)).toEqual([0, 1, 0, 0]); // P0 resets, P1 goes to 1
      expect(state.roundHistory[3].scoreChanges).toEqual([-40, 50, -5, -5]);

      // Verify final totals
      // P0: 30 + 60 + 120 - 40 = 170
      // P1: -10 - 20 - 40 + 50 = -20
      // P2: -10 - 20 - 40 - 5 = -75
      // P3: -10 - 20 - 40 - 5 = -75
      const totals = state.players.map((p) =>
        p.history.reduce((a, b) => a + b, 0),
      );
      expect(totals).toEqual([170, -20, -75, -75]);
    });
  });
});
