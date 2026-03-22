import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../../constants/theme';
import { Player } from '../../../types';

interface TroisPionsBoardProps {
  board: (Player | null)[];
  selectedPosition: number | null;
  validMoves: number[];
  onPositionPress: (index: number) => void;
  disabled: boolean;
  phase: 'placement' | 'movement';
}

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 32, 300);
const POSITION_SIZE = 40;

// Position coordinates (as percentage of board size)
const POSITIONS = [
  { x: 0.1, y: 0.1 }, // 0: Top-Left
  { x: 0.5, y: 0.1 }, // 1: Top-Middle
  { x: 0.9, y: 0.1 }, // 2: Top-Right
  { x: 0.1, y: 0.5 }, // 3: Middle-Left
  { x: 0.5, y: 0.5 }, // 4: Center
  { x: 0.9, y: 0.5 }, // 5: Middle-Right
  { x: 0.1, y: 0.9 }, // 6: Bottom-Left
  { x: 0.5, y: 0.9 }, // 7: Bottom-Middle
  { x: 0.9, y: 0.9 }, // 8: Bottom-Right
];

// Lines connecting positions
const LINES: [number, number][] = [
  [0, 1], [1, 2],
  [3, 4], [4, 5],
  [6, 7],
  [0, 3], [3, 6],
  [1, 4], [4, 7],
  [2, 5], [5, 8],
  [0, 4], [4, 6],
  [2, 4], [4, 8],
];

interface LineProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

// Helper to calculate line properties
function getLineStyle(start: { x: number; y: number }, end: { x: number; y: number }): {
  left: number;
  top: number;
  width: number;
  height: number;
  transform: { rotate: string }[];
} {
  // Calculate center positions (add half of position size)
  const startX = start.x * BOARD_SIZE + POSITION_SIZE / 2;
  const startY = start.y * BOARD_SIZE + POSITION_SIZE / 2;
  const endX = end.x * BOARD_SIZE + POSITION_SIZE / 2;
  const endY = end.y * BOARD_SIZE + POSITION_SIZE / 2;

  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    left: startX,
    top: startY,
    width: length,
    height: 3,
    transform: [{ rotate: `${angle}deg` }],
  };
}

function renderLine(line: [number, number], index: number): React.ReactNode {
  const start = POSITIONS[line[0]];
  const end = POSITIONS[line[1]];
  const lineStyle = getLineStyle(start, end);

  return (
    <View
      key={`line-${index}`}
      style={[
        styles.line,
        {
          left: lineStyle.left - 1.5,
          top: lineStyle.top - 1.5,
          width: lineStyle.width,
          height: lineStyle.height,
          transform: lineStyle.transform,
        },
      ]}
    />
  );
}

export function TroisPionsBoard({
  board,
  selectedPosition,
  validMoves,
  onPositionPress,
  disabled,
  phase,
}: TroisPionsBoardProps) {
  const renderPosition = (index: number) => {
    const pos = POSITIONS[index];
    const value = board[index];
    const isSelected = selectedPosition === index;
    const isValidMove = validMoves.includes(index);
    const isEmpty = value === null;

    let pieceColor = null;
    if (value === 1) pieceColor = COLORS.player1;
    else if (value === 2) pieceColor = COLORS.player2;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.position,
          {
            left: pos.x * BOARD_SIZE - POSITION_SIZE / 2,
            top: pos.y * BOARD_SIZE - POSITION_SIZE / 2,
          },
          isSelected && styles.selectedPosition,
          isValidMove && !isEmpty && styles.invalidPosition,
        ]}
        onPress={() => !disabled && onPositionPress(index)}
        disabled={disabled || (phase === 'movement' && !isEmpty && value !== board[selectedPosition ?? -1])}
      >
        {isValidMove && isEmpty && phase === 'movement' && (
          <View style={styles.validMoveIndicator} />
        )}
        {pieceColor && (
          <View
            style={[
              styles.piece,
              { backgroundColor: pieceColor },
              isSelected && styles.selectedPiece,
            ]}
          />
        )}
        {!pieceColor && (
          <View style={styles.emptyPosition} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Render positions first (below lines) */}
      {POSITIONS.map((_, index) => renderPosition(index))}
      {/* Render board lines on top */}
      {LINES.map((line, index) => renderLine(line, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    backgroundColor: COLORS.boardLine,
    zIndex: 1,
  },
  position: {
    position: 'absolute',
    width: POSITION_SIZE,
    height: POSITION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  emptyPosition: {
    width: POSITION_SIZE - 10,
    height: POSITION_SIZE - 10,
    borderRadius: (POSITION_SIZE - 10) / 2,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    borderStyle: 'dashed',
  },
  piece: {
    width: POSITION_SIZE - 8,
    height: POSITION_SIZE - 8,
    borderRadius: (POSITION_SIZE - 8) / 2,
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
  },
  selectedPiece: {
    borderWidth: 4,
    borderColor: COLORS.accent,
  },
  selectedPosition: {
    transform: [{ scale: 1.1 }],
  },
  invalidPosition: {
    opacity: 0.5,
  },
  validMoveIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    opacity: 0.5,
  },
});
