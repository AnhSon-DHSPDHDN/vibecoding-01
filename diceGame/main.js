const readline = require("readline");
const {
  rollDie,
  addToScore,
  checkWin,
  processTurn,
  displayGameState,
  displayScoreboard,
  displayDice,
  getRules,
} = require("./pigdice");

/**
 * Main function that runs the Pig dice game
 */
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Helper function to get user input
  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };

  console.log("Let's play Pig!");
  console.log(getRules());

  let player1Score = 0;
  let player2Score = 0;
  let currentPlayer = 1;
  const TARGET_SCORE = 20;

  // Game loop
  while (
    !checkWin(player1Score, TARGET_SCORE) &&
    !checkWin(player2Score, TARGET_SCORE)
  ) {
    const playerName = `Player ${currentPlayer}`;
    let turnScore = 0;
    let turnActive = true;

    console.log(`\n${"=".repeat(50)}`);
    console.log(
      displayScoreboard(
        player1Score,
        player2Score,
        currentPlayer,
        turnScore,
        TARGET_SCORE
      )
    );

    // Player's turn loop
    while (turnActive) {
      const action = await askQuestion("\nRoll or Hold? (r/h): ");

      if (action.toLowerCase() === "r") {
        const roll = rollDie();
        console.log(`\nYou rolled: ${roll}`);
        console.log(displayDice(roll));

        const result = processTurn(roll, turnScore);
        turnScore = result.turnScore;

        if (result.turnOver) {
          console.log("Oh no! You rolled a 1! You lose all points this turn.");
          turnActive = false;
        } else {
          console.log(
            displayScoreboard(
              player1Score,
              player2Score,
              currentPlayer,
              turnScore,
              TARGET_SCORE
            )
          );
        }
      } else if (action.toLowerCase() === "h") {
        if (currentPlayer === 1) {
          player1Score = addToScore(player1Score, turnScore);
        } else {
          player2Score = addToScore(player2Score, turnScore);
        }
        console.log(`\n${playerName} banks ${turnScore} points!`);
        console.log(
          `Total score: ${currentPlayer === 1 ? player1Score : player2Score}`
        );
        console.log(
          displayScoreboard(
            player1Score,
            player2Score,
            currentPlayer,
            0,
            TARGET_SCORE
          )
        );
        turnActive = false;
      } else {
        console.log("Invalid input. Please enter 'r' to roll or 'h' to hold.");
      }
    }

    // Switch players
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }

  // Game over
  console.log(`\n${"=".repeat(50)}`);
  console.log("GAME OVER!");
  console.log(
    `\nFinal Scores - Player 1: ${player1Score} | Player 2: ${player2Score}`
  );

  if (checkWin(player1Score, TARGET_SCORE)) {
    console.log("\n🎉 Player 1 wins! 🎉");
  } else {
    console.log("\n🎉 Player 2 wins! 🎉");
  }

  console.log("\nThanks for playing!");

  rl.close();
}

// Run the game
main();
