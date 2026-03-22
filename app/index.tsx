import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/ui/Card';
import { GAMES } from '../constants/games';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { GameId } from '../types';

export default function HomeScreen() {
  const handleGamePress = (gameId: GameId) => {
    router.push(`/game/${gameId}/setup`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>GAME HUB</Text>
          <Text style={styles.subtitle}>Choose your game</Text>
        </View>

        <View style={styles.grid}>
          {GAMES.map((game) => (
            <Card
              key={game.id}
              title={game.name}
              category={game.category}
              icon={game.icon}
              onPress={() => handleGamePress(game.id)}
            />
          ))}
        </View>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
});
