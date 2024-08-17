const SQ_WIDTH = 35;
const BORDER_WIDTH = 2;
const START_OFFSET_X = 10;
//height of the top bar
const TOP_HEIGHT = 40;
const START_OFFSET_Y = START_OFFSET_X * 2 + TOP_HEIGHT;

let timer;

window.onload = init;

function init() {
  let svg = document.getElementById('svg');
  let easyButton = document.getElementById('easy');
  let intermediateButton = document.getElementById('intermediate');
  let expertButton = document.getElementById('expert');

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
  let gameBoard = createArray(board_size, num_mines);
  let numCleared = 0;
  addSquaresAndTextToSVG(gameBoard, numCleared, num_mines);
}

//initializes gameBoard based on board_size and num_mines
function createArray(board_size, num_mines) {
  let gameBoard = [];
  for(let i = 0; i < board_size[0]; i++) {
    gameBoard.push([]);
  }

  //fill up first num_mines spots with an X
  for(let i = 0; i < num_mines; i++) {
    gameBoard[Math.floor(i / board_size[1])].push('X');
  }
  //fill the rest with 0s for now
  for(let i = num_mines; i < board_size[0] * board_size[1]; i++) {
    gameBoard[Math.floor(i / board_size[1])].push('0');
  }
  shuffleGameBoard(gameBoard);
  calculateAdjacencies(gameBoard);
  return gameBoard;
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
function addSquaresAndTextToSVG(gameBoard, numCleared, num_mines) {
  svg.replaceChildren();
  for(let i = 0; i < gameBoard.length; i++) {
    for(let j = 0; j < gameBoard[0].length; j++) {
      let square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      square.setAttribute('width', SQ_WIDTH);
      square.setAttribute('height', SQ_WIDTH);
      square.setAttribute('x', i * SQ_WIDTH + START_OFFSET_X);
      square.setAttribute('y', j * SQ_WIDTH + START_OFFSET_Y);
      square.setAttribute('id', i + ',' + j + ',square');
      square.setAttribute('class', 'newSquare');
      square.addEventListener('click', function () {
	if(numCleared == 0) {
          rerollUntilGoodStart(this.id, gameBoard, num_mines);
	  startTimer();
	}
        numCleared += reveal(this.id, gameBoard);
	if(numCleared == gameBoard.length * gameBoard[0].length - num_mines) {
	  win(gameBoard);
	}
      });
      square.addEventListener('contextmenu', function(event) {
        event.preventDefault();
	let isWon = numCleared == gameBoard.length * gameBoard[0].length - num_mines;
	mark(this.id, isWon);
      })
      svg.appendChild(square);
      let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('class', 'text');
      text.setAttribute('x', i * SQ_WIDTH + Math.floor(SQ_WIDTH / 2) + START_OFFSET_X);
      text.setAttribute('y', j * SQ_WIDTH + Math.floor(SQ_WIDTH / 2) + START_OFFSET_Y);
      text.setAttribute('id', i + ',' + j + ',text');
      svg.appendChild(text);
    }
  }
  drawBorders(gameBoard, svg);
  //adjust svg size
  svg.setAttribute('width', START_OFFSET_X * 2 + SQ_WIDTH * gameBoard.length);
  svg.setAttribute('height', START_OFFSET_Y + START_OFFSET_X + SQ_WIDTH * gameBoard[0].length);
  addTimer(svg);
}
//draw borders based on the size of the gameBoard
function drawBorders(gameBoard, svg) {
  let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  let path_d = '';
  //vertical lines
  for(let i = 0; i < gameBoard.length + 1; i++) {
    path_d += ' M ' + (START_OFFSET_X + SQ_WIDTH * i) + ' ' + START_OFFSET_Y;
    path_d += ' v ' + (gameBoard[0].length * SQ_WIDTH);
  }
  //horizontal lines
  for(let i = 0; i < gameBoard[0].length + 1; i++) {
    path_d += ' M ' + START_OFFSET_X + ' ' + (START_OFFSET_Y + SQ_WIDTH * i);
    path_d += ' h ' + (gameBoard.length * SQ_WIDTH);
  }

  path.setAttribute('class', 'border');
  path.setAttribute('d', path_d); 
  svg.appendChild(path);
}

//adds the timer in the top left
function addTimer(svg) {
  //amount text is inside the box
  let textIn = 2;
  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('width', SQ_WIDTH * 2);
  rect.setAttribute('height', TOP_HEIGHT);
  rect.setAttribute('x', START_OFFSET_X);
  rect.setAttribute('y', START_OFFSET_X);
  rect.setAttribute('id', 'timerRect');
  rect.setAttribute('class', 'timerRect');
  let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', START_OFFSET_X + textIn);
  text.setAttribute('y', START_OFFSET_X + TOP_HEIGHT - textIn * 4);
  text.setAttribute('class', 'timerText');
  text.setAttribute('id', 'timerText');
  text.setAttribute('textLength', rect.getAttribute('width') - textIn * 2);
  text.setAttribute('font-size', TOP_HEIGHT);
  text.innerHTML = '000';
  svg.appendChild(rect);
  svg.appendChild(text);
}

//starts the timer in the top left
function startTimer() {
  timer = setInterval(incrementTimer, 1000);
}

//stops the timer in the top left
function stopTimer() {
  clearInterval(timer);
}

//increases the timer by 1, max of 999
function incrementTimer() {
  let text = document.getElementById('timerText');
  let time = parseInt(text.innerHTML);
  time = Math.min(time + 1, 999);
  time = '00' + time;
  time = time.substring(time.length - 3);
  text.innerHTML = time;
}

//recreates the arrays until the square at id has a 0
function rerollUntilGoodStart(id, gameBoard, num_mines) {
  let id_split = id.split(',');
  let newGameBoard = gameBoard;
  while(newGameBoard[id_split[0]][id_split[1]] != '0') {
    newGameBoard = createArray([gameBoard.length, gameBoard[0].length], num_mines);
  }
  //copy newGameBoard into gameBoard if newGameBoard was made
  for(let i = 0; i < gameBoard.length; i++) {
    gameBoard[i] = newGameBoard[i];
  } 
}

//reveals the square and returns the number of squares revealed
//if force is true, then anything will be revealed
function reveal(id, gameBoard) {
  let id_split = id.split(',');
  let id_x = parseInt(id_split[0]);
  let id_y = parseInt(id_split[1]);
  if(id_x < 0 || id_x >= gameBoard.length || id_y < 0 || id_y >= gameBoard[0].length) return 0;
  let numCleared = 0;
  let square = document.getElementById(id_split[0] + ',' + id_split[1] + ',square');
  let text = document.getElementById(id_split[0] + ',' + id_split[1] + ',text');
  //only reveal blank squares or question marks
  if(text.innerHTML.length == 0 || text.innerHTML == '?') {
    reveal_edit(square, text, gameBoard[id_split[0]][id_split[1]]);
    numCleared++;
    if(gameBoard[id_split[0]][id_split[1]] == 'X') {
      loss(gameBoard);
    }
    if(gameBoard[id_split[0]][id_split[1]] == '0') {
      //recursively reveal other squares
      for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
          numCleared += reveal((id_x + i) + ',' + (id_y + j), gameBoard);
	}
      }
    }
  }
  return numCleared;
}

//changes the square color and the text to the newText string
function reveal_edit(square, text, newText){
  square.setAttribute('class', 'blankSquare');
  text_edit(text, newText);
}
//changes the text color
function text_edit(text, newText) {
  if(newText == '0') {
    text.innerHTML = ' ';
  } else {
    text.innerHTML = newText;
    if(newText == '!' || newText == '?' || newText.length == 0) {
      text.setAttribute('class', 'text textexclam');
    } else {
      text.setAttribute('class', 'text text' + newText);
    }
  }
}


//marks the square as either a mine, question mark, or back to empty
function mark(id, disable) {
  if(disable) return;
  let square = document.getElementById(id);
  let id_split = id.split(',');
  let text = document.getElementById(id_split[0] + ',' + id_split[1] + ',text');
  if(text.innerHTML.length == 0) {
    text_edit(text, '!');
  } else if(text.innerHTML == '!') {
    text_edit(text, '?');
  } else if(text.innerHTML == '?') {
    text_edit(text, '');
  }
}

//clears the field
function loss(gameBoard) {
  stopTimer();
  for(let i = 0; i < gameBoard.length; i++) {
    for(let j = 0; j < gameBoard[0].length; j++) {
      let square = document.getElementById(i + ',' + j + ',square');
      let text = document.getElementById(i + ',' + j + ',text');
      reveal_edit(square, text, gameBoard[i][j]);
    }
  }
}

//marks all the mines with exclamation points
function win(gameBoard) { 
  stopTimer();
  for(let i = 0; i < gameBoard.length; i++) {
    for(let j = 0; j < gameBoard[0].length; j++) {
      let square = document.getElementById(i + ',' + j + ',square');
      let text = document.getElementById(i + ',' + j + ',text');
      if(text.innerHTML.length == 0 || text.innerHTML == '!') {
        text_edit(text, '!');
      }
    }
  }
}

