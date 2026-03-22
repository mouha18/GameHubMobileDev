import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONT_SIZES } from '../../../constants/theme';
import { Player, CheckersPiece, CheckersMove } from '../../../types';

interface CheckersBoardProps {
  board: (CheckersPiece | null)[][];
  selectedSquare: [number, number] | null;
  validMoves: CheckersMove[];
  onSquarePress: (row: number, col: number) => void;
  disabled: boolean;
  playerSide?: Player;
}

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 32, 320);
const CELL_SIZE = BOARD_SIZE / 8;

export function CheckersBoard({
  board,
  selectedSquare,
  validMoves,
  onSquarePress,
  disabled,
  playerSide,
}: CheckersBoardProps) {
  // Rotate board if player is side 2 (black) - but only in PvC mode
  // Player 1 = White (at bottom), Player 2 = Black (at top)
  // Rotate only when human plays as Black (playerSide === 2) in PvC
  const rotated = playerSide === 2;

  const isSelected = (row: number, col: number) => {
    return selectedSquare?.[0] === row && selectedSquare?.[1] === col;
  };

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(
      (move) => move.to[0] === row && move.to[1] === col
    );
  };

  const getValidMoveCapture = (row: number, col: number) => {
    const move = validMoves.find(
      (m) => m.to[0] === row && m.to[1] === col && m.captured
    );
    return move?.captured;
  };

  // Get rows in correct order based on player side
  const rows = rotated ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = rotated ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const renderSquare = (row: number, col: number) => {
    // When rotated, flip the indices
    const actualRow = rotated ? 7 - row : row;
    const actualCol = rotated ? 7 - col : col;
    const isDark = (actualRow + actualCol) % 2 === 1;
    const piece = board[actualRow][actualCol];
    const isSelectedSquare = isSelected(row, col);
    const isValidSquare = isValidMove(row, col);
    const capturedPieces = getValidMoveCapture(row, col);

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.square,
          isDark ? styles.darkSquare : styles.lightSquare,
          isSelectedSquare && styles.selectedSquare,
          isValidSquare && styles.validMoveSquare,
        ]}
        onPress={() => !disabled && onSquarePress(row, col)}
        disabled={disabled}
      >
        {piece && (
          <View
            style={[
              styles.piece,
              piece.player === 1 ? styles.lightPiece : styles.darkPiece,
              piece.type === 'king' && styles.kingPiece,
            ]}
          >
            {piece.type === 'king' && (
              <Text style={styles.kingSymbol}>♛</Text>
            )}
          </View>
        )}
        {isValidSquare && !piece && (
          <View style={styles.validMoveDot} />
        )}
        {capturedPieces && capturedPieces.length > 0 && (
          <View style={styles.captureIndicator} />
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
  },
  lightSquare: {
    backgroundColor: COLORS.boardLight,
  },
  darkSquare: {
    backgroundColor: COLORS.boardDark,
  },
  selectedSquare: {
    backgroundColor: COLORS.accent,
  },
  validMoveSquare: {
    backgroundColor: 'rgba(102, 187, 106, 0.3)',
  },
  piece: {
    width: CELL_SIZE * 0.8,
    height: CELL_SIZE * 0.8,
    borderRadius: (CELL_SIZE * 0.8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  darkPiece: {
    backgroundColor: COLORS.darkPiece,
    borderColor: '#555',
  },
  lightPiece: {
    backgroundColor: COLORS.lightPiece,
    borderColor: '#ccc',
  },
  kingPiece: {
    borderColor: COLORS.kingGold,
    borderWidth: 3,
  },
  kingSymbol: {
    fontSize: CELL_SIZE * 0.5,
    color: COLORS.kingGold,
  },
  validMoveDot: {
    width: CELL_SIZE * 0.25,
    height: CELL_SIZE * 0.25,
    borderRadius: (CELL_SIZE * 0.25) / 2,
    backgroundColor: COLORS.success,
    opacity: 0.7,
  },
  captureIndicator: {
    position: 'absolute',
    width: CELL_SIZE * 0.3,
    height: CELL_SIZE * 0.3,
    borderRadius: (CELL_SIZE * 0.3) / 2,
    backgroundColor: COLORS.accent,
  },
});
