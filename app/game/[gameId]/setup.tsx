import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { getGameMeta } from '../../../constants/games';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../../constants/theme';
import { GameMode, Difficulty, GameId, Player } from '../../../types';
import { useGameStore } from '../../../store/gameStore';

export default function GameSetupScreen() {
  const navigation = useNavigation();
  const { gameId } = useLocalSearchParams<{ gameId: GameId }>();
  const game = getGameMeta(gameId);

  const [mode, setMode] = useState<GameMode>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerSide, setPlayerSide] = useState<Player>(1);
  const [checkersRules, setCheckersRules] = useState<'american' | 'international'>('american');
  const [captureRequired, setCaptureRequired] = useState(true);

  const setConfig = useGameStore((state) => state.setConfig);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: game?.name || 'Game Setup',
    });
  }, [navigation, game]);

  const handleStartGame = () => {
    const params: Record<string, string> = {
      mode,
      difficulty,
      playerSide: String(playerSide),
    };

    // Add checkers-specific options
    if (gameId === 'checkers') {
      params.checkersRules = checkersRules;
      params.checkersCaptureRequired = captureRequired ? 'true' : 'false';
    }

    setConfig({
      gameId,
      mode,
      difficulty,
      playerSide,
      checkersRules: gameId === 'checkers' ? checkersRules : undefined,
      checkersCaptureRequired: gameId === 'checkers' ? captureRequired : undefined,
    });

    router.push({
      pathname: `/game/${gameId}/play`,
      params,
    });
  };

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Game not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
        <View style={styles.content}>
        <View style={styles.gameInfo}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={game.icon as any}
              size={80}
              color={COLORS.textPrimary}
            />
          </View>
          <Text style={styles.gameName}>{game.name}</Text>
          <Text style={styles.gameDescription}>{game.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Mode</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'pvp' && styles.modeButtonActive]}
              onPress={() => setMode('pvp')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'pvp' && styles.modeButtonTextActive,
                ]}
              >
                PvP
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'pvc' && styles.modeButtonActive]}
              onPress={() => setMode('pvc')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'pvc' && styles.modeButtonTextActive,
                ]}
              >
                vs. CPU
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {mode === 'pvc' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Play As</Text>
            <View style={styles.difficultyButtons}>
              <TouchableOpacity
                style={[
                  styles.difficultyButton,
                  playerSide === 1 && styles.difficultyButtonActive,
                ]}
                onPress={() => setPlayerSide(1)}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    playerSide === 1 && styles.difficultyButtonTextActive,
                  ]}
                >
                  Player 1 First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.difficultyButton,
                  playerSide === 2 && styles.difficultyButtonActive,
                ]}
                onPress={() => setPlayerSide(2)}
              >
                <Text
                  style={[
                    styles.difficultyButtonText,
                    playerSide === 2 && styles.difficultyButtonTextActive,
                  ]}
                >
                  Player 2 First
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {mode === 'pvc' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty</Text>
            <View style={styles.difficultyButtons}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.difficultyButton,
                    difficulty === diff && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setDifficulty(diff)}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      difficulty === diff && styles.difficultyButtonTextActive,
                    ]}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setMode('pvp')}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
              <Text style={styles.backButtonText}>Back to Mode Selection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Checkers Rules Section */}
        {gameId === 'checkers' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rules Variant</Text>
              <View style={styles.difficultyButtons}>
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    checkersRules === 'american' && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setCheckersRules('american')}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      checkersRules === 'american' && styles.difficultyButtonTextActive,
                    ]}
                  >
                    American
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    checkersRules === 'international' && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setCheckersRules('international')}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      checkersRules === 'international' && styles.difficultyButtonTextActive,
                    ]}
                  >
                    International
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Capture Rule</Text>
              <View style={styles.difficultyButtons}>
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    captureRequired && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setCaptureRequired(true)}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      captureRequired && styles.difficultyButtonTextActive,
                    ]}
                  >
                    Mandatory
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.difficultyButton,
                    !captureRequired && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setCaptureRequired(false)}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      !captureRequired && styles.difficultyButtonTextActive,
                    ]}
                  >
                    Optional
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={styles.startButton}>
          <Button
            title="START GAME"
            onPress={handleStartGame}
            variant="primary"
            size="large"
          />
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  gameName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  gameDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  modeButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modeButtonTextActive: {
    color: COLORS.textPrimary,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  difficultyButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  difficultyButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  difficultyButtonTextActive: {
    color: COLORS.textPrimary,
  },
  startButton: {
    marginTop: 'auto',
    paddingBottom: SPACING.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.accent,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
