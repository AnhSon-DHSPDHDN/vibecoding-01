/**
 * Rolls a single six-sided die
 * @returns {number} A random number between 1 and 6
 *
 * @example
 * // Returns a number between 1 and 6
 * const result = rollDie();
 * console.log(result >= 1 && result <= 6); // true
 */
function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Adds points to a player's total score
 * @param {number} currentScore - The player's current total score
 * @param {number} turnScore - The points to add from this turn
 * @returns {number} The new total score
 *
 * @example
 * // Adding turn score to current score
 * const newScore = addToScore(10, 5);
 * console.log(newScore); // 15
 *
 * @example
 * // Starting from zero
 * const score = addToScore(0, 8);
 * console.log(score); // 8
 */
function addToScore(currentScore, turnScore) {
  return currentScore + turnScore;
}

/**
 * Checks if a player has won the game
 * @param {number} score - The player's current score
 * @param {number} targetScore - The score needed to win (default 20)
 * @returns {boolean} True if the player has won, false otherwise
 *
 * @example
 * // Player has won
 * const hasWon = checkWin(20, 20);
 * console.log(hasWon); // true
 *
 * @example
 * // Player has exceeded target
 * const hasWon2 = checkWin(25, 20);
 * console.log(hasWon2); // true
 *
 * @example
 * // Player has not won yet
 * const hasWon3 = checkWin(15, 20);
 * console.log(hasWon3); // false
 */
function checkWin(score, targetScore = 20) {
  return score >= targetScore;
}

/**
 * Processes a dice roll for the current turn
 * @param {number} rollValue - The value rolled on the die
 * @param {number} currentTurnScore - The current turn's accumulated score
 * @returns {object} Object with turnScore (0 if rolled 1) and turnOver (boolean)
 *
 * @example
 * // Rolling a non-1 value
 * const result = processTurn(5, 10);
 * console.log(result); // { turnScore: 15, turnOver: false }
 *
 * @example
 * // Rolling a 1 - turn ends and score resets
 * const result2 = processTurn(1, 10);
 * console.log(result2); // { turnScore: 0, turnOver: true }
 *
 * @example
 * // Starting a turn
 * const result3 = processTurn(3, 0);
 * console.log(result3); // { turnScore: 3, turnOver: false }
 */
function processTurn(rollValue, currentTurnScore) {
  if (rollValue === 1) {
    return { turnScore: 0, turnOver: true };
  }
  return { turnScore: currentTurnScore + rollValue, turnOver: false };
}

/**
 * Displays an ASCII scoreboard
 * @param {number} player1Score - Player 1's total score
 * @param {number} player2Score - Player 2's total score
 * @param {number} currentPlayer - Current player number (1 or 2)
 * @param {number} turnScore - Current turn score
 * @param {number} targetScore - Target score to win (default 20)
 * @returns {string} ASCII art scoreboard
 *
 * @example
 * // Display scoreboard
 * const board = displayScoreboard(10, 5, 1, 7, 20);
 * console.log(board.includes("Player 1")); // true
 * console.log(board.includes("10")); // true
 */
function displayScoreboard(
  player1Score,
  player2Score,
  currentPlayer,
  turnScore,
  targetScore = 20
) {
  const p1Active = currentPlayer === 1 ? "►" : " ";
  const p2Active = currentPlayer === 2 ? "►" : " ";
  const p1Bar = "█".repeat(Math.min(player1Score, targetScore));
  const p2Bar = "█".repeat(Math.min(player2Score, targetScore));

  // Highlight current player's row with different background
  const p1Row1 =
    currentPlayer === 1
      ? `║ ${p1Active} \x1b[7mPlayer 1         Score: ${String(
          player1Score
        ).padStart(2, " ")} / ${targetScore}\x1b[0m          ║`
      : `║ ${p1Active} Player 1         Score: ${String(player1Score).padStart(
          2,
          " "
        )} / ${targetScore}          ║`;

  const p1Row2 =
    currentPlayer === 1
      ? `║   \x1b[7mProgress: ${p1Bar.padEnd(targetScore, "░")}\x1b[0m ║`
      : `║   Progress: ${p1Bar.padEnd(targetScore, "░")} ║`;

  const p2Row1 =
    currentPlayer === 2
      ? `║ ${p2Active} \x1b[7mPlayer 2         Score: ${String(
          player2Score
        ).padStart(2, " ")} / ${targetScore}\x1b[0m          ║`
      : `║ ${p2Active} Player 2         Score: ${String(player2Score).padStart(
          2,
          " "
        )} / ${targetScore}          ║`;

  const p2Row2 =
    currentPlayer === 2
      ? `║   \x1b[7mProgress: ${p2Bar.padEnd(targetScore, "░")}\x1b[0m ║`
      : `║   Progress: ${p2Bar.padEnd(targetScore, "░")} ║`;

  return `
╔═══════════════════════════════════════════════════╗
║              🎲 PIG DICE SCOREBOARD 🎲            ║
╠═══════════════════════════════════════════════════╣
${p1Row1}
${p1Row2}
║                                                   ║
${p2Row1}
${p2Row2}
╠═══════════════════════════════════════════════════╣
║ Turn Score: ${String(turnScore).padStart(
    2,
    " "
  )}                                   ║
╚═══════════════════════════════════════════════════╝`;
}

/**
 * Displays the current game state
 * @param {string} playerName - Name of the current player
 * @param {number} player1Score - Player 1's total score
 * @param {number} player2Score - Player 2's total score
 * @param {number} turnScore - Current turn score
 * @returns {string} Formatted game state message
 *
 * @example
 * // Mid-game state
 * const msg = displayGameState("Player 1", 10, 5, 7);
 * console.log(msg.includes("Player 1: 10")); // true
 * console.log(msg.includes("Player 2: 5")); // true
 * console.log(msg.includes("Turn score: 7")); // true
 */
function displayGameState(playerName, player1Score, player2Score, turnScore) {
  return `\nCurrent Scores - Player 1: ${player1Score} | Player 2: ${player2Score}\n${playerName}'s turn | Turn score: ${turnScore}`;
}

/**
 * Displays an ASCII art representation of a six-sided die
 * @param {number} value - The value showing on the die (1-6)
 * @returns {string} ASCII art representation of the die
 *
 * @example
 * // Display a die showing 1
 * const dice = displayDice(1);
 * console.log(dice.includes("●")); // true
 *
 * @example
 * // Display a die showing 6
 * const dice6 = displayDice(6);
 * console.log(dice6.includes("● ● ●")); // true
 */
function displayDice(value) {
  const dice = {
    1: [
      "┌─────────┐",
      "│         │",
      "│    ●    │",
      "│         │",
      "└─────────┘",
    ],
    2: [
      "┌─────────┐",
      "│  ●      │",
      "│         │",
      "│      ●  │",
      "└─────────┘",
    ],
    3: [
      "┌─────────┐",
      "│  ●      │",
      "│    ●    │",
      "│      ●  │",
      "└─────────┘",
    ],
    4: [
      "┌─────────┐",
      "│  ●   ●  │",
      "│         │",
      "│  ●   ●  │",
      "└─────────┘",
    ],
    5: [
      "┌─────────┐",
      "│  ●   ●  │",
      "│    ●    │",
      "│  ●   ●  │",
      "└─────────┘",
    ],
    6: [
      "┌─────────┐",
      "│  ●   ●  │",
      "│  ●   ●  │",
      "│  ●   ●  │",
      "└─────────┘",
    ],
  };

  return dice[value] ? dice[value].join("\n") : "Invalid die value";
}

/**
 * Gets the display rules for the Pig dice game
 * @returns {string} The rules of the game
 *
 * @example
 * // Getting game rules
 * const rules = getRules();
 * console.log(rules.includes("first to reach 20")); // true
 * console.log(rules.includes("roll a 1")); // true
 */
function getRules() {
  return `
RULES OF PIG:
- Players take turns rolling a die
- Each roll adds to your turn score
- You can choose to ROLL again or HOLD to bank your points
- If you roll a 1, you lose all points for that turn and your turn ends
- If you HOLD, your turn score is added to your total score
- First player to reach 20 points wins!
`;
}

module.exports = {
  rollDie,
  addToScore,
  checkWin,
  processTurn,
  displayGameState,
  displayScoreboard,
  displayDice,
  getRules,
};
