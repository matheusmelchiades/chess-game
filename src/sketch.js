let board;
let game;

function setup() {
  createCanvas(600, 600);
  _startGame();
}

function draw() {
  background(40, 42, 54);

  const inCheck = game.status === 'check' || game.status === 'checkmate';
  board.draw(game.selectedPiece, game.validMoves, inCheck, game.currentPlayer);

  _drawUI();
}

function mouseClicked() {
  if (game.status === 'checkmate' || game.status === 'stalemate') {
    _startGame();
    return;
  }
  game.handleClick(mouseX, mouseY);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _startGame() {
  board = new Board();
  game = new Game(board);
  game.initPieces();
}

function _drawUI() {
  noStroke();
  textAlign(CENTER, CENTER);

  if (game.status === 'checkmate') {
    const winner = game.currentPlayer === 'white' ? 'Black' : 'White';
    textSize(20);
    fill(255, 215, 0);
    text(`Checkmate! ${winner} wins!`, width / 2, 548);
    textSize(13);
    fill(160, 160, 180);
    text('Click anywhere to restart', width / 2, 574);
  } else if (game.status === 'stalemate') {
    textSize(20);
    fill(200, 200, 200);
    text('Stalemate! Draw.', width / 2, 548);
    textSize(13);
    fill(160, 160, 180);
    text('Click anywhere to restart', width / 2, 574);
  } else {
    const name = game.currentPlayer === 'white' ? 'White' : 'Black';
    textSize(15);
    fill(game.currentPlayer === 'white' ? 240 : 180);
    text(`${name}'s turn`, width / 2, 548);

    if (game.status === 'check') {
      textSize(13);
      fill(231, 76, 60);
      text('CHECK!', width / 2, 572);
    }
  }
}
