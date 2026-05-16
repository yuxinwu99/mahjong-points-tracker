import { Store } from '@tanstack/react-store';
import type { GameState } from '../types/game';
import { MahjongEngine } from '../lib/game-logic/mahjong-calculator-engine/engine';

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

export const resetGame = () => {
  gameStore.setState(() => null);
};
