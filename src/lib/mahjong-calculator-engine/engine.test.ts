import { describe, expect, it } from "vitest";
import type { GameState } from "../../types/game";
import { MahjongEngine } from "./engine";

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

    it("should return 20 for 1-win dealer", () => {
      const state = createMockState(0, [1, 0, 0, 0]);
      expect(MahjongEngine.getPlayerBase(0, state)).toBe(20);
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
      expect(next.players[0].streak).toBe(0); // P0 lost, streak resets
      expect(next.players[1].streak).toBe(0); // P1 won but is not dealer yet, streak stays 0
    });

    it("should retain dealer when dealer wins", () => {
      const state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      const next = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]);
      expect(next.dealerIndex).toBe(0);
      expect(next.players[0].streak).toBe(1); // P0 is dealer and won, streak increments
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
      // So in Round 2, P1 is the Dealer and wins.
      expect(editedState.roundHistory[0].winnerIndex).toBe(1);
      expect(editedState.roundHistory[1].dealerIndex).toBe(1);
      // P0 won Round 2 but is not the dealer, so streak should be 0
      expect(editedState.players[0].streak).toBe(0);
      // P1 is dealer in Round 2 and won, so streak should be 0
      expect(editedState.players[1].streak).toBe(0);
    });

    it("deleteRound should shift subsequent state", () => {
      let state = MahjongEngine.createInitialState(playerNames, baseScore, 0);
      state = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]); // R1: P0 (dealer) wins
      state = MahjongEngine.nextState(state, 1, 1, [0, 0, 0, 0]); // R2: P1 wins (dealer rotates to P1)

      // Delete R1
      const deletedState = MahjongEngine.deleteRound(state, 1);

      expect(deletedState.roundHistory).toHaveLength(1);
      // The original R2 becomes the new R1
      // It should have started with P0 as dealer
      expect(deletedState.roundHistory[0].dealerIndex).toBe(0);
      expect(deletedState.roundHistory[0].roundNum).toBe(1);
      // P1 won but is not dealer in this recalculated round, so streak is 0
      expect(deletedState.players[1].streak).toBe(0);
    });
  });


});
