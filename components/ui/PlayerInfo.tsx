import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { Player } from '../../types';

interface PlayerInfoProps {
  name: string;
  score: number;
  player: Player;
  isActive: boolean;
  isAI?: boolean;
}

export function PlayerInfo({
  name,
  score,
  player,
  isActive,
  isAI = false,
}: PlayerInfoProps) {
  const playerColor = player === 1 ? COLORS.player1 : COLORS.player2;

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: isActive ? playerColor : 'transparent' },
        isActive ? styles.activeContainer : styles.inactiveContainer,
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: playerColor }]}>
        <Text style={styles.avatarText}>
          {isAI ? '🤖' : player === 1 ? '👤' : '👤'}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {isAI && <Text style={styles.aiLabel}>AI</Text>}
      </View>
      <Text style={[styles.score, { color: playerColor }]}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    borderLeftWidth: 3,
  },
  activeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inactiveContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.7,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  aiLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  score: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
});
