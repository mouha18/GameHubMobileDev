# Game Hub - Agent Documentation

## Project Overview

**Project Name:** Game Hub  
**Platform:** Mobile (iOS & Android)  
**Tech Stack:** React Native, Expo Go (SDK 51+), TypeScript  
**Context:** Mobile Development Midterm Project — DAUST

Game Hub is a mobile application that lets users play 3 classic board games in a single app. Each game supports two modes: Player vs Player (local) and Player vs Computer (with 3 AI difficulty levels).

---

## Games Included

| # | Game | Type | Board Size |
|---|------|------|------------|
| 1 | 3 Pions | Senegalese strategy | 3×3 grid (9 positions) |
| 2 | Tic Tac Toe | Classic | 3×3 grid |
| 3 | Checkers | Classic strategy | 8×8 board |

---

## Game Modes

### Player vs Player (PvP)
- Two human players take turns on the same device
- Players are labeled Player 1 and Player 2
- A visual indicator shows whose turn it is

### Player vs Computer (PvC)
- The human plays as Player 1, the computer as Player 2
- The user selects a difficulty level before starting the game
- The computer takes its turn automatically after the player's move (with 600ms delay)

### AI Difficulty Levels

| Level | Behavior |
|-------|----------|
| Easy | Random valid moves. No strategic lookahead. |
| Medium | Looks 1–2 moves ahead. Prioritizes winning/blocking moves. |
| Hard | Minimax algorithm with alpha-beta pruning. Plays near-optimally. |

---

## Project Structure

```
game-hub/
├── app/                              # Expo Router — all screens
│   ├── _layout.tsx                   # Root layout
│   ├── index.tsx                     # Home Screen
│   └── game/
│       └── [gameId]/
│           ├── setup.tsx              # Game Setup Screen
│           └── play.tsx              # Active Game Screen
│
├── components/
│   ├── ui/                           # Shared UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── PlayerInfo.tsx
│   │   └── TurnIndicator.tsx
│   │
│   └── games/                        # Game-specific board components
│       ├── TroisPions/
│       │   └── TroisPionsBoard.tsx
│       ├── TicTacToe/
│       │   └── TicTacToeBoard.tsx
│       ├── Checkers/
│       │   └── CheckersBoard.tsx
│       └── Chess/
│           └── ChessBoard.tsx
│
├── store/
│   └── gameStore.ts                  # Zustand store
│
├── utils/
│   ├── gameHelpers.ts               # Shared utilities
│   └── ai/                          # AI modules
│       ├── ticTacToeAI.ts
│       ├── troisPionsAI.ts
│       ├── checkersAI.ts
│       └── chessAI.ts
│
├── constants/
│   ├── games.ts                     # Game metadata
│   └── theme.ts                     # Colors, fonts, spacing
│
└── types/
    └── index.ts                     # TypeScript interfaces
```

---

## Key Implementation Rules

1. **Never mutate state directly.** Always create new state objects/arrays
2. **All game logic must live in `utils/`**, not inside components
3. **Each game's board component receives only props** — no direct store access
4. **TypeScript strict mode is on.** No `any` types allowed
5. **Handle edge cases:** AI must never make an illegal move
6. **Expo Go compatibility:** All animations use react-native-reanimated

---

## Color Palette

| Role | Color | Hex |
|------|-------|-----|
| App background | Dark navy | `#1a1a2e` |
| Surface/cards | Darker navy | `#16213e` |
| Primary button | Deep blue | `#0f3460` |
| Accent / CTA | Red-pink | `#e94560` |
| Player 1 color | Sky blue | `#4fc3f7` |
| Player 2 color | Salmon | `#ef9a9a` |
| Board light squares | Cream | `#f0d9b5` |
| Board dark squares | Tan brown | `#b58863` |
| Text primary | White | `#ffffff` |
| Text secondary | Muted gray | `#a0a0b0` |

---

## Navigation Flow

```
[Home Screen]
     │
     │ tap a game card
     ↓
[Game Setup Screen]
     │
     │ tap START GAME
     ↓
[Active Game Screen]  ←──────────────────────┐
     │                                        │
     │ ⚙️ icon                                │
     ↓                                        │
[In-Game Menu Modal]                          │
     │──── Resume ──────────────────────────→ │
     │──── Restart ─────────────────────────→ │
     │──── Go to Home ──────────────────────→│
     │
     │ game ends (win/draw)
     ↓
[Game Over Modal]
     │──── Play Again ───────────────────────→│
     │──── Go to Home ──────────────────────→│
```

---

## Current Implementation Status

- ✅ Project configuration (package.json, app.json, tsconfig.json, babel.config.js)
- ✅ Types and constants
- ✅ Zustand store
- ✅ Shared UI components (Button, Card, Modal, PlayerInfo, TurnIndicator)
- ✅ Game boards (TicTacToe, TroisPions, Checkers, Chess)
- ✅ AI modules (TicTacToe, TroisPions, Checkers, Chess)
- ✅ Screens (Home, Setup, Play)
- ✅ Agent documentation (agent.md)
- ⏳ Testing and verification

---

## Notes for Development

1. Run `npm install` to install all dependencies
2. Run `npx expo start` to start the development server
3. Use Expo Go app on mobile to test
4. All game logic is implemented in the `utils/` folder
5. Board components are in `components/games/`
6. Screens use Expo Router file-based navigation
