# Technical Architecture & Folder Structure — Game Hub

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native via **Expo SDK 51+** |
| Language | **TypeScript** (strict mode) |
| Navigation | **Expo Router v3** (file-based routing) |
| State Management | **Zustand** (`npm install zustand`) |
| Animations | **React Native Reanimated v3** (bundled with Expo) |
| Styling | **StyleSheet** (React Native built-in) — no external UI library |
| Storage | **AsyncStorage** (`@react-native-async-storage/async-storage`) — for settings persistence |
| Icons | **@expo/vector-icons** (bundled with Expo) |

> **Important:** All packages must be compatible with **Expo Go**. Do NOT use any native modules that require `expo prebuild` or ejecting.

---

## 2. Project Initialization

```bash
npx create-expo-app@latest game-hub --template blank-typescript
cd game-hub
npx expo install expo-router react-native-safe-area-context react-native-screens
npx expo install zustand @react-native-async-storage/async-storage
npx expo install react-native-reanimated
```

Update `package.json` main entry:
```json
{
  "main": "expo-router/entry"
}
```

Update `app.json`:
```json
{
  "expo": {
    "scheme": "game-hub",
    "web": { "bundler": "metro" }
  }
}
```

---

## 3. Folder Structure

```
game-hub/
├── app/                              # Expo Router — all screens live here
│   ├── _layout.tsx                   # Root layout (Stack navigator, theme provider)
│   ├── index.tsx                     # Home Screen (game selection cards)
│   └── game/
│       ├── [gameId]/
│       │   ├── setup.tsx             # Game Setup Screen (mode + difficulty)
│       │   └── play.tsx              # Active Game Screen (board + UI)
│
├── components/
│   ├── ui/                           # Shared UI primitives
│   │   ├── Button.tsx                # Reusable button with variants
│   │   ├── Card.tsx                  # Game card for home screen
│   │   ├── Modal.tsx                 # Generic modal wrapper
│   │   ├── PlayerInfo.tsx            # Player avatar + name + score strip
│   │   └── TurnIndicator.tsx         # Animated whose-turn-is-it banner
│   │
│   └── games/                        # Game-specific board components
│       ├── TroisPions/
│       │   ├── TroisPionsBoard.tsx   # Draws the board SVG + touch zones
│       │   └── TroisPionsPiece.tsx   # Animated piece component
│       ├── TicTacToe/
│       │   ├── TicTacToeBoard.tsx    # 3×3 grid board
│       │   └── TicTacToeCell.tsx     # Single cell (X/O renderer)
│       ├── Checkers/
│       │   ├── CheckersBoard.tsx     # 8×8 board with squares
│       │   └── CheckersPiece.tsx     # Piece with king crown indicator
│       └── Chess/
│           ├── ChessBoard.tsx        # 8×8 board with coordinate labels
│           └── ChessPiece.tsx        # Unicode or image-based chess piece
│
├── hooks/
│   ├── useGameStore.ts               # Zustand store accessor hook
│   └── useAI.ts                      # Hook to trigger AI move computation
│
├── store/
│   └── gameStore.ts                  # Zustand global store (game state, settings)
│
├── utils/
│   ├── ai/
│   │   ├── troisPionsAI.ts           # AI logic for 3 Pions
│   │   ├── ticTacToeAI.ts            # AI logic for Tic Tac Toe
│   │   ├── checkersAI.ts             # AI logic for Checkers
│   │   └── chessAI.ts                # AI logic for Chess
│   └── gameHelpers.ts                # Shared utilities (e.g. deepClone, checkWin)
│
├── constants/
│   ├── games.ts                      # Game metadata array (id, name, description, icon)
│   └── theme.ts                      # Colors, font sizes, spacing constants
│
├── types/
│   └── index.ts                      # All shared TypeScript interfaces & types
│
└── assets/
    ├── images/
    │   ├── icon.png
    │   └── splash.png
    └── fonts/                        # Optional custom fonts
```

---

## 4. Types (`types/index.ts`)

```typescript
export type GameId = 'trois-pions' | 'tic-tac-toe' | 'checkers' | 'chess';
export type GameMode = 'pvp' | 'pvc';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Player = 1 | 2;
export type GameStatus = 'idle' | 'placement' | 'movement' | 'playing' | 'finished';

export interface GameConfig {
  gameId: GameId;
  mode: GameMode;
  difficulty: Difficulty;
}

export interface PlayerState {
  id: Player;
  name: string;         // "Player 1" / "Player 2" or "Computer"
  score: number;
}

// --- 3 Pions ---
export type TroisPionsBoardState = (Player | null)[];  // Array of 9

export interface TroisPionsState {
  board: TroisPionsBoardState;
  phase: 'placement' | 'movement';
  currentPlayer: Player;
  piecesPlaced: { 1: number; 2: number };
  selectedPosition: number | null;
  round: number;         // 1–3
  roundScores: { 1: number; 2: number };
  status: GameStatus;
  winner: Player | 'draw' | null;
}

// --- Tic Tac Toe ---
export type TicTacToeBoardState = (Player | null)[];  // Array of 9

export interface TicTacToeState {
  board: TicTacToeBoardState;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | 'draw' | null;
}

// --- Checkers ---
export type CheckersPieceType = 'normal' | 'king';

export interface CheckersPiece {
  player: Player;
  type: CheckersPieceType;
}

export type CheckersBoardState = (CheckersPiece | null)[][];  // 8×8

export interface CheckersState {
  board: CheckersBoardState;
  currentPlayer: Player;
  selectedSquare: [number, number] | null;
  validMoves: [number, number][];
  mustJump: boolean;
  status: GameStatus;
  winner: Player | null;
}

// --- Chess ---
export type ChessPieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export interface ChessPiece {
  player: Player;
  type: ChessPieceType;
  hasMoved?: boolean;   // for castling/en passant tracking
}

export type ChessBoardState = (ChessPiece | null)[][];  // 8×8

export interface ChessState {
  board: ChessBoardState;
  currentPlayer: Player;
  selectedSquare: [number, number] | null;
  validMoves: [number, number][];
  enPassantTarget: [number, number] | null;
  castlingRights: { 1: { kingSide: boolean; queenSide: boolean }; 2: { kingSide: boolean; queenSide: boolean } };
  isCheck: boolean;
  status: GameStatus;
  winner: Player | 'draw' | null;
}

// --- Store ---
export interface GameStore {
  config: GameConfig | null;
  players: { 1: PlayerState; 2: PlayerState };
  setConfig: (config: GameConfig) => void;
  setPlayerName: (player: Player, name: string) => void;
  resetPlayers: () => void;
}
```

---

## 5. Zustand Store (`store/gameStore.ts`)

```typescript
import { create } from 'zustand';
import { GameStore, GameConfig, Player } from '../types';

export const useGameStore = create<GameStore>((set) => ({
  config: null,
  players: {
    1: { id: 1, name: 'Player 1', score: 0 },
    2: { id: 2, name: 'Player 2', score: 0 },
  },
  setConfig: (config: GameConfig) => set({ config }),
  setPlayerName: (player: Player, name: string) =>
    set((state) => ({
      players: {
        ...state.players,
        [player]: { ...state.players[player], name },
      },
    })),
  resetPlayers: () =>
    set({
      players: {
        1: { id: 1, name: 'Player 1', score: 0 },
        2: { id: 2, name: 'Player 2', score: 0 },
      },
    }),
}));
```

---

## 6. Navigation Flow

```
app/index.tsx              → Home Screen
  └── app/game/[gameId]/setup.tsx   → Game Setup (params: gameId)
        └── app/game/[gameId]/play.tsx    → Active Game (params: gameId, mode, difficulty)
```

### Routing with Expo Router

```typescript
// From Home → Setup
import { router } from 'expo-router';
router.push(`/game/${gameId}/setup`);

// From Setup → Play (pass mode & difficulty as search params)
router.push({
  pathname: `/game/${gameId}/play`,
  params: { mode: 'pvc', difficulty: 'hard' },
});

// From Play → Home (clear history)
router.replace('/');
```

---

## 7. Game Constants (`constants/games.ts`)

```typescript
import { GameId } from '../types';

export interface GameMeta {
  id: GameId;
  name: string;
  description: string;
  icon: string;          // @expo/vector-icons icon name
  iconFamily: string;    // e.g. 'MaterialCommunityIcons'
  category: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'trois-pions',
    name: '3 Pions',
    description: 'Senegalese alignment strategy game. Place and move your 3 pieces to align them.',
    icon: 'circle-outline',
    iconFamily: 'MaterialCommunityIcons',
    category: 'Strategy',
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic X and O game. Be the first to align 3 in a row.',
    icon: 'close',
    iconFamily: 'MaterialCommunityIcons',
    category: 'Classic',
  },
  {
    id: 'checkers',
    name: 'Checkers',
    description: 'Capture all your opponent\'s pieces by jumping over them.',
    icon: 'checkerboard',
    iconFamily: 'MaterialCommunityIcons',
    category: 'Strategy',
  },
  {
    id: 'chess',
    name: 'Chess',
    description: 'The ultimate strategy game. Checkmate your opponent\'s king.',
    icon: 'chess-king',
    iconFamily: 'MaterialCommunityIcons',
    category: 'Strategy',
  },
];
```

---

## 8. Theme (`constants/theme.ts`)

```typescript
export const COLORS = {
  background: '#1a1a2e',
  surface: '#16213e',
  primary: '#0f3460',
  accent: '#e94560',
  accentSecondary: '#f5a623',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0b0',
  player1: '#4fc3f7',    // Light blue
  player2: '#ef9a9a',    // Light red/salmon
  boardLight: '#f0d9b5', // Light chess/checkers square
  boardDark: '#b58863',  // Dark chess/checkers square
  boardLine: '#5d4037',  // Board line color for 3 Pions
  success: '#66bb6a',
  disabled: '#555566',
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
};
```

---

## 9. AI Architecture

Each AI module exports a single function:

```typescript
// Signature pattern for all AI modules
getAIMove(state: GameState, difficulty: Difficulty): Move
```

### AI Strategy by Game and Difficulty

| Game | Easy | Medium | Hard |
|------|------|--------|------|
| Tic Tac Toe | Random | Win/Block heuristic | Minimax (perfect) |
| 3 Pions | Random | Win/Block heuristic | Minimax depth 4 |
| Checkers | Random | Greedy (max captures) | Minimax + alpha-beta depth 4 |
| Chess | Random valid move | Basic piece value heuristic | Minimax + alpha-beta depth 3 |

### AI Delay
Always wrap AI move computation in a `setTimeout` of 600ms before applying the move to simulate thinking. This prevents the UI from feeling instant and jarring.

```typescript
// In useAI.ts hook
useEffect(() => {
  if (isAITurn) {
    const timer = setTimeout(() => {
      const move = getAIMove(gameState, difficulty);
      applyMove(move);
    }, 600);
    return () => clearTimeout(timer);
  }
}, [isAITurn, gameState]);
```

---

## 10. Key Implementation Rules

- **Never mutate state directly.** Always create new state objects/arrays (use spread or `structuredClone`).
- **All game logic must live in `utils/`**, not inside components. Components only render and dispatch actions.
- **Each game's board component receives only props** — no direct store access from board components.
- **TypeScript strict mode is on.** No `any` types allowed.
- **Handle edge cases:** AI must never make an illegal move. Validate all moves before applying.
- **Expo Go compatibility:** Test all animations with `react-native-reanimated`. Do not use `react-native-gesture-handler` gestures that require native build without Expo config plugin.
