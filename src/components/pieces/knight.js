class Knight extends Piece {
  constructor(color, col, row) {
    super(color, col, row);
    this.loadSprite('knight');
  }

  getMoves(board) {
    const moves = [];
    const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

    for (const [dc, dr] of offsets) {
      const c = this.col + dc;
      const r = this.row + dr;
      if (c < 0 || c >= 8 || r < 0 || r >= 8) continue;

      const piece = board.getPieceAt(c, r);
      if (!piece || piece.color !== this.color) moves.push({ col: c, row: r });
    }

    return moves;
  }
}
