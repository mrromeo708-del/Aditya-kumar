
export type GameState = 'START' | 'LEVEL_SELECT' | 'PLAYING' | 'VICTORY';

export interface Card {
  id: number;
  symbol: string;
  category: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface LevelConfig {
  level: number;
  pairs: number;
  cols: string;
}

// Interface for Gemini fun facts
export interface FunFact {
  text: string;
  topic: string;
}
