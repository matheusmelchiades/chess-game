class Pawn extends Piece {
  constructor(color, col, row) {
    super(color, col, row);
    this.loadSprite('pawn');
    this.startRow = color === 'white' ? 6 : 1;
  }

  getMoves(board, enPassantTarget) {
    const moves = [];
    const dir = this.color === 'white' ? -1 : 1;

    // Forward one step
    const fwdRow = this.row + dir;
    if (fwdRow >= 0 && fwdRow < 8 && !board.getPieceAt(this.col, fwdRow)) {
      moves.push({ col: this.col, row: fwdRow });

      // Forward two steps from starting row
      const fwd2Row = this.row + 2 * dir;
      if (
        this.row === this.startRow &&
        fwd2Row >= 0 && fwd2Row < 8 &&
        !board.getPieceAt(this.col, fwd2Row)
      ) {
        moves.push({ col: this.col, row: fwd2Row, doubleMove: true });
      }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
      const capCol = this.col + dc;
      const capRow = this.row + dir;
      if (capCol < 0 || capCol >= 8 || capRow < 0 || capRow >= 8) continue;

      const target = board.getPieceAt(capCol, capRow);
      if (target && target.color !== this.color) {
        moves.push({ col: capCol, row: capRow });
      }

      // En passant
      if (enPassantTarget && enPassantTarget.col === capCol && enPassantTarget.row === capRow) {
        moves.push({ col: capCol, row: capRow, enPassant: true });
      }
    }

    return moves;
  }
}
