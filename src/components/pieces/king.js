class King extends Piece {
  constructor(color, col, row) {
    super(color, col, row);
    this.loadSprite('king');
  }

  getMoves(board) {
    const moves = [];

    // Normal one-square moves
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (dc === 0 && dr === 0) continue;
        const c = this.col + dc;
        const r = this.row + dr;
        if (c < 0 || c >= 8 || r < 0 || r >= 8) continue;

        const piece = board.getPieceAt(c, r);
        if (!piece || piece.color !== this.color) moves.push({ col: c, row: r });
      }
    }

    // Castling (squares-clear check only; attack checks are done in Game)
    if (!this.hasMoved) {
      // Kingside: rook at col 7
      const kRook = board.getPieceAt(7, this.row);
      if (kRook instanceof Rook && !kRook.hasMoved &&
          !board.getPieceAt(5, this.row) && !board.getPieceAt(6, this.row)) {
        moves.push({ col: 6, row: this.row, castling: true, rookFrom: 7, rookTo: 5 });
      }

      // Queenside: rook at col 0
      const qRook = board.getPieceAt(0, this.row);
      if (qRook instanceof Rook && !qRook.hasMoved &&
          !board.getPieceAt(1, this.row) && !board.getPieceAt(2, this.row) && !board.getPieceAt(3, this.row)) {
        moves.push({ col: 2, row: this.row, castling: true, rookFrom: 0, rookTo: 3 });
      }
    }

    return moves;
  }
}
