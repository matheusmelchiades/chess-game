let board;
let queen;

function setup() {
  createCanvas(600, 600);
  board = new Board();
  board.build();

  queen = new Queen();
}

function draw() {
  background(220);
  board.draw();

  queen.setCoordinates(board.getCoordinates(queen.getPosition()));

  queen.draw();
}
