import { describe, it, expect } from 'vitest';
import { MahjongEngine } from './engine';

describe('MahjongEngine', () => {
  const initialNames = ['P1', 'P2', 'P3', 'P4'];
  const baseScore = 5;
  const initialDealer = 0; // P1 is dealer

  it('should calculate basic payout (no dealer bonus, no field points)', () => {
    const state = MahjongEngine.createInitialState(initialNames, baseScore, initialDealer);
    
    // P2 wins (multiplier 1, no field points)
    // P1 (Dealer) pays 2x (10)
    // P3 pays 1x (5)
    // P4 pays 1x (5)
    // Total for P2 = 20
    const changes = MahjongEngine.calculateRoundChanges(state, 1, 1, [0, 0, 0, 0]);
    
    expect(changes).toEqual([-10, 20, -5, -5]);
  });

  it('should calculate dealer win payout', () => {
    const state = MahjongEngine.createInitialState(initialNames, baseScore, initialDealer);
    
    // P1 (Dealer) wins (multiplier 1)
    // P2, P3, P4 all pay 2x (10 each)
    // Total for P1 = 30
    const changes = MahjongEngine.calculateRoundChanges(state, 0, 1, [0, 0, 0, 0]);
    
    expect(changes).toEqual([30, -10, -10, -10]);
  });

  it('should handle field points and water transfers', () => {
    const state = MahjongEngine.createInitialState(initialNames, baseScore, initialDealer);
    
    // P2 wins, multiplier 1
    // Field points: P1=0, P2=5, P3=2, P4=0
    // 1. Winner (P2) collections:
    // From P1 (Dealer): 5*1*2 (base) + 5 (winner fp) = 15
    // From P3: 5*1*1 (base) + 5 (winner fp) = 10
    // From P4: 5*1*1 (base) + 5 (winner fp) = 10
    // P2 total from collections = 35
    
    // 2. Loser water transfers:
    // Losers: P1(0), P3(2), P4(0)
    // P1 vs P3: diff 2. P3 gets 2, P1 loses 2.
    // P1 vs P4: diff 0.
    // P3 vs P4: diff 2. P3 gets 2, P4 loses 2.
    // Final water: P1(-2), P3(+4), P4(-2)
    
    // Final changes:
    // P1: -15 (to winner) - 2 (water) = -17
    // P2: +35 (from losers) = +35
    // P3: -10 (to winner) + 4 (water) = -6
    // P4: -10 (to winner) - 2 (water) = -12
    
    const changes = MahjongEngine.calculateRoundChanges(state, 1, 1, [0, 5, 2, 0]);
    expect(changes).toEqual([-17, 35, -6, -12]);
  });

  it('should handle streak (Lian Zhuang) multiplier', () => {
    let state = MahjongEngine.createInitialState(initialNames, baseScore, initialDealer);
    
    // Round 1: P1 (Dealer) wins
    state = MahjongEngine.nextState(state, 0, 1, [0, 0, 0, 0]);
    expect(state.dealerIndex).toBe(0); // Dealer stays
    expect(state.currentStreakCount).toBe(1);
    
    // Round 2: P1 (Dealer) wins again (Streak 1 -> 2x base payout)
    // Base = 5. Mult = 1. ConsecutiveMult = 2.
    // P2, P3, P4 pay: (5 * 1 * 2) * 2 (dealer bonus) = 20 each.
    // P1 gets 60.
    const changes = MahjongEngine.calculateRoundChanges(state, 0, 1, [0, 0, 0, 0]);
    expect(changes).toEqual([60, -20, -20, -20]);
  });
});
