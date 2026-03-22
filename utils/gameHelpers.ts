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

// 3 Pions - Winning lines
export const TROIS_PIONS_WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
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
