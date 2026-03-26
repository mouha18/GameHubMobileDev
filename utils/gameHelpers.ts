// Deep clone utility for immutability
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 3 Pions - Adjacency map
export const TROIS_PIONS_ADJACENCY: number[][] = [
  [1, 3, 4],
  [0, 2, 4],
  [1, 4, 5],
  [0, 4, 6],
  [0, 1, 2, 3, 5, 6, 7, 8],
  [2, 4, 8],
  [3, 4, 7],
  [4, 6, 8],
  [4, 5, 7],
];

// 3 Pions - Winning lines (for grid layout - rows, columns, diagonals)
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

// Tic Tac Toe - Winning lines
export const TTT_WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Check if a player has won (3 Pions)
export function checkTroisPionsWin(
  board: (1 | 2 | null)[],
  player: 1 | 2
): boolean {
  return TROIS_PIONS_WIN_LINES.some((line) =>
    line.every((pos) => board[pos] === player)
  );
}

// Check if a player has won (Tic Tac Toe)
export function checkTTTWin(
  board: (1 | 2 | null)[],
  player: 1 | 2
): boolean {
  return TTT_WIN_LINES.some((line) =>
    line.every((i) => board[i] === player)
  );
}

// Check for draw (Tic Tac Toe)
export function checkTTTDraw(board: (1 | 2 | null)[]): boolean {
  return board.every((cell) => cell !== null);
}

// Get empty positions on board
export function getEmptyPositions(board: (1 | 2 | null)[]): number[] {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

// Check for stalemate in 3 Pions (movement phase)
export function checkTroisPionsStalemate(
  board: (1 | 2 | null)[],
  player: 1 | 2
): boolean {
  // Get all valid moves for the player
  const playerPieces = board
    .map((cell, index) => (cell === player ? index : -1))
    .filter((index) => index !== -1);
  
  // If player has no pieces, it's not a stalemate (they lost)
  if (playerPieces.length === 0) return false;
  
  // Check if any piece can move
  for (const from of playerPieces) {
    const adjacentPositions = TROIS_PIONS_ADJACENCY[from];
    for (const to of adjacentPositions) {
      if (board[to] === null) {
        return false; // At least one valid move exists
      }
    }
  }
  
  // No valid moves found - stalemate
  return true;
}
