import type { RoundResult, GameState } from '../../../types/game';

export class MahjongEngine {
  /**
   * Calculates the score changes for a finished round.
   */
  static calculateRoundChanges(
    gameState: GameState,
    winnerIndex: number,
    multiplier: number,
    fieldPoints: number[]
  ): number[] {
    const { baseScore, dealerIndex, lastWinnerIndex, currentStreakCount } = gameState;
    const tempChanges = [0, 0, 0, 0];
    
    let consecutiveWinMult = 1;
    // Streak logic (Lian Zhuang)
    if (winnerIndex === lastWinnerIndex) {
      consecutiveWinMult = Math.pow(2, Math.min(2, currentStreakCount));
    }

    // 1. Winner collects from everyone
    for (let i = 0; i < 4; i++) {
      if (i === winnerIndex) continue;

      let basePayout = baseScore * multiplier * consecutiveWinMult;
      
      // Apply 2x if winner OR payer is dealer
      if (winnerIndex === dealerIndex || i === dealerIndex) {
        basePayout *= 2;
      }

      const totalToWinner = basePayout + fieldPoints[winnerIndex];
      tempChanges[winnerIndex] += totalToWinner;
      tempChanges[i] -= totalToWinner;
    }

    // 2. Loser "Water" Transfers (Field differences among losers only)
    const losers = [0, 1, 2, 3].filter((idx) => idx !== winnerIndex);
    for (let i = 0; i < losers.length; i++) {
      for (let j = i + 1; j < losers.length; j++) {
        const idxI = losers[i];
        const idxJ = losers[j];
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
    fieldPoints: number[]
  ): GameState {
    const scoreChanges = this.calculateRoundChanges(gameState, winnerIndex, multiplier, fieldPoints);
    
    const newPlayers = gameState.players.map((player, i) => ({
      ...player,
      history: [...player.history, scoreChanges[i]]
    }));

    const roundData: RoundResult = {
      roundNum: gameState.roundNum,
      dealerIndex: gameState.dealerIndex,
      winnerIndex,
      multiplier,
      fieldPoints: [...fieldPoints],
      scoreChanges,
      scoresAfter: newPlayers.map(p => p.history.reduce((a, b) => a + b, 0))
    };

    let newDealerIndex = gameState.dealerIndex;
    let newStreakCount = gameState.currentStreakCount;
    let newLastWinnerIndex = gameState.lastWinnerIndex;

    if (winnerIndex === gameState.lastWinnerIndex) {
      newStreakCount++;
    } else {
      newLastWinnerIndex = winnerIndex;
      newStreakCount = 1;
    }

    // Dealer stays if they win
    if (winnerIndex !== gameState.dealerIndex) {
      newDealerIndex = (gameState.dealerIndex + 1) % 4;
    }

    return {
      ...gameState,
      players: newPlayers,
      dealerIndex: newDealerIndex,
      lastWinnerIndex: newLastWinnerIndex,
      currentStreakCount: newStreakCount,
      roundHistory: [...gameState.roundHistory, roundData],
      roundNum: gameState.roundNum + 1
    };
  }

  static createInitialState(playerNames: string[], baseScore: number, initialDealerIndex: number): GameState {
    return {
      players: playerNames.map(name => ({ name, history: [] })),
      baseScore,
      dealerIndex: initialDealerIndex,
      lastWinnerIndex: null,
      currentStreakCount: 0,
      roundHistory: [],
      roundNum: 1
    };
  }
}
