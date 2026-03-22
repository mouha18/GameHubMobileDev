import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONT_SIZES } from '../../../constants/theme';
import { Player } from '../../../types';

interface TicTacToeBoardProps {
  board: (Player | null)[];
  onCellPress: (index: number) => void;
  disabled: boolean;
  winningLine: number[] | null;
}

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 32, 300);
const CELL_SIZE = BOARD_SIZE / 3;

export function TicTacToeBoard({
  board,
  onCellPress,
  disabled,
  winningLine,
}: TicTacToeBoardProps) {
  const renderCell = (index: number) => {
    const value = board[index];
    const isWinningCell = winningLine?.includes(index);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.cell,
          isWinningCell && styles.winningCell,
        ]}
        onPress={() => !disabled && value === null && onCellPress(index)}
        disabled={disabled || value !== null}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.cellText,
            value === 1 ? styles.xText : styles.oText,
            isWinningCell && styles.winningText,
          ]}
        >
          {value === 1 ? '×' : value === 2 ? '○' : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.board}>
      <View style={styles.row}>
        {[0, 1, 2].map((i) => renderCell(i))}
      </View>
      <View style={styles.row}>
        {[3, 4, 5].map((i) => renderCell(i))}
      </View>
      <View style={styles.row}>
        {[6, 7, 8].map((i) => renderCell(i))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 8,
    padding: 2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    backgroundColor: COLORS.surface,
    margin: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winningCell: {
    backgroundColor: COLORS.success,
  },
  cellText: {
    fontSize: FONT_SIZES.xxl * 1.5,
    fontWeight: 'bold',
  },
  xText: {
    color: COLORS.player1,
  },
  oText: {
    color: COLORS.player2,
  },
  winningText: {
    color: COLORS.textPrimary,
  },
});
