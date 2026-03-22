import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONT_SIZES, CHESS_PIECES } from '../../../constants/theme';
import { Player, ChessPiece, ChessMove } from '../../../types';

interface ChessBoardProps {
  board: (ChessPiece | null)[][];
  selectedSquare: [number, number] | null;
  validMoves: ChessMove[];
  onSquarePress: (row: number, col: number) => void;
  disabled: boolean;
  isCheck: boolean;
  playerSide?: Player;
}

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 32, 320);
const CELL_SIZE = BOARD_SIZE / 8;

const COLUMNS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ROWS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function ChessBoard({
  board,
  selectedSquare,
  validMoves,
  onSquarePress,
  disabled,
  isCheck,
  playerSide,
}: ChessBoardProps) {
  // Rotate board if player is side 2 (black plays from bottom)
  const rotated = playerSide === 2;
  const isSelected = (row: number, col: number) => {
    return selectedSquare?.[0] === row && selectedSquare?.[1] === col;
  };

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(
      (move) => move.to[0] === row && move.to[1] === col
    );
  };

  const getPieceSymbol = (piece: ChessPiece): string => {
    const color = piece.player === 1 ? 'white' : 'black';
    return CHESS_PIECES[color][piece.type];
  };

  const isKingInCheck = (row: number, col: number): boolean => {
    return isCheck && selectedSquare === null && board[row][col]?.type === 'king';
  };

  // Get rows in correct order based on player side
  const rows = rotated ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = rotated ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const renderSquare = (row: number, col: number) => {
    // When rotated, flip the indices
    const actualRow = rotated ? 7 - row : row;
    const actualCol = rotated ? 7 - col : col;
    const isDark = (actualRow + actualCol) % 2 === 1;
    const piece = board[row][col];
    const isSelectedSquare = isSelected(row, col);
    const isValidSquare = isValidMove(row, col);
    const inCheck = isKingInCheck(row, col);
    const isCapture = isValidSquare && piece !== null;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.square,
          isDark ? styles.darkSquare : styles.lightSquare,
          isSelectedSquare && styles.selectedSquare,
          inCheck && styles.checkSquare,
        ]}
        onPress={() => !disabled && onSquarePress(row, col)}
        disabled={disabled}
      >
        {piece && (
          <Text
            style={[
              styles.piece,
              piece.player === 1 ? styles.whitePiece : styles.blackPiece,
            ]}
          >
            {getPieceSymbol(piece)}
          </Text>
        )}
        {isValidSquare && !piece && (
          <View style={styles.validMoveDot} />
        )}
        {isValidSquare && isCapture && (
          <View style={styles.captureIndicator} />
        )}
        {col === 0 && (
          <Text style={styles.rowLabel}>{ROWS[row]}</Text>
        )}
        {row === 7 && (
          <Text style={styles.colLabel}>{COLUMNS[col]}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderRow = (row: number) => {
    return (
      <View key={row} style={styles.row}>
        {cols.map((col) => renderSquare(row, col))}
      </View>
    );
  };

  return (
    <View style={[styles.board, rotated && styles.rotatedBoard]}>
      {rows.map((row) => renderRow(row))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.boardLine,
  },
  rotatedBoard: {
    transform: [{ rotate: '180deg' }],
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  square: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lightSquare: {
    backgroundColor: COLORS.boardLight,
  },
  darkSquare: {
    backgroundColor: COLORS.boardDark,
  },
  selectedSquare: {
    backgroundColor: 'rgba(79, 195, 247, 0.5)',
  },
  checkSquare: {
    backgroundColor: COLORS.accent,
  },
  piece: {
    fontSize: CELL_SIZE * 0.7,
  },
  whitePiece: {
    color: '#ffffff',
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  blackPiece: {
    color: '#1a1a1a',
  },
  validMoveDot: {
    position: 'absolute',
    width: CELL_SIZE * 0.25,
    height: CELL_SIZE * 0.25,
    borderRadius: (CELL_SIZE * 0.25) / 2,
    backgroundColor: COLORS.success,
    opacity: 0.7,
  },
  captureIndicator: {
    position: 'absolute',
    width: CELL_SIZE * 0.9,
    height: CELL_SIZE * 0.9,
    borderRadius: (CELL_SIZE * 0.9) / 2,
    borderWidth: 3,
    borderColor: COLORS.accent,
  },
  rowLabel: {
    position: 'absolute',
    left: 2,
    top: 2,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  colLabel: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});
