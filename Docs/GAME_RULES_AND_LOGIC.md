# Game Rules & Logic Specifications — Game Hub

This document defines the complete rules, board setup, win conditions, and AI logic for all 4 games. Kilo Code must implement game logic exactly as specified here.

---

## GAME 1 — 3 Pions (Senegalese Strategy Game)

### 1.1 Overview

3 Pions is a traditional Senegalese two-player strategy game played on a 9-point board. Each player has 3 pieces. The game has two phases: a **Placement Phase** and a **Movement Phase**. The goal is to align all 3 of your pieces along any valid line on the board.

---

### 1.2 Board Layout

The board has **9 positions** arranged in a 3×3 grid with connecting lines. Positions are indexed 0–8:

```
0 ------- 1 ------- 2
|  \      |      /  |
|    \    |    /    |
|      \  |  /      |
3 ------- 4 ------- 5
|      /  |  \      |
|    /    |    \    |
|  /      |      \  |
6 ------- 7 ------- 8
```

**Visual mapping:**

| Index | Position Name |
|-------|--------------|
| 0 | Top-Left |
| 1 | Top-Middle |
| 2 | Top-Right |
| 3 | Middle-Left |
| 4 | Center |
| 5 | Middle-Right |
| 6 | Bottom-Left |
| 7 | Bottom-Middle |
| 8 | Bottom-Right |

---

### 1.3 Adjacency Map (Valid Movement Edges)

A piece can only move to an **adjacent and connected** position. The connections are:

```typescript
export const TROIS_PIONS_ADJACENCY: number[][] = [
  [1, 3, 4],      // 0: connects to 1, 3, 4
  [0, 2, 4],      // 1: connects to 0, 2, 4
  [1, 4, 5],      // 2: connects to 1, 4, 5
  [0, 4, 6],      // 3: connects to 0, 4, 6
  [0, 1, 2, 3, 5, 6, 7, 8],  // 4 (Center): connects to ALL other 8 positions
  [2, 4, 8],      // 5: connects to 2, 4, 8
  [3, 4, 7],      // 6: connects to 3, 4, 7
  [4, 6, 8],      // 7: connects to 4, 6, 8
  [4, 5, 7],      // 8: connects to 4, 5, 7
];
```

---

### 1.4 Winning Lines

A player wins a round when all 3 of their pieces occupy any one of these 8 lines:

```typescript
export const TROIS_PIONS_WIN_LINES: number[][] = [
  [0, 1, 2],   // top row
  [3, 4, 5],   // middle row
  [6, 7, 8],   // bottom row
  [0, 3, 6],   // left column
  [1, 4, 7],   // center column
  [2, 5, 8],   // right column
  [0, 4, 8],   // main diagonal
  [2, 4, 6],   // anti-diagonal
];
```

---

### 1.5 Game Flow

#### Phase 1 — Placement Phase
- Players alternate placing one piece per turn onto any **empty** position.
- Player 1 goes first.
- Each player places exactly 3 pieces. So 6 total turns to complete placement.
- If at any point during placement a player gets 3 in a line, they **win the round immediately**.
- After all 6 pieces are placed and no alignment exists, the game enters Phase 2.

#### Phase 2 — Movement Phase
- Players alternate moving one of their pieces per turn.
- A piece can only move to an **adjacent empty** position (see adjacency map above).
- If a player forms an alignment (3 in a line), they **win the round**.
- **Stalemate:** If a player has no valid moves on their turn, the round ends in a draw.

#### Round System
- The game is played over **3 rounds**.
- The player who wins more rounds (2 out of 3) wins the overall match.
- After each round, the board is cleared and placement restarts.
- The player who **lost** the previous round goes first in the next round. If draw, Player 1 goes first.

---

### 1.6 Win Condition Check Function

```typescript
function checkTroisPionsWin(board: (Player | null)[], player: Player): boolean {
  return TROIS_PIONS_WIN_LINES.some(line =>
    line.every(pos => board[pos] === player)
  );
}
```

---

### 1.7 Valid Moves (Movement Phase)

```typescript
function getTroisPionsValidMoves(
  board: (Player | null)[],
  player: Player
): Array<{ from: number; to: number }> {
  const moves: Array<{ from: number; to: number }> = [];
  board.forEach((cell, from) => {
    if (cell === player) {
      TROIS_PIONS_ADJACENCY[from].forEach(to => {
        if (board[to] === null) {
          moves.push({ from, to });
        }
      });
    }
  });
  return moves;
}
```

---

### 1.8 AI Logic for 3 Pions

#### Easy (Random)
- Placement: pick a random empty position.
- Movement: pick a random valid move.

#### Medium (Heuristic)
1. **Win immediately**: If placing/moving to a position gives AI 3 in a line → do it.
2. **Block opponent**: If the opponent would win on their next turn → block that position/move.
3. **Otherwise**: Random valid move.

#### Hard (Minimax, depth 4)
- Implement minimax with alpha-beta pruning.
- Evaluate board state:
  - +100 if AI wins
  - -100 if opponent wins
  - +5 per line where AI has 2 pieces and the 3rd is empty
  - -5 per line where opponent has 2 pieces and the 3rd is empty
  - +2 if AI occupies center (position 4)
- Search depth: 4 plies.

---

## GAME 2 — Tic Tac Toe

### 2.1 Overview

The classic 3×3 game. Player 1 is **X**, Player 2 (or Computer) is **O**. Players alternate placing their symbol. First to align 3 wins.

---

### 2.2 Board Layout

9-cell board, indexed 0–8 in row-major order:

```
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

**State representation:** `(Player | null)[]` of length 9.

---

### 2.3 Winning Lines

```typescript
export const TTT_WIN_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // columns
  [0, 4, 8], [2, 4, 6],               // diagonals
];
```

---

### 2.4 Game Flow

1. Player 1 (X) goes first.
2. On each turn, the current player taps an empty cell to place their symbol.
3. After each move, check for a win or draw.
4. **Win**: A player has 3 of their symbols on any win line.
5. **Draw**: All 9 cells are filled and no player has won.

---

### 2.5 Win/Draw Check

```typescript
function checkTTTWin(board: (Player | null)[], player: Player): boolean {
  return TTT_WIN_LINES.some(line => line.every(i => board[i] === player));
}

function checkTTTDraw(board: (Player | null)[]): boolean {
  return board.every(cell => cell !== null);
}
```

---

### 2.6 AI Logic for Tic Tac Toe

#### Easy (Random)
- Pick a random empty cell.

#### Medium (Heuristic)
1. Win if possible (one move to complete a line).
2. Block opponent from winning.
3. Take center (index 4) if available.
4. Take a corner.
5. Take any available cell.

#### Hard (Perfect Minimax)
- Minimax without depth limit (game tree is small enough).
- At Hard, the AI never loses — it will always win or draw.
- AI is maximizing player (+1 win, -1 loss, 0 draw).

```typescript
function minimax(
  board: (Player | null)[],
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  if (checkTTTWin(board, aiPlayer)) return 10;
  if (checkTTTWin(board, humanPlayer)) return -10;
  if (board.every(c => c !== null)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    board.forEach((cell, i) => {
      if (cell === null) {
        board[i] = aiPlayer;
        best = Math.max(best, minimax(board, false, aiPlayer, humanPlayer));
        board[i] = null;
      }
    });
    return best;
  } else {
    let best = Infinity;
    board.forEach((cell, i) => {
      if (cell === null) {
        board[i] = humanPlayer;
        best = Math.min(best, minimax(board, true, aiPlayer, humanPlayer));
        board[i] = null;
      }
    });
    return best;
  }
}
```

---

## GAME 3 — Checkers (American/Standard Rules)

### 3.1 Overview

Standard 8×8 American checkers. Player 1 plays the **dark pieces** (starts at rows 5–7), Player 2 plays the **light pieces** (starts at rows 0–2). Player 1 moves first. Pieces move diagonally. Jumping is mandatory. Last player with pieces wins.

---

### 3.2 Board Layout

- 8×8 grid, indexed `[row][col]` where `[0][0]` is top-left.
- Pieces only exist on **dark squares** (where `(row + col) % 2 === 1`).
- Player 2 (light) starts at rows 0–2, Player 1 (dark) starts at rows 5–7.

**Initial board setup:**

```typescript
function createInitialCheckersBoard(): CheckersBoardState {
  const board: CheckersBoardState = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) board[row][col] = { player: 2, type: 'normal' };
        if (row > 4) board[row][col] = { player: 1, type: 'normal' };
      }
    }
  }
  return board;
}
```

---

### 3.3 Movement Rules

#### Normal Pieces
- Player 1 moves **upward** (decreasing row index).
- Player 2 moves **downward** (increasing row index).
- Normal pieces move diagonally to an adjacent empty dark square.

#### King Pieces
- A piece becomes a **King** when it reaches the opponent's back row:
  - Player 1 piece reaches row 0 → promoted to King.
  - Player 2 piece reaches row 7 → promoted to King.
- Kings can move diagonally in **all 4 directions**.
- Display a crown icon or indicator on king pieces.

#### Jumping (Capture)
- A piece can jump over an adjacent opponent piece to an empty square directly beyond it.
- The jumped piece is **removed** from the board.
- **Multiple jumps are mandatory**: if after a jump the same piece can jump again, it **must** continue jumping with the same piece.
- **Jumping is mandatory**: if any jump is available for the current player, they must capture. They cannot make a non-capturing move.

#### Promotion during jump chain
- If a piece reaches the back row during a jump sequence, it is **immediately** promoted to King, but its turn **ends** (it cannot continue jumping as a king in the same turn).

---

### 3.4 Valid Move Calculation

```typescript
function getCheckersValidMoves(
  board: CheckersBoardState,
  player: Player
): CheckersMove[] {
  // First: find all jump moves
  const jumps = findAllJumps(board, player);
  if (jumps.length > 0) return jumps; // Must jump if available
  // Otherwise: find all regular moves
  return findAllRegularMoves(board, player);
}

interface CheckersMove {
  from: [number, number];
  to: [number, number];
  captured?: [number, number][]; // positions of captured pieces
}
```

---

### 3.5 Win Condition

A player wins when:
1. The opponent has **no pieces left** on the board.
2. The opponent has **no valid moves** on their turn (all pieces are blocked).

---

### 3.6 AI Logic for Checkers

#### Easy (Random)
- Pick a random valid move (random jump if any, else random regular move).

#### Medium (Greedy)
- Priority order:
  1. Move that captures the most pieces.
  2. Move that promotes a piece to King.
  3. Move that advances a piece toward promotion.
  4. Random otherwise.

#### Hard (Minimax + Alpha-Beta, depth 4)
- Evaluate board state with scoring:
  - Normal piece: +3 per piece for AI, -3 per piece for opponent
  - King: +5 per king for AI, -5 per king for opponent
  - Advancement bonus: +0.1 × (row advancement toward promotion)
  - Center control: +0.2 for pieces on center 4 squares
- Alpha-beta pruning at depth 4.

---

## GAME 4 — Chess (Standard FIDE Rules — Simplified)

### 4.1 Overview

Standard chess on an 8×8 board. Player 1 controls **White** (starts at rows 6–7), Player 2 controls **Black** (starts at rows 0–1). White moves first. Win by **checkmate**.

---

### 4.2 Initial Board Setup

```
Row 0 (Black): R  N  B  Q  K  B  N  R
Row 1 (Black): P  P  P  P  P  P  P  P
Row 2–5:       .  .  .  .  .  .  .  .
Row 6 (White): P  P  P  P  P  P  P  P
Row 7 (White): R  N  B  Q  K  B  N  R
```

Player 1 = White (rows 6–7), Player 2 = Black (rows 0–1).

---

### 4.3 Piece Movement Rules

#### Pawn
- White pawns move **up** (row decreases). Black pawns move **down** (row increases).
- Move 1 square forward to an empty square.
- On first move, may move **2 squares forward** if both squares are empty.
- Captures **diagonally** 1 square forward.
- **En passant**: If opponent's pawn just moved 2 squares and lands beside this pawn, this pawn may capture it by moving diagonally behind it. Must be done **immediately** on the next turn.
- **Promotion**: When a pawn reaches the last rank (row 0 for White, row 7 for Black), it is **automatically promoted to Queen**.

#### Rook
- Moves any number of squares horizontally or vertically.
- Cannot jump over pieces.

#### Knight
- Moves in an **L-shape**: 2 squares in one direction + 1 square perpendicular.
- **Can jump** over other pieces.
- 8 possible target squares from any position.

#### Bishop
- Moves any number of squares diagonally.
- Cannot jump over pieces.
- Stays on its starting color forever.

#### Queen
- Combines Rook + Bishop movement. Any number of squares in all 8 directions.
- Cannot jump over pieces.

#### King
- Moves 1 square in any of the 8 directions.
- Cannot move into check.
- **Castling** (King-side and Queen-side):
  - Neither the king nor the chosen rook has moved.
  - No pieces between king and rook.
  - King is not currently in check.
  - King does not pass through or land on a square that is under attack.
  - King moves 2 squares toward the rook; rook jumps to the other side of the king.

---

### 4.4 Check, Checkmate, and Stalemate

- **Check**: The king is under attack by an opponent piece. The player must resolve check on their turn.
- **Checkmate**: The king is in check and there is no legal move to escape. **The player in checkmate loses.**
- **Stalemate**: The current player has no legal moves and is NOT in check. The game is a **draw**.
- **Insufficient material draw**: King vs King, King + Bishop vs King, King + Knight vs King → automatic draw.

---

### 4.5 Legal Move Generation

```typescript
function getLegalMoves(
  board: ChessBoardState,
  player: Player,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights
): ChessMove[] {
  // 1. Generate all pseudo-legal moves for player
  // 2. For each move, apply it on a temp board
  // 3. Check if the player's own king is in check after the move
  // 4. If yes → illegal move, discard
  // 5. Return only fully legal moves
}

interface ChessMove {
  from: [number, number];
  to: [number, number];
  promoteTo?: ChessPieceType;  // only for pawn promotion
  castling?: 'kingSide' | 'queenSide';
  enPassant?: boolean;
}
```

---

### 4.6 Pawn Promotion

- Automatically promote to **Queen** (no selection UI needed for simplicity).
- Update the board state immediately after the pawn reaches the last rank.

---

### 4.7 Display

- Use **Unicode chess symbols** for pieces (no image assets required):

```typescript
export const CHESS_UNICODE: Record<Player, Record<ChessPieceType, string>> = {
  1: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },  // White
  2: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },  // Black
};
```

---

### 4.8 AI Logic for Chess

#### Easy (Random)
- Pick a random legal move.

#### Medium (Piece Value Heuristic)
- Piece values: Pawn=1, Knight=3, Bishop=3, Rook=5, Queen=9, King=100.
- Select the move that maximizes (own piece value captured − own piece lost).
- If no capture, prefer moves that put the opponent in check.
- Otherwise, random.

#### Hard (Minimax + Alpha-Beta, depth 3)
- Evaluation function:
  - Sum of own piece values − sum of opponent piece values.
  - +0.5 for each pawn advanced past row 4 (for White) / row 3 (for Black).
  - +0.3 for center control (pieces attacking/occupying d4, d5, e4, e5).
  - +0.5 if opponent is in check.
  - +50 for checkmate.
- Alpha-beta pruning at depth 3.
- **Important:** At depth 3, move ordering helps performance — sort moves by captured piece value (descending) before recursing.

---

## General Utilities

### Deep Clone Board State

```typescript
function cloneBoard<T>(board: T[][]): T[][] {
  return board.map(row => [...row]);
}

function cloneArray<T>(arr: T[]): T[] {
  return [...arr];
}
```

### Check if Position is In Bounds

```typescript
function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}
```

### Detect if a Square is Attacked (for Chess check detection)

```typescript
function isSquareAttacked(
  board: ChessBoardState,
  row: number,
  col: number,
  byPlayer: Player
): boolean {
  // Check all opponent pieces and see if any can capture this square
  // Loop through all board positions, find byPlayer pieces, check their pseudo-legal moves
}
```

---

## Summary Table

| Game | Board | Win Condition | Draw Condition | AI Algorithm |
|------|-------|---------------|----------------|--------------|
| 3 Pions | 9-point graph | 3 in a line (8 lines) | No valid moves | Minimax depth 4 |
| Tic Tac Toe | 3×3 grid | 3 in a line (8 lines) | Board full, no winner | Perfect Minimax |
| Checkers | 8×8 | No opponent pieces/moves | — | Minimax + α-β depth 4 |
| Chess | 8×8 | Checkmate | Stalemate / Insufficient material | Minimax + α-β depth 3 |
