const startBtn = document.getElementById('startBtn');
const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const highScoreDisplay = document.getElementById('highScore');
const levelSelect = document.getElementById('levelSelect');
const themeSelect = document.getElementById('themeSelect');

const flipSound = document.getElementById('flipSound');
const matchSound = document.getElementById('matchSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const tickTockSound = document.getElementById('tickTockSound');

let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let matchedPairs = 0;
let moves = 0;
let timer;
let timeLeft = 60;
let timerStarted = false;
let bestTime = localStorage.getItem('memoryBestTime') || null;
let currentLevel = 'easy'; // default level
let currentTheme = 'letters'; // default theme

const themes = {
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8'],
    emojis: ["😊", "😍", "😂", "🥺", "😎", "😜", "💩", "😻"]
  };
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createBoard() {
  gameBoard.innerHTML = '';
  const themeArray = themes[currentTheme];
  let gridSize = 4;
  if (currentLevel === 'medium') gridSize = 5;
  if (currentLevel === 'hard') gridSize = 6;

  const selectedCards = shuffle(themeArray.slice(0, gridSize * gridSize / 2));
  const boardArray = shuffle([...selectedCards, ...selectedCards]);

  boardArray.forEach(letter => {
    const card = document.createElement('div');
    card.classList.add('card');
    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    cardContent.innerText = '';
    card.appendChild(cardContent);
    card.dataset.letter = letter;
    card.innerText = '';
    card.addEventListener('click', flipCard);
    gameBoard.appendChild(card);
  });

  gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`;
}
function flipCard() {
    if (!timerStarted) return;
    if (lockBoard) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return;
  
    flipSound.play();
    this.classList.add('flipped');
    this.querySelector('.card-content').innerText = this.dataset.letter;  // Add text inside card-content
  
    if (!firstCard) {
      firstCard = this;
    } else {
      secondCard = this;
      checkForMatch();
    }
  }

function startGame() {
  createBoard();
  timeLeft = 60;
  moves = 0;
  timerDisplay.innerText = `Time: ${timeLeft}`;
  movesDisplay.innerText = `Moves: ${moves}`;
  matchedPairs = 0;
  startBtn.disabled = true;
  timerStarted = true;
  timerDisplay.style.color = 'black';
  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  timerDisplay.innerText = `Time: ${timeLeft}`;
  
  if (timeLeft <= 10) {
    timerDisplay.style.color = 'red';
    tickTockSound.play();
  }
  
  if (timeLeft <= 0) {
    clearInterval(timer);
    gameOver();
  }
}

function flipCard() {
  if (!timerStarted) return;
  if (lockBoard) return;
  if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

  flipSound.play();
  this.classList.add('flipped');
  this.innerText = this.dataset.letter;

  if (!firstCard) {
    firstCard = this;
  } else {
    secondCard = this;
    checkForMatch();
  }
}

function checkForMatch() {
  lockBoard = true;

  if (firstCard.dataset.letter === secondCard.dataset.letter) {
    matchSound.play();
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matchedPairs++;
    moves++;
    movesDisplay.innerText = `Moves: ${moves}`;
    resetBoard();
    if (matchedPairs === (gameBoard.childNodes.length / 2)) {
      gameWon();
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard.innerText = '';
      secondCard.innerText = '';
      resetBoard();
    }, 1000);
  }
}

function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function gameWon() {
  clearInterval(timer);
  winSound.play();
  document.body.style.animation = "winAnimation 1s infinite";

  setTimeout(() => {
    document.body.style.animation = "";
    startBtn.disabled = false;
  }, 3000);

  if (!bestTime || timeLeft > bestTime) {
    bestTime = timeLeft;
    localStorage.setItem('memoryBestTime', bestTime);
  }

  highScoreDisplay.innerText = `Best Time: ${bestTime} sec`;
}

function gameOver() {
  loseSound.play();
  alert('Time is up! 😢');
  startBtn.disabled = false;
}

// Show best time if already saved
if (bestTime) {
  highScoreDisplay.innerText = `Best Time: ${bestTime} sec`;
}

levelSelect.addEventListener('change', (e) => {
  currentLevel = e.target.value;
});

themeSelect.addEventListener('change', (e) => {
  currentTheme = e.target.value;
});

startBtn.addEventListener('click', startGame);
