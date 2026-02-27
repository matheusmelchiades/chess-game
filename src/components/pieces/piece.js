class Piece {
  constructor(color, col, row) {
    this.color = color;
    this.col = col;
    this.row = row;
    this.sprite = {
      path: 'src/components/pieces/sprites',
      ext: 'png',
      data: null,
    };
    this.size = 30;
    this.hasMoved = false;
  }

  loadSprite(name) {
    this.sprite.data = loadImage(`${this.sprite.path}/${this.color}/${name}.${this.sprite.ext}`);
  }

  draw(x, y, squareSize) {
    if (this.sprite.data) {
      const padding = squareSize * 0.1;
      imageMode(CORNER);
      image(this.sprite.data, x + padding, y + padding, squareSize - padding * 2, squareSize - padding * 2);
    }
  }

  // Returns array of { col, row } objects for candidate moves (no legality check)
  getMoves(_board, _enPassantTarget) {
    return [];
  }
}
