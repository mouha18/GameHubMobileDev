# UI/UX & Screen Flow Document — Game Hub

## 1. Design Philosophy

- **Dark theme** throughout — deep navy/dark blue tones with bright accent colors.
- **Card-based** home screen for easy game discovery.
- **Minimal chrome** on game screens — maximize board space.
- **Clear turn feedback** — always obvious whose turn it is.
- **Touch-friendly** — all tap targets minimum 44×44pt.

---

## 2. Color & Visual Identity

See `constants/theme.ts` for exact values. Summary:

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

## 3. Screen Inventory

| Screen | File | Description |
|--------|------|-------------|
| Home | `app/index.tsx` | Game selection |
| Game Setup | `app/game/[gameId]/setup.tsx` | Mode & difficulty picker |
| Active Game | `app/game/[gameId]/play.tsx` | Board + game UI |

---

## 4. Screen Specifications

---

### 4.1 Home Screen (`app/index.tsx`)

**Layout:**

```
┌─────────────────────────────┐
│        GAME HUB  🎮         │  ← App title, centered, large bold
│     "Choose your game"      │  ← Subtitle, muted text
├─────────────────────────────┤
│  ┌───────────┐ ┌──────────┐ │
│  │  3 Pions  │ │Tic Tac   │ │  ← 2-column grid of game cards
│  │   icon    │ │  Toe     │ │
│  │ Strategy  │ │ Classic  │ │
│  └───────────┘ └──────────┘ │
│  ┌───────────┐ ┌──────────┐ │
│  │ Checkers  │ │  Chess   │ │
│  │   icon    │ │   icon   │ │
│  │ Strategy  │ │ Strategy │ │
│  └───────────┘ └──────────┘ │
└─────────────────────────────┘
```

**Game Card Component (`components/ui/Card.tsx`):**
- Background: `surface` color with subtle border.
- Large centered icon (MaterialCommunityIcons, ~48px).
- Game name below icon, bold, white, 16pt.
- Category tag below name, muted gray, 12pt.
- Rounded corners (`borderRadius: 20`).
- On press: scale-down animation (0.96) using `Reanimated`, then navigate to setup.
- Card size: ~160×160px (fills column evenly with 16px gap).

**Header:**
- App name "GAME HUB" centered, 28pt bold.
- Optional settings icon (top-right) — placeholder, no functionality needed.

---

### 4.2 Game Setup Screen (`app/game/[gameId]/setup.tsx`)

**Layout:**

```
┌─────────────────────────────┐
│  ←   [Game Name]            │  ← Back button + game name in header
├─────────────────────────────┤
│                             │
│   [Large Game Icon]         │  ← Centered big icon ~80px
│   3 Pions                   │  ← Game name, large bold
│   "Place and move..."       │  ← Game description, muted text
│                             │
│   ──── Select Mode ────     │
│   ┌────────┐  ┌──────────┐  │
│   │   PvP  │  │ vs. CPU  │  │  ← Segmented tab / toggle buttons
│   └────────┘  └──────────┘  │
│                             │
│   ──── Difficulty ────      │  ← Only visible if "vs. CPU" selected
│   ┌───────┐┌───────┐┌─────┐ │
│   │ Easy  ││Medium ││Hard │ │  ← 3 option buttons in a row
│   └───────┘└───────┘└─────┘ │
│                             │
│   ┌─────────────────────┐   │
│   │      START GAME     │   │  ← Primary CTA button
│   └─────────────────────┘   │
└─────────────────────────────┘
```

**Behavior:**
- Tapping **PvP** hides the difficulty selector.
- Tapping **vs. CPU** shows the difficulty selector (defaults to Medium).
- Selected mode and difficulty are visually highlighted (accent color fill, bold text).
- **START GAME** button: full-width, accent color (`#e94560`), 18pt bold, navigates to `play.tsx`.

---

### 4.3 Active Game Screen (`app/game/[gameId]/play.tsx`)

**Layout (all games share this shell):**

```
┌─────────────────────────────┐
│  ←        CHESS       ⚙️   │  ← Back arrow + game name + menu icon
├─────────────────────────────┤
│  ┌───────────────────────┐  │
│  │ 🤖 Player 2 (CPU) 0  │  │  ← Opponent player strip
│  └───────────────────────┘  │
│                             │
│  ┌─────── Turn Banner ─────┐ │  ← "Player 1's Turn" animated banner
│  └────────────────────────┘ │
│                             │
│  ╔═══════════════════════╗  │
│  ║                       ║  │
│  ║     [ GAME BOARD ]    ║  │  ← Board takes ~70% of screen height
│  ║                       ║  │
│  ╚═══════════════════════╝  │
│                             │
│  ┌───────────────────────┐  │
│  │ 👤 Player 1       0  │  │  ← Current player strip (always bottom)
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**Player Strip Component (`components/ui/PlayerInfo.tsx`):**
- Avatar: circle placeholder (initials or a simple icon).
- Name on the left.
- Score (integer) on the right, large bold.
- Background is Player 1 color or Player 2 color (muted/faded when not their turn).
- Active player strip has a **glowing left border** (3px solid, player color).

**Turn Banner (`components/ui/TurnIndicator.tsx`):**
- Small centered pill badge showing: "Player 1's Turn" or "Player 2's Turn".
- Fades in/out with `Reanimated` when turn changes.
- Color matches active player's color.

**Menu Icon (⚙️):**
- Opens an in-game **modal menu** (see 4.4 below).

---

### 4.4 In-Game Menu Modal

Triggered by the ⚙️ icon during gameplay.

```
┌─────────────────────────────┐
│          PAUSED             │
│                             │
│   ┌─────────────────────┐   │
│   │      RESUME         │   │  ← Closes modal, resumes
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │      RESTART        │   │  ← Resets current game (confirm?)
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │     GO TO HOME      │   │  ← Returns to Home screen
│   └─────────────────────┘   │
└─────────────────────────────┘
```

- Semi-transparent backdrop (rgba(0,0,0,0.7)).
- Modal slides up from bottom with Reanimated.
- Restart does NOT confirm — just immediately resets.

---

### 4.5 Game Over Modal

Shown automatically when a game ends (win or draw).

```
┌─────────────────────────────┐
│                             │
│          🏆                 │  ← Trophy emoji (or 🤝 for draw)
│     Player 1 Wins!          │  ← Bold, 24pt, accent color
│     (or "It's a Draw!")     │
│                             │
│   ┌─────────────────────┐   │
│   │     PLAY AGAIN      │   │  ← Restart same game config
│   └─────────────────────┘   │
│   ┌─────────────────────┐   │
│   │     GO TO HOME      │   │
│   └─────────────────────┘   │
└─────────────────────────────┘
```

- Slides up from bottom with Reanimated.
- Backdrop dims the board behind it.
- "PLAY AGAIN" restarts with the same config (same mode, difficulty).

---

## 5. Board-Specific UI

---

### 5.1 3 Pions Board (`components/games/TroisPions/TroisPionsBoard.tsx`)

```
    TL ------- TM ------- TR
    |  \        |        /  |
    |    \      |      /    |
    LM -------- C -------- RM
    |    /      |      \    |
    |  /        |        \  |
    BL ------- BM ------- BR
```

**Implementation:**
- Use `react-native` `View` with absolute positioning on a fixed-size container (e.g., 300×300px).
- Draw lines using thin `View` elements with `transform: rotate(Xdeg)` or use `react-native-svg` if available in Expo Go.
- **Prefer `react-native-svg`** (`expo install react-native-svg`) — draw the board as SVG lines.
- Each position is a circular `TouchableOpacity` (40×40px) centered at its coordinate.
- Position coordinates (as percentage of board width/height):

| Index | Name | X% | Y% |
|-------|------|----|-----|
| 0 | Top-Left | 10% | 10% |
| 1 | Top-Mid | 50% | 10% |
| 2 | Top-Right | 90% | 10% |
| 3 | Mid-Left | 10% | 50% |
| 4 | Center | 50% | 50% |
| 5 | Mid-Right | 90% | 50% |
| 6 | Bot-Left | 10% | 90% |
| 7 | Bot-Mid | 50% | 90% |
| 8 | Bot-Right | 90% | 90% |

**Piece rendering:**
- Empty spot: Small circle outline (gray).
- Player 1 piece: Filled dark circle (`#555`).
- Player 2 piece: Filled light circle (`#ddd`).
- Selected piece (movement phase): glowing ring around piece (Player color, opacity 0.8).
- Valid move target (movement phase): pulsing empty circle indicator.

**Placement Phase vs Movement Phase:**
- Placement: Tap any empty position to place a piece.
- Movement: First tap selects one of your pieces (highlight it). Second tap on a valid adjacent empty position moves it. Tapping elsewhere deselects.

**Round indicator (top of board area):**
- "Round 1 / 3" shown above the board.

---

### 5.2 Tic Tac Toe Board (`components/games/TicTacToe/TicTacToeBoard.tsx`)

- 3×3 grid drawn with 4 lines (2 horizontal, 2 vertical).
- Each cell is a `TouchableOpacity` occupying 1/3 of the board width.
- **X** displayed as two crossing lines (drawn with SVG or bold `×` text symbol).
- **O** displayed as a circle (SVG or bold `○` text symbol).
- On win: draw an animated line through the winning 3 cells.
- Board size: ~280×280px, centered.
- Grid line color: `#a0a0b0` (muted white).

---

### 5.3 Checkers Board (`components/games/Checkers/CheckersBoard.tsx`)

- 8×8 grid of alternating light/dark squares.
- Light squares: `#f0d9b5`, Dark squares: `#b58863`.
- Pieces only on dark squares.
- **Normal piece**: Filled circle, slightly smaller than the square.
  - Player 1 (Dark): `#2d2d2d` with `#555` border.
  - Player 2 (Light): `#f5f5f5` with `#ccc` border.
- **King piece**: Same as normal but with a small crown icon (`♛`) overlaid.
- **Selected piece**: Highlight the square with a colored overlay (semi-transparent player color).
- **Valid move squares**: Highlight with a green dot or semi-transparent overlay.
- Board fills available width minus padding (use `Dimensions.get('window').width - 32`).
- Cell size: `boardWidth / 8`.

---

### 5.4 Chess Board (`components/games/Chess/ChessBoard.tsx`)

- 8×8 grid, same square coloring as checkers.
- Coordinate labels:
  - Column labels (a–h) at the bottom.
  - Row labels (1–8) on the left side.
  - Labels: 10pt, muted gray text.
- Pieces rendered as **Unicode characters** (see `CHESS_UNICODE` in game rules doc).
  - Font size: ~70% of cell size.
  - White pieces: `#ffffff` with `#333` text shadow for contrast.
  - Black pieces: `#1a1a1a`.
- **Selected square**: Blue overlay.
- **Valid move squares**:
  - Empty square: Small circle dot in center.
  - Opponent piece square (capturable): Colored ring around the piece.
- **Check indicator**: King's square highlighted red.
- Board fills available width: `boardWidth = Dimensions.get('window').width - 16`.
- Cell size: `boardWidth / 8`.

---

## 6. Navigation Flow Diagram

```
[Home Screen]
     |
     | tap a game card
     ↓
[Game Setup Screen]
     |
     | tap START GAME
     ↓
[Active Game Screen]  ←──────────────────────┐
     |                                        │
     | ⚙️ icon                                │
     ↓                                        │
[In-Game Menu Modal]                          │
     |──── Resume ──────────────────────────→ │ (back to game)
     |──── Restart ─────────────────────────→ │ (reset, same screen)
     |──── Go to Home ──────────────────────→ [Home Screen]
     |
     | game ends (win/draw)
     ↓
[Game Over Modal]
     |──── Play Again ───────────────────────→ [Active Game Screen] (new game)
     |──── Go to Home ──────────────────────→ [Home Screen]
```

---

## 7. Animations Summary

| Animation | Library | Description |
|-----------|---------|-------------|
| Card press | Reanimated `useSharedValue` + `withSpring` | Scale to 0.95 on press |
| Turn change | Reanimated `withTiming` | Fade TurnIndicator opacity |
| AI thinking | Reanimated `withRepeat` + `withTiming` | Pulsing opacity on AI avatar |
| Modal slide up | Reanimated `withSpring` | Y-translation from screen bottom |
| Win line draw | Reanimated `withTiming` on width/opacity | Line draws across winning cells |
| Piece placement (3P/TTT) | Reanimated `withSpring` | Scale from 0 → 1 on piece appear |
| Valid move pulse (3P) | Reanimated `withRepeat` | Scale 1.0 → 1.2 looping |

---

## 8. Accessibility & Touch Targets

- All interactive elements: minimum 44×44pt touch target.
- Board cells in Checkers/Chess: must be large enough on small phones. Minimum cell size: 36px.
- If board is too large, add horizontal scroll or auto-scale to fit screen.
- Disabled cells (not tappable): visual opacity 0.5 when not the current player's turn.

---

## 9. Fonts

- Use the system default font (no custom font loading needed).
- Title/header text: **bold**, size 24–28pt.
- Body text: **regular**, size 14–16pt.
- Board labels: **regular**, size 10–12pt.

---

## 10. Component Reuse Guide

| Component | Used On |
|-----------|---------|
| `PlayerInfo` | All game screens (top + bottom) |
| `TurnIndicator` | All game screens |
| `Modal` | In-game menu + Game over dialog |
| `Button` | Setup screen, modals |
| `Card` | Home screen only |

Every board component (`TroisPionsBoard`, `TicTacToeBoard`, `CheckersBoard`, `ChessBoard`) receives the following base props:

```typescript
interface BoardProps<TState> {
  gameState: TState;
  currentPlayer: Player;
  isAITurn: boolean;           // Disable touch input when AI is thinking
  onMove: (move: any) => void; // Callback with move data (type per game)
}
```
