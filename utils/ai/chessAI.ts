import { Player, Difficulty, ChessBoardState, ChessMove, ChessPiece, ChessPieceType } from '../../types';

// Check if a position is on the board
function isOnBoard(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Get piece value for evaluation
function getPieceValue(piece: ChessPiece): number {
  const values: Record<ChessPieceType, number> = {
    pawn: 10,
    knight: 30,
    bishop: 30,
    rook: 50,
    queen: 90,
    king: 900,
  };
  return values[piece.type];
}

// Create initial chess board
export function createInitialChessBoard(): ChessBoardState {
  const board: ChessBoardState = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const backRank: ChessPieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  for (let col = 0; col < 8; col++) {
    // Black pieces (row 0-1)
    board[0][col] = { player: 2, type: backRank[col], hasMoved: false };
    board[1][col] = { player: 2, type: 'pawn', hasMoved: false };

    // White pieces (row 6-7)
    board[6][col] = { player: 1, type: 'pawn', hasMoved: false };
    board[7][col] = { player: 1, type: backRank[col], hasMoved: false };
  }

  return board;
}

// Find king position
function findKing(board: ChessBoardState, player: Player): [number, number] | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player && piece.type === 'king') {
        return [row, col];
      }
    }
  }
  return null;
}

// Check if a square is under attack
function isSquareAttacked(
  board: ChessBoardState,
  row: number,
  col: number,
  byPlayer: Player
): boolean {
  // Check pawn attacks
  const pawnDirection = byPlayer === 1 ? 1 : -1;
  const pawnRow = row - pawnDirection;
  if (isOnBoard(pawnRow, col - 1)) {
    const piece = board[pawnRow][col - 1];
    if (piece && piece.player === byPlayer && piece.type === 'pawn') return true;
  }
  if (isOnBoard(pawnRow, col + 1)) {
    const piece = board[pawnRow][col + 1];
    if (piece && piece.player === byPlayer && piece.type === 'pawn') return true;
  }

  // Check knight attacks
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightMoves) {
    const nr = row + dr;
    const nc = col + dc;
    if (isOnBoard(nr, nc)) {
      const piece = board[nr][nc];
      if (piece && piece.player === byPlayer && piece.type === 'knight') return true;
    }
  }

  // Check rook/queen attacks (straight lines)
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (const [dr, dc] of directions) {
    let nr = row + dr;
    let nc = col + dc;
    while (isOnBoard(nr, nc)) {
      const piece = board[nr][nc];
      if (piece) {
        if (piece.player === byPlayer && (piece.type === 'rook' || piece.type === 'queen')) {
          return true;
        }
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  // Check bishop/queen attacks (diagonals)
  const diagDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (const [dr, dc] of diagDirections) {
    let nr = row + dr;
    let nc = col + dc;
    while (isOnBoard(nr, nc)) {
      const piece = board[nr][nc];
      if (piece) {
        if (piece.player === byPlayer && (piece.type === 'bishop' || piece.type === 'queen')) {
          return true;
        }
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  // Check king attacks
  const kingMoves = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
  for (const [dr, dc] of kingMoves) {
    const nr = row + dr;
    const nc = col + dc;
    if (isOnBoard(nr, nc)) {
      const piece = board[nr][nc];
      if (piece && piece.player === byPlayer && piece.type === 'king') return true;
    }
  }

  return false;
}

// Check if player is in check
function isInCheck(board: ChessBoardState, player: Player): boolean {
  const kingPos = findKing(board, player);
  if (!kingPos) return false;
  const opponent: Player = player === 1 ? 2 : 1;
  return isSquareAttacked(board, kingPos[0], kingPos[1], opponent);
}

// Get pseudo-legal moves for a piece (doesn't check for leaving king in check)
function getPseudoLegalMoves(
  board: ChessBoardState,
  row: number,
  col: number,
  player: Player,
  enPassantTarget: [number, number] | null,
  castlingRights: { 1: { kingSide: boolean; queenSide: boolean }; 2: { kingSide: boolean; queenSide: boolean } }
): ChessMove[] {
  const piece = board[row][col];
  if (!piece || piece.player !== player) return [];

  const moves: ChessMove[] = [];

  switch (piece.type) {
    case 'pawn': {
      const direction = player === 1 ? -1 : 1;
      const startRow = player === 1 ? 6 : 1;
      const promotionRow = player === 1 ? 0 : 7;

      // Forward move
      const newRow = row + direction;
      if (isOnBoard(newRow, col) && board[newRow][col] === null) {
        if (newRow === promotionRow) {
          moves.push({ from: [row, col], to: [newRow, col], promoteTo: 'queen' });
        } else {
          moves.push({ from: [row, col], to: [newRow, col] });
        }

        // Double move from start
        if (row === startRow && board[row + 2 * direction][col] === null) {
          moves.push({ from: [row, col], to: [row + 2 * direction, col] });
        }
      }

      // Captures
      for (const dc of [-1, 1]) {
        const captureCol = col + dc;
        if (isOnBoard(newRow, captureCol)) {
          const target = board[newRow][captureCol];
          if (target && target.player !== player) {
            if (newRow === promotionRow) {
              moves.push({ from: [row, col], to: [newRow, captureCol], promoteTo: 'queen' });
            } else {
              moves.push({ from: [row, col], to: [newRow, captureCol] });
            }
          }
          // En passant
          if (enPassantTarget && enPassantTarget[0] === newRow && enPassantTarget[1] === captureCol) {
            moves.push({ from: [row, col], to: [newRow, captureCol], enPassant: true });
          }
        }
      }
      break;
    }

    case 'knight': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightMoves) {
        const nr = row + dr;
        const nc = col + dc;
        if (isOnBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.player !== player) {
            moves.push({ from: [row, col], to: [nr, nc] });
          }
        }
      }
      break;
    }

    case 'bishop': {
      const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, dc] of directions) {
        let nr = row + dr;
        let nc = col + dc;
        while (isOnBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target) {
            moves.push({ from: [row, col], to: [nr, nc] });
          } else {
            if (target.player !== player) {
              moves.push({ from: [row, col], to: [nr, nc] });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'rook': {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dr, dc] of directions) {
        let nr = row + dr;
        let nc = col + dc;
        while (isOnBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target) {
            moves.push({ from: [row, col], to: [nr, nc] });
          } else {
            if (target.player !== player) {
              moves.push({ from: [row, col], to: [nr, nc] });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'queen': {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, dc] of directions) {
        let nr = row + dr;
        let nc = col + dc;
        while (isOnBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target) {
            moves.push({ from: [row, col], to: [nr, nc] });
          } else {
            if (target.player !== player) {
              moves.push({ from: [row, col], to: [nr, nc] });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;
    }

    case 'king': {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;
        if (isOnBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.player !== player) {
            moves.push({ from: [row, col], to: [nr, nc] });
          }
        }
      }

      // Castling
      if (!piece.hasMoved && !isInCheck(board, player)) {
        const rights = castlingRights[player];
        const kingRow = player === 1 ? 7 : 0;

        // King-side castling
        if (rights.kingSide) {
          if (board[kingRow][5] === null && board[kingRow][6] === null) {
            if (!isSquareAttacked(board, kingRow, 5, player === 1 ? 2 : 1) &&
                !isSquareAttacked(board, kingRow, 6, player === 1 ? 2 : 1)) {
              moves.push({ from: [row, col], to: [kingRow, 6], castling: 'kingSide' });
            }
          }
        }

        // Queen-side castling
        if (rights.queenSide) {
          if (board[kingRow][1] === null && board[kingRow][2] === null && board[kingRow][3] === null) {
            if (!isSquareAttacked(board, kingRow, 3, player === 1 ? 2 : 1) &&
                !isSquareAttacked(board, kingRow, 2, player === 1 ? 2 : 1)) {
              moves.push({ from: [row, col], to: [kingRow, 2], castling: 'queenSide' });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

// Get all legal moves for a player
export function getChessValidMoves(
  board: ChessBoardState,
  player: Player,
  enPassantTarget: [number, number] | null,
  castlingRights: { 1: { kingSide: boolean; queenSide: boolean }; 2: { kingSide: boolean; queenSide: boolean } }
): ChessMove[] {
  const pseudoMoves: ChessMove[] = [];

  // Get all pseudo-legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const moves = getPseudoLegalMoves(board, row, col, player, enPassantTarget, castlingRights);
      pseudoMoves.push(...moves);
    }
  }

  // Filter out moves that leave king in check
  const legalMoves: ChessMove[] = [];
  for (const move of pseudoMoves) {
    // Create a copy of the board
    const newBoard = board.map((r) => [...r]) as ChessBoardState;
    const piece = newBoard[move.from[0]][move.from[1]];

    // Apply move
    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = null;

    // Handle en passant capture
    if (move.enPassant) {
      const capturedRow = move.from[0];
      newBoard[capturedRow][move.to[1]] = null;
    }

    // Check if king is in check after move
    if (!isInCheck(newBoard, player)) {
      legalMoves.push(move);
    }
  }

  return legalMoves;
}

// Check for checkmate or stalemate
export function getGameStatus(
  board: ChessBoardState,
  player: Player,
  enPassantTarget: [number, number] | null,
  castlingRights: { 1: { kingSide: boolean; queenSide: boolean }; 2: { kingSide: boolean; queenSide: boolean } }
): { status: 'playing' | 'checkmate' | 'stalemate'; winner: Player | 'draw' | null } {
  const moves = getChessValidMoves(board, player, enPassantTarget, castlingRights);
  const inCheck = isInCheck(board, player);

  if (moves.length === 0) {
    if (inCheck) {
      return { status: 'checkmate', winner: player === 1 ? 2 : 1 };
    } else {
      return { status: 'stalemate', winner: 'draw' };
    }
  }

  return { status: 'playing', winner: null };
}

// Evaluate board state for minimax
function evaluateChessBoard(board: ChessBoardState, aiPlayer: Player): number {
  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const value = getPieceValue(piece);
      const positionBonus = getPositionBonus(piece, row, col);

      if (piece.player === aiPlayer) {
        score += value + positionBonus;
      } else {
        score -= value + positionBonus;
      }
    }
  }

  return score;
}

// Position bonuses for pieces (simplified)
function getPositionBonus(piece: ChessPiece, row: number, col: number): number {
  // Simplified position tables
  const pawnBonus = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const knightBonus = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ];

  const pieceRow = piece.player === 1 ? row : 7 - row;

  switch (piece.type) {
    case 'pawn':
      return pawnBonus[pieceRow][col];
    case 'knight':
      return knightBonus[pieceRow][col];
    default:
      return 0;
  }
}

// Easy: Random move
export function getEasyChessMove(
  board: ChessBoardState,
  player: Player,
  enPassantTarget: [number, number] | null,
  castlingRights: { 1: { kingSide: boolean; queenSide: boolean }; 2: { kingSide: boolean; queenSide: boolean } }
): ChessMove | null {
  const moves = getChessValidMoves(board, player, enPassantTarget, castlingRights);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// Medium: Basic piece value heuristic
export function getMediumChessMove(
  board: ChessBoardState,
  player: Player,
  enPassantTarget: [number, number] | null,
  castlingRights: { 1: { kingSide: boolean; queenSide: boolean }; 2: { kingSide: boolean; queenSide: boolean } }
): ChessMove | null {
  const moves = getChessValidMoves(board, player, enPassantTarget, castlingRights);
  if (moves.length === 0) return null;

  // Sort by captured piece value
  const scoredMoves = moves.map((move) => {
    const target = board[move.to[0]][move.to[1]];
    return {
      move,
      score: target ? getPieceValue(target) : 0,
    };
  });

  scoredMoves.sort((a, b) => b.score - a.score);

  // Add some randomness among equal scores
  const topScore = scoredMoves[0].score;
  const topMoves = scoredMoves.filter((m) => m.score === topScore);
  return topMoves[Math.floor(Math.random() * topMoves.length)].move;
}

// Hard: Minimax with alpha-beta pruning
function minimaxChess(
  board: ChessBoardState,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  alpha: number,
  beta: number,
  enPassantTarget: [number, number] | null,
  castlingRights: { 1: { kingSide: boolean; queenSide: boolean }; 2: { kingSide: boolean; queenSide: boolean } }
): number {
  if (depth === 0) {
    return evaluateChessBoard(board, aiPlayer);
  }

  const currentPlayer = isMaximizing ? aiPlayer : (aiPlayer === 1 ? 2 : 1);
  const moves = getChessValidMoves(board, currentPlayer, enPassantTarget, castlingRights);

  if (moves.length === 0) {
    if (isInCheck(board, currentPlayer)) {
      return isMaximizing ? -10000 : 10000;
    }
    return 0;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = board.map((r) => [...r]) as ChessBoardState;
      const piece = newBoard[move.from[0]][move.from[1]]!;

      newBoard[move.to[0]][move.to[1]] = piece;
      newBoard[move.from[0]][move.from[1]] = null;

      // Handle en passant
      let newEnPassant: [number, number] | null = null;
      if (move.enPassant) {
        const capturedRow = move.from[0];
        newBoard[capturedRow][move.to[1]] = null;
      }

      // Handle pawn double move
      if (piece.type === 'pawn' && Math.abs(move.to[0] - move.from[0]) === 2) {
        newEnPassant = [(move.from[0] + move.to[0]) / 2, move.from[1]];
      }

      // Handle promotion
      if (move.promoteTo) {
        piece.type = move.promoteTo;
      }

      // Handle castling
      let newCastling = { ...castlingRights };
      if (move.castling) {
        const rookFromCol = move.castling === 'kingSide' ? 7 : 0;
        const rookToCol = move.castling === 'kingSide' ? 5 : 3;
        const rook = newBoard[move.from[0]][rookFromCol];
        newBoard[move.from[0]][rookToCol] = rook;
        newBoard[move.from[0]][rookFromCol] = null;
        if (rook) rook.hasMoved = true;
      }

      // Update castling rights if king or rook moves
      if (piece.type === 'king' || piece.type === 'rook') {
        piece.hasMoved = true;
      }

      const evalScore = minimaxChess(newBoard, depth - 1, false, aiPlayer, alpha, beta, newEnPassant, newCastling);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = board.map((r) => [...r]) as ChessBoardState;
      const piece = newBoard[move.from[0]][move.from[1]]!;

      newBoard[move.to[0]][move.to[1]] = piece;
      newBoard[move.from[0]][move.from[1]] = null;

      let newEnPassant: [number, number] | null = null;
      if (move.enPassant) {
        const capturedRow = move.from[0];
        newBoard[capturedRow][move.to[1]] = null;
      }

      if (piece.type === 'pawn' && Math.abs(move.to[0] - move.from[0]) === 2) {
        newEnPassant = [(move.from[0] + move.to[0]) / 2, move.from[1]];
      }

      if (move.promoteTo) {
        piece.type = move.promoteTo;
      }

      let newCastling = { ...castlingRights };
      if (move.castling) {
        const rookFromCol = move.castling === 'kingSide' ? 7 : 0;
        const rookToCol = move.castling === 'kingSide' ? 5 : 3;
        const rook = newBoard[move.from[0]][rookFromCol];
        newBoard[move.from[0]][rookToCol] = rook;
        newBoard[move.from[0]][rookFromCol] = null;
        if (rook) rook.hasMoved = true;
      }

      if (piece.type === 'king' || piece.type === 'rook') {
        piece.hasMoved = true;
      }

      const evalScore = minimaxChess(newBoard, depth - 1, true, aiPlayer, alpha, beta, newEnPassant, newCastling);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getHardChessMove(
  board: ChessBoardState,
  aiPlayer: Player,
  enPassantTarget: [number, number] | null,
  castlingRights: { 1: { kingSide: boolean; queenSide: boolean }; 2: { kingSide: boolean; queenSide: boolean } }
): ChessMove | null {
  const moves = getChessValidMoves(board, aiPlayer, enPassantTarget, castlingRights);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const newBoard = board.map((r) => [...r]) as ChessBoardState;
    const piece = newBoard[move.from[0]][move.from[1]]!;

    newBoard[move.to[0]][move.to[1]] = piece;
    newBoard[move.from[0]][move.from[1]] = null;

    let newEnPassant: [number, number] | null = null;
    if (move.enPassant) {
      const capturedRow = move.from[0];
      newBoard[capturedRow][move.to[1]] = null;
    }

    if (piece.type === 'pawn' && Math.abs(move.to[0] - move.from[0]) === 2) {
      newEnPassant = [(move.from[0] + move.to[0]) / 2, move.from[1]];
    }

    if (move.promoteTo) {
      piece.type = move.promoteTo;
    }

    let newCastling = { ...castlingRights };
    if (move.castling) {
      const rookFromCol = move.castling === 'kingSide' ? 7 : 0;
      const rookToCol = move.castling === 'kingSide' ? 5 : 3;
      const rook = newBoard[move.from[0]][rookFromCol];
      newBoard[move.from[0]][rookToCol] = rook;
      newBoard[move.from[0]][rookFromCol] = null;
      if (rook) rook.hasMoved = true;
    }

    if (piece.type === 'king' || piece.type === 'rook') {
      piece.hasMoved = true;
    }

    const score = minimaxChess(newBoard, 2, false, aiPlayer, -Infinity, Infinity, newEnPassant, newCastling);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getAIChessMove(
  board: ChessBoardState,
  difficulty: Difficulty,
  aiPlayer: Player,
  enPassantTarget: [number, number] | null,
  castlingRights: { 1: { kingSide: boolean; queenSide: boolean }; 2: { kingSide: boolean; queenSide: boolean } }
): ChessMove | null {
  switch (difficulty) {
    case 'easy':
      return getEasyChessMove(board, aiPlayer, enPassantTarget, castlingRights);
    case 'medium':
      return getMediumChessMove(board, aiPlayer, enPassantTarget, castlingRights);
    case 'hard':
      return getHardChessMove(board, aiPlayer, enPassantTarget, castlingRights);
    default:
      return getEasyChessMove(board, aiPlayer, enPassantTarget, castlingRights);
  }
}
