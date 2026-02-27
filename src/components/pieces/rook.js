class Rook extends Piece {
  constructor(color, col, row) {
    super(color, col, row);
    this.loadSprite('rook');
  }

  getMoves(board) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dc, dr] of directions) {
      let c = this.col + dc;
      let r = this.row + dr;

      while (c >= 0 && c < 8 && r >= 0 && r < 8) {
        const piece = board.getPieceAt(c, r);
        if (piece) {
          if (piece.color !== this.color) moves.push({ col: c, row: r });
          break;
        }
        moves.push({ col: c, row: r });
        c += dc;
        r += dr;
      }
    }

    return moves;
  }
}
