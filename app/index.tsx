import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Card } from '../components/ui/Card';
import { GAMES } from '../constants/games';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { GameId } from '../types';

const { width } = Dimensions.get('window');

function AnimatedHeader() {
  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={styles.header}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.titleGlow}>GAME</Text>
        <Text style={styles.titleHUB}>HUB</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.subtitle}>Choose your game</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const handleGamePress = (gameId: GameId) => {
    router.push(`/game/${gameId}/setup`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AnimatedHeader />

        <View style={styles.grid}>
          {GAMES.map((game, index) => (
            <View key={game.id} style={styles.cardWrapper}>
              <Card
                title={game.name}
                category={game.category}
                icon={game.icon}
                onPress={() => handleGamePress(game.id)}
              />
            </View>
          ))}
        </View>

        <Animated.View entering={FadeIn.delay(600).duration(300)} style={styles.footer}>
          <Text style={styles.footerText}>Tap a game to start playing</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  titleGlow: {
    fontSize: FONT_SIZES.xxl + 8,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 4,
    textShadowColor: COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleHUB: {
    fontSize: FONT_SIZES.xxl + 8,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
    marginLeft: SPACING.sm,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 9999,
    marginVertical: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  cardWrapper: {
    width: (width - SPACING.md * 3) / 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },
});
