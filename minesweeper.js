const SQ_WIDTH = 35;
const BORDER_WIDTH = 2;

window.onload = init;

function init() {
  let svg = document.getElementById('svg');
  let easyButton = document.getElementById('easy');
  let intermediateButton = document.getElementById('intermediate');
  let expertButton = document.getElementById('expert');

  //first element in gameState is where the mines are, next is adjacencies
  gameInit([9, 9], 10);

  easyButton.addEventListener('click', () => {
    gameInit([9, 9], 10);
  });
  intermediateButton.addEventListener('click', () => {
    gameInit([16, 16], 40);
  });
  expertButton.addEventListener('click', () => {
    gameInit([30, 16], 99);
  });
}

//does everything needed to start a game based on board_size and num_mines
function gameInit(board_size, num_mines) {
  let gameState = createArray(board_size, num_mines);
  addSquaresAndTextToSVG(gameState);
}

//initializes gameBoard based on board_size and num_mines
function createArray(board_size, num_mines) {
  let gameBoard = [];
  let playerBoard = [];
  for(let i = 0; i < board_size[0]; i++) {
    gameBoard.push([]);
    playerBoard.push([]);
  }

  //fill up first num_mines spots with an X
  for(let i = 0; i < num_mines; i++) {
    gameBoard[Math.floor(i / board_size[1])].push('X');
    playerBoard[Math.floor(i / board_size[1])].push('');
  }
  //fill the rest with 0s for now
  for(let i = num_mines; i < board_size[0] * board_size[1]; i++) {
    gameBoard[Math.floor(i / board_size[1])].push('0');
    playerBoard[Math.floor(i / board_size[1])].push('');
  }
  shuffleGameBoard(gameBoard);
  calculateAdjacencies(gameBoard);
  return [gameBoard, playerBoard];
}

//shuffles the gameBoard so that mines are in a random spot, fisher yates
function shuffleGameBoard(gameBoard) {
  for(let i = gameBoard.length * gameBoard[0].length - 1; i >= 0; i--) {
    let randNum = Math.floor(Math.random() * i);
    //swap i with the random number
    let temp = gameBoard[Math.floor(i / gameBoard[0].length)][i % gameBoard[0].length];
    gameBoard[Math.floor(i / gameBoard[0].length)][i % gameBoard[0].length] 
		  = gameBoard[Math.floor(randNum / gameBoard[0].length)][randNum % gameBoard[0].length];
    gameBoard[Math.floor(randNum / gameBoard[0].length)][randNum % gameBoard[0].length] = temp;
  }
}

//calculates how many mines are around each square
function calculateAdjacencies(gameBoard) {
  for(let i = 0; i < gameBoard.length; i++) {
    for(let j = 0; j < gameBoard[0].length; j++) {
      //if it is a mine, continue
      if(gameBoard[i][j] == 'X') continue;
      //check the 8 adjacent squares
      let num = 0;
      if(i - 1 >= 0 && gameBoard[i - 1][j - 1] == 'X') num++;
      if(i - 1 >= 0 && gameBoard[i - 1][j] == 'X') num++;
      if(i - 1 >= 0 && gameBoard[i - 1][j + 1] == 'X') num++;
      if(gameBoard[i][j - 1] == 'X') num++;
      if(gameBoard[i][j + 1] == 'X') num++;
      if(i + 1 < gameBoard.length && gameBoard[i + 1][j - 1] == 'X') num++;
      if(i + 1 < gameBoard.length && gameBoard[i + 1][j] == 'X') num++;
      if(i + 1 < gameBoard.length && gameBoard[i + 1][j + 1] == 'X') num++;
      gameBoard[i][j] = num;
    }
  }
}

//creates grid of squares based on board_size
function addSquaresAndTextToSVG(gameState) {
  svg.replaceChildren();
  for(let i = 0; i < gameState[0].length; i++) {
    for(let j = 0; j < gameState[0][0].length; j++) {
      let square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      square.setAttribute('width', SQ_WIDTH - BORDER_WIDTH);
      square.setAttribute('height', SQ_WIDTH - BORDER_WIDTH);
      square.setAttribute('x', i * SQ_WIDTH);
      square.setAttribute('y', j * SQ_WIDTH);
      square.setAttribute('id', i + ',' + j + ',square');
      square.addEventListener('click', function () {
        reveal(this.id, gameState);
      });
      square.addEventListener('contextmenu', function(event) {
        event.preventDefault();
	mark(this.id, gameState);
      })
      svg.appendChild(square);
      let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'text');
      text.setAttribute('x', i * SQ_WIDTH + Math.floor(SQ_WIDTH / 2));
      text.setAttribute('y', j * SQ_WIDTH + Math.floor(SQ_WIDTH / 2));
      text.setAttribute('fill', 'green');
      text.setAttribute('id', i + ',' + j + ',text');
      svg.appendChild(text);
    }
  }
}

//reveals the square and ends game if necessary
function reveal(id, gameState) {
  let id_split = id.split(',');
  let id_x = parseInt(id_split[0]);
  let id_y = parseInt(id_split[1]);
  let square = document.getElementById(id);
  square.setAttribute('fill', 'red');
}

//marks the square as either a mine, question mark, or back to empty
function mark(id, gameState) {
  let square = document.getElementById(id);
  let id_split = id.split(',');
  let text = document.getElementById(id_split[0] + ',' + id_split[1] + ',text');
  if(text.innerHTML === '') {
    text.innerHTML = '!';
  } else if(text.innerHTML == '!') {
    text.innerHTML = '?';
  } else if(text.innerHTML == '?') {
    text.innerHTML = '';
  }
}

