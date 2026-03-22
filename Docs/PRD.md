# Product Requirements Document — Game Hub

## 1. Project Overview

**Project Name:** Game Hub  
**Platform:** Mobile (iOS & Android)  
**Tech Stack:** React Native, Expo Go (SDK 51+), TypeScript  
**Context:** Mobile Development Midterm Project — DAUST  

Game Hub is a mobile application that lets users play 4 classic board games in a single app. Each game supports two modes: Player vs Player (local) and Player vs Computer (with 3 AI difficulty levels).

---

## 2. Goals

- Deliver a polished, functional multi-game mobile app using React Native and Expo Go.
- Implement clean game logic for 4 distinct board games.
- Provide a smooth and intuitive UI/UX across all games.
- Demonstrate proper component architecture, state management, and AI logic.

---

## 3. Target Users

- Two friends playing together on one device (PvP mode).
- A solo player looking to practice or play against the computer (PvC mode).

---

## 4. Games Included

| # | Game | Type | Board Size |
|---|------|------|------------|
| 1 | 3 Pions | Senegalese strategy | 3×3 grid (9 positions) |
| 2 | Tic Tac Toe | Classic | 3×3 grid |
| 3 | Checkers | Classic strategy | 8×8 board |
| 4 | Chess | Classic strategy | 8×8 board |

---

## 5. Game Modes

### 5.1 Player vs Player (PvP)
- Two human players take turns on the same device.
- Players are labeled **Player 1** and **Player 2**.
- A visual indicator shows whose turn it is.

### 5.2 Player vs Computer (PvC)
- The human plays as **Player 1**, the computer as **Player 2**.
- The user selects a difficulty level before starting the game.
- The computer takes its turn automatically after the player's move (with a short artificial delay of 500–800ms for realism).

#### AI Difficulty Levels

| Level | Behavior |
|-------|----------|
| **Easy** | Random valid moves. No strategic lookahead. |
| **Medium** | Looks 1–2 moves ahead. Prioritizes winning/blocking moves. |
| **Hard** | Minimax algorithm with alpha-beta pruning. Plays near-optimally. |

---

## 6. Feature Requirements

### 6.1 Home Screen
- Display all 4 games as visual cards (icon + game name).
- Tapping a card navigates to the Game Setup screen for that game.

### 6.2 Game Setup Screen
- Shows game name and brief description.
- User selects game mode: **PvP** or **PvC**.
- If PvC is selected, a difficulty picker is shown: **Easy**, **Medium**, **Hard**.
- A **Start Game** button launches the game.

### 6.3 Game Screen
- Displays the game board.
- Shows player info (names, avatars, score) at top and bottom.
- Shows whose turn it is.
- Has a **Pause / Menu** button (top-right).
- In-game menu allows: Resume, Restart, Go to Home.
- On game end: shows a result modal (winner/draw) with options to **Play Again** or **Go to Home**.

### 6.4 Round Tracking (3 Pions only)
- Displays current round out of 3 (e.g., "Round 1/3").
- Score is tracked across rounds.
- After 3 rounds, the player with more round wins is the overall winner.

### 6.5 General
- No account/login required.
- No internet connection required (fully offline).
- App should not crash on invalid moves — all inputs must be validated.

---

## 7. Non-Functional Requirements

| Requirement | Detail |
|------------|--------|
| Performance | Animations must run at 60fps. AI moves must resolve in < 1.5s even on Hard. |
| Compatibility | Must run on Expo Go (no bare workflow needed). |
| Responsiveness | UI must adapt to different screen sizes (phones). Tablet support not required. |
| Offline-first | No network calls. All logic is on-device. |
| Language | App is in **English** (UI labels, buttons, messages). |

---

## 8. Out of Scope

- Online multiplayer (network play).
- User accounts, leaderboards, or persistent statistics.
- Sound effects and background music (optional stretch goal).
- Game tutorials or interactive help screens.
- Tablet-specific layouts.

---

## 9. Success Criteria

- All 4 games are fully playable without bugs.
- PvP and PvC modes work correctly for all games.
- AI at Hard level plays correctly according to each game's rules.
- Navigation between Home → Setup → Game → Home is smooth.
- App runs on Expo Go without ejecting.
