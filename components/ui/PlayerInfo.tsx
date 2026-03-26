import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
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
        <MaterialCommunityIcons
          name={isAI ? 'robot' : 'account'}
          size={24}
          color={COLORS.background}
        />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {isAI && (
          <View style={styles.aiBadge}>
            <MaterialCommunityIcons
              name="brain"
              size={10}
              color={COLORS.accent}
            />
            <Text style={styles.aiLabel}>AI</Text>
          </View>
        )}
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color: playerColor }]}>{score}</Text>
        {isActive && (
          <Text style={styles.scoreLabel}>Wins</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
  },
  activeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inactiveContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.7,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  aiLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  score: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});
