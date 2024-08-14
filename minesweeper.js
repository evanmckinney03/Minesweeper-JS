const SQ_WIDTH = 35;
const BORDER_WIDTH = 2;

window.onload = init;

function init() {
  let svg = document.getElementById('svg');
  let easy_button = document.getElementById('easy');
  let intermediate_button = document.getElementById('intermediate');
  let expert_button = document.getElementById('expert');
  let board_size = [9, 9];

  console.log(easy_button);

  addSquaresToSVG(board_size);
  console.log(svg);

  easy_button.addEventListener('click', () => {
    board_size = [9, 9];
    addSquaresToSVG(board_size);
  });
  intermediate_button.addEventListener('click', () => {
    board_size = [16, 16];
    addSquaresToSVG(board_size);
  });
  expert_button.addEventListener('click', () => {
    board_size = [30, 16];
    addSquaresToSVG(board_size);
  });
}

function addSquaresToSVG(board_size) {
  svg.replaceChildren();
  for(let i = 0; i < board_size[0]; i++) {
    for(let j = 0; j < board_size[1]; j++) {
      let square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      square.setAttribute('width', SQ_WIDTH - BORDER_WIDTH);
      square.setAttribute('height', SQ_WIDTH - BORDER_WIDTH);
      square.setAttribute('x', i * SQ_WIDTH);
      square.setAttribute('y', j * SQ_WIDTH);
      square.setAttribute('id', i + ',' + j);
      square.addEventListener('click', function () {
        console.log(this.id);
      });
      svg.appendChild(square);
    }
  }
}

