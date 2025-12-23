// Game state
let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;
let turnScore = 0;
const TARGET_SCORE = 20;

// DOM elements
const rulesSection = document.getElementById("rulesSection");
const gameBoard = document.getElementById("gameBoard");
const startBtn = document.getElementById("startBtn");
const rollBtn = document.getElementById("rollBtn");
const holdBtn = document.getElementById("holdBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const player1ScoreEl = document.getElementById("player1Score");
const player2ScoreEl = document.getElementById("player2Score");
const turnScoreEl = document.getElementById("turnScore");
const player1ProgressEl = document.getElementById("player1Progress");
const player2ProgressEl = document.getElementById("player2Progress");
const player1RowEl = document.getElementById("player1Row");
const player2RowEl = document.getElementById("player2Row");

const diceDisplay = document.getElementById("diceDisplay");
const rollMessage = document.getElementById("rollMessage");
const gameMessage = document.getElementById("gameMessage");
const winnerModal = document.getElementById("winnerModal");
const winnerText = document.getElementById("winnerText");
const finalScoreText = document.getElementById("finalScoreText");

// Dice faces HTML
const diceFaces = {
  1: '<div class="dice-face dice-1"><span class="dot"></span></div>',
  2: '<div class="dice-face dice-2"><span class="dot"></span><span class="dot"></span></div>',
  3: '<div class="dice-face dice-3"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>',
  4: '<div class="dice-face dice-4"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>',
  5: '<div class="dice-face dice-5"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>',
  6: '<div class="dice-face dice-6"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>',
};

// Event listeners
startBtn.addEventListener("click", startGame);
rollBtn.addEventListener("click", rollDice);
holdBtn.addEventListener("click", hold);
playAgainBtn.addEventListener("click", resetGame);

// Game functions
function startGame() {
  rulesSection.style.display = "none";
  gameBoard.style.display = "block";
  updateUI();
}

function rollDice() {
  // Disable buttons during roll animation
  rollBtn.disabled = true;
  holdBtn.disabled = true;

  // Add rolling animation
  diceDisplay.classList.add("rolling");

  // Roll the dice
  const roll = Math.floor(Math.random() * 6) + 1;

  // Show result after animation
  setTimeout(() => {
    diceDisplay.classList.remove("rolling");
    displayDice(roll);
    rollMessage.textContent = `You rolled: ${roll}`;

    if (roll === 1) {
      // Lost turn
      turnScore = 0;
      showMessage(
        `Oh no! You rolled a 1! You lose all points this turn.`,
        "error"
      );

      setTimeout(() => {
        switchPlayer();
      }, 2000);
    } else {
      // Add to turn score
      turnScore += roll;
      turnScoreEl.textContent = turnScore;
      showMessage(
        `Good roll! You can roll again or hold to bank ${turnScore} points.`,
        "success"
      );

      // Re-enable buttons
      rollBtn.disabled = false;
      holdBtn.disabled = false;
    }
  }, 500);
}

function hold() {
  if (turnScore === 0) {
    showMessage("You need to roll at least once before holding!", "warning");
    return;
  }

  // Add turn score to total
  if (currentPlayer === 1) {
    player1Score += turnScore;
    player1ScoreEl.textContent = player1Score;
    player1ProgressEl.style.width = `${(player1Score / TARGET_SCORE) * 100}%`;
  } else {
    player2Score += turnScore;
    player2ScoreEl.textContent = player2Score;
    player2ProgressEl.style.width = `${(player2Score / TARGET_SCORE) * 100}%`;
  }

  showMessage(`Player ${currentPlayer} banks ${turnScore} points!`, "success");

  // Check for winner
  if (
    (currentPlayer === 1 && player1Score >= TARGET_SCORE) ||
    (currentPlayer === 2 && player2Score >= TARGET_SCORE)
  ) {
    endGame();
    return;
  }

  // Switch player
  setTimeout(() => {
    turnScore = 0;
    switchPlayer();
  }, 1500);
}

function switchPlayer() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  turnScore = 0;
  updateUI();
  showMessage(`Player ${currentPlayer}'s turn!`, "success");

  // Re-enable buttons
  rollBtn.disabled = false;
  holdBtn.disabled = false;
}

function displayDice(value) {
  diceDisplay.innerHTML = diceFaces[value];
}

function updateUI() {
  // Update scores
  player1ScoreEl.textContent = player1Score;
  player2ScoreEl.textContent = player2Score;
  turnScoreEl.textContent = turnScore;

  // Update progress bars
  player1ProgressEl.style.width = `${(player1Score / TARGET_SCORE) * 100}%`;
  player2ProgressEl.style.width = `${(player2Score / TARGET_SCORE) * 100}%`;

  // Update active player
  if (currentPlayer === 1) {
    player1RowEl.classList.add("active");
    player2RowEl.classList.remove("active");
  } else {
    player1RowEl.classList.remove("active");
    player2RowEl.classList.add("active");
  }
}

function showMessage(text, type) {
  gameMessage.textContent = text;
  gameMessage.className = `message ${type}`;
}

function endGame() {
  rollBtn.disabled = true;
  holdBtn.disabled = true;

  const winner = currentPlayer === 1 ? "Player 1" : "Player 2";
  winnerText.textContent = `🎉 ${winner} Wins! 🎉`;
  finalScoreText.textContent = `Final Score - Player 1: ${player1Score} | Player 2: ${player2Score}`;

  setTimeout(() => {
    winnerModal.style.display = "flex";
  }, 1000);
}

function resetGame() {
  // Reset scores
  player1Score = 0;
  player2Score = 0;
  currentPlayer = 1;
  turnScore = 0;

  // Hide modal
  winnerModal.style.display = "none";

  // Reset UI
  updateUI();
  rollMessage.textContent = "";
  gameMessage.textContent = "";
  displayDice(1);

  // Enable buttons
  rollBtn.disabled = false;
  holdBtn.disabled = false;

  showMessage("New game started! Player 1's turn!", "success");
}

// Initialize dice display
displayDice(1);
