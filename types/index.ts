// Game ID Types
export type GameId = 'trois-pions' | 'tic-tac-toe' | 'checkers';
export type GameMode = 'pvp' | 'pvc';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Player = 1 | 2;
export type GameStatus = 'idle' | 'placement' | 'movement' | 'playing' | 'finished';

// Game Configuration
export interface GameConfig {
  gameId: GameId;
  mode: GameMode;
  difficulty: Difficulty;
  playerSide?: Player;
  checkersRules?: 'american' | 'international';
  checkersCaptureRequired?: boolean;
}

// Player State
export interface PlayerState {
  id: Player;
  name: string;
  score: number;
}

// ==================== 3 PIONS ====================
export type TroisPionsBoardState = (Player | null)[];

export interface TroisPionsState {
  board: TroisPionsBoardState;
  phase: 'placement' | 'movement';
  currentPlayer: Player;
  piecesPlaced: { 1: number; 2: number };
  selectedPosition: number | null;
  round: number;
  roundScores: { 1: number; 2: number };
  status: GameStatus;
  winner: Player | 'draw' | null;
}

// ==================== TIC TAC TOE ====================
export type TicTacToeBoardState = (Player | null)[];

export interface TicTacToeState {
  board: TicTacToeBoardState;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | 'draw' | null;
  winningLine: number[] | null;
}

// ==================== CHECKERS ====================
export type CheckersPieceType = 'normal' | 'king';

export interface CheckersPiece {
  player: Player;
  type: CheckersPieceType;
}

export type CheckersBoardState = (CheckersPiece | null)[][];

export interface CheckersMove {
  from: [number, number];
  to: [number, number];
  captured?: [number, number][];
}

export interface CheckersState {
  board: CheckersBoardState;
  currentPlayer: Player;
  selectedSquare: [number, number] | null;
  validMoves: CheckersMove[];
  mustJump: boolean;
  jumpChain: [number, number][];
  status: GameStatus;
  winner: Player | 'draw' | null;
}

// ==================== STORE ====================
export interface GameStore {
  config: GameConfig | null;
  players: { 1: PlayerState; 2: PlayerState };
  setConfig: (config: GameConfig) => void;
  setPlayerName: (player: Player, name: string) => void;
  incrementScore: (player: Player) => void;
  resetPlayers: () => void;
}
