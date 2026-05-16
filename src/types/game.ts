export interface PlayerState {
  name: string;
  history: number[]; // Array of score changes
}

export interface RoundResult {
  roundNum: number;
  dealerIndex: number;
  winnerIndex: number;
  multiplier: number;
  fieldPoints: number[];
  scoreChanges: number[];
  scoresAfter: number[];
}

export interface GameState {
  players: PlayerState[];
  baseScore: number;
  dealerIndex: number;
  lastWinnerIndex: number | null;
  currentStreakCount: number;
  roundHistory: RoundResult[];
  roundNum: number;
}
