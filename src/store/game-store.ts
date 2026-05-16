import { Store } from '@tanstack/react-store';
import type { GameState } from '../types/game';
import { MahjongEngine } from '../lib/mahjong-calculator-engine/engine';

export const gameStore = new Store<GameState | null>(null);

export const startGame = (playerNames: string[], baseScore: number, initialDealerIndex: number) => {
  const initialState = MahjongEngine.createInitialState(playerNames, baseScore, initialDealerIndex);
  gameStore.setState(() => initialState);
};

export const addRound = (winnerIndex: number, multiplier: number, fieldPoints: number[]) => {
  gameStore.setState((state) => {
    if (!state) return null;
    return MahjongEngine.nextState(state, winnerIndex, multiplier, fieldPoints);
  });
};

export const updateRound = (roundNum: number, winnerIndex: number, multiplier: number, fieldPoints: number[]) => {
  gameStore.setState((state) => {
    if (!state || roundNum !== state.roundHistory.length) return state;
    return MahjongEngine.recalculateState(state, roundNum, { winnerIndex, multiplier, fieldPoints });
  });
};

export const deleteRound = (roundNum: number) => {
  gameStore.setState((state) => {
    if (!state || roundNum !== state.roundHistory.length) return state;
    return MahjongEngine.deleteRound(state, roundNum);
  });
};

export const resetGame = () => {
  gameStore.setState(() => null);
};
