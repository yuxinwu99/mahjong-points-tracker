import type { GameState, RoundResult } from "../../types/game";

export class MahjongEngine {
  /**
   * Calculates the base points for a player based on their streak and dealer status.
   */
  static getPlayerBase(playerIndex: number, gameState: GameState): number {
    const player = gameState.players[playerIndex];
    // Base progression: 5 -> 10 -> 20 (Capped at 2)
    let base = gameState.baseScore;

    // Dealer doubles the base (10 -> 20 -> 40)
    if (playerIndex === gameState.dealerIndex) {
      base = base * 2 * Math.pow(2, Math.min(2, player.streak));
    }

    return base;
  }

  /**
   * Calculates the score changes for a finished round.
   */
  static calculateRoundChanges(
    gameState: GameState,
    winnerIndex: number,
    multiplier: number,
    fieldPoints: number[],
  ): number[] {
    const tempChanges = [0, 0, 0, 0];
    const winnerBase = this.getPlayerBase(winnerIndex, gameState);
    const dealerBase = this.getPlayerBase(gameState.dealerIndex, gameState);

    // 1. Winner collects from everyone
    for (let i = 0; i < 4; i++) {
      if (i === winnerIndex) continue;

      // Rule: Loser pays based on their own base if they are dealer,
      // otherwise they pay based on the winner's base.
      const usedBase = i === gameState.dealerIndex ? dealerBase : winnerBase;

      // Payout = (UsedBase * Multiplier) + Winner's Field Points
      const payout = usedBase * multiplier + fieldPoints[winnerIndex];

      tempChanges[winnerIndex] += payout;
      tempChanges[i] -= payout;
    }

    // 2. "Water" Transfer (Settlement among losers only)
    const losers = [0, 1, 2, 3].filter((idx) => idx !== winnerIndex);
    for (let i = 0; i < losers.length; i++) {
      for (let j = i + 1; j < losers.length; j++) {
        const idxI = losers[i];
        const idxJ = losers[j];

        // Base difference in field points
        const diff = fieldPoints[idxI] - fieldPoints[idxJ];

        tempChanges[idxI] += diff;
        tempChanges[idxJ] -= diff;
      }
    }

    return tempChanges;
  }

  /**
   * Updates the game state after a round.
   */
  static nextState(
    gameState: GameState,
    winnerIndex: number,
    multiplier: number,
    fieldPoints: number[],
  ): GameState {
    const scoreChanges = this.calculateRoundChanges(
      gameState,
      winnerIndex,
      multiplier,
      fieldPoints,
    );

    const newPlayers = gameState.players.map((player, i) => {
      // Update streak: winner increments (max 2), others reset to 0
      const newStreak = i === winnerIndex ? Math.min(2, player.streak + 1) : 0;

      return {
        ...player,
        streak: newStreak,
        history: [...player.history, scoreChanges[i]],
      };
    });

    const roundData: RoundResult = {
      roundNum: gameState.roundNum,
      dealerIndex: gameState.dealerIndex,
      winnerIndex,
      multiplier,
      fieldPoints: [...fieldPoints],
      scoreChanges,
      scoresAfter: newPlayers.map((p) => p.history.reduce((a, b) => a + b, 0)),
    };

    // Dealer stays if they win
    let newDealerIndex = gameState.dealerIndex;
    if (winnerIndex !== gameState.dealerIndex) {
      newDealerIndex = (gameState.dealerIndex + 1) % 4;
    }

    return {
      ...gameState,
      players: newPlayers,
      dealerIndex: newDealerIndex,
      lastWinnerIndex: winnerIndex,
      currentStreakCount: newPlayers[winnerIndex].streak,
      roundHistory: [...gameState.roundHistory, roundData],
      roundNum: gameState.roundNum + 1,
    };
  }

  static createInitialState(
    playerNames: string[],
    baseScore: number,
    initialDealerIndex: number,
  ): GameState {
    return {
      players: playerNames.map((name) => ({ name, streak: 0, history: [] })),
      baseScore,
      dealerIndex: initialDealerIndex,
      lastWinnerIndex: null,
      currentStreakCount: 0,
      roundHistory: [],
      roundNum: 1,
    };
  }

  /**
   * Recalculates the entire game state by replaying history with a modified round.
   */
  static recalculateState(
    gameState: GameState,
    targetRoundNum: number,
    newData: { winnerIndex: number; multiplier: number; fieldPoints: number[] },
  ): GameState {
    const playerNames = gameState.players.map((p) => p.name);
    const initialDealerIndex =
      gameState.roundHistory.length > 0
        ? gameState.roundHistory[0].dealerIndex
        : gameState.dealerIndex;

    let currentState = this.createInitialState(
      playerNames,
      gameState.baseScore,
      initialDealerIndex,
    );

    for (const round of gameState.roundHistory) {
      const data = round.roundNum === targetRoundNum ? newData : round;
      currentState = this.nextState(
        currentState,
        data.winnerIndex,
        data.multiplier,
        data.fieldPoints,
      );
    }

    return currentState;
  }

  /**
   * Deletes a round and recalculates subsequent state.
   */
  static deleteRound(gameState: GameState, targetRoundNum: number): GameState {
    const playerNames = gameState.players.map((p) => p.name);
    const initialDealerIndex =
      gameState.roundHistory.length > 0
        ? gameState.roundHistory[0].dealerIndex
        : gameState.dealerIndex;

    let currentState = this.createInitialState(
      playerNames,
      gameState.baseScore,
      initialDealerIndex,
    );

    for (const round of gameState.roundHistory) {
      if (round.roundNum === targetRoundNum) continue;
      currentState = this.nextState(
        currentState,
        round.winnerIndex,
        round.multiplier,
        round.fieldPoints,
      );
    }

    return currentState;
  }
}
