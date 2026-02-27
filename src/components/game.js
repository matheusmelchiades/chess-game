class Game {
  constructor(board) {
    this.board = board;
    this.currentPlayer = 'white';
    this.selectedPiece = null;
    this.validMoves = [];
    this.status = 'playing'; // 'playing' | 'check' | 'checkmate' | 'stalemate'
    this.enPassantTarget = null; // { col, row } square where en passant capture lands
  }

  initPieces() {
    this.board.pieces = [];

    const add = (Type, color, col, row) => this.board.pieces.push(new Type(color, col, row));

    // Black pieces (top, rows 0–1)
    add(Rook,   'black', 0, 0); add(Knight, 'black', 1, 0); add(Bishop, 'black', 2, 0);
    add(Queen,  'black', 3, 0); add(King,   'black', 4, 0);
    add(Bishop, 'black', 5, 0); add(Knight, 'black', 6, 0); add(Rook,   'black', 7, 0);
    for (let c = 0; c < 8; c++) add(Pawn, 'black', c, 1);

    // White pieces (bottom, rows 6–7)
    add(Rook,   'white', 0, 7); add(Knight, 'white', 1, 7); add(Bishop, 'white', 2, 7);
    add(Queen,  'white', 3, 7); add(King,   'white', 4, 7);
    add(Bishop, 'white', 5, 7); add(Knight, 'white', 6, 7); add(Rook,   'white', 7, 7);
    for (let c = 0; c < 8; c++) add(Pawn, 'white', c, 6);
  }

  handleClick(px, py) {
    if (this.status === 'checkmate' || this.status === 'stalemate') return;

    const grid = this.board.getGridPosition(px, py);
    if (!grid) return;

    const { col, row } = grid;

    if (this.selectedPiece) {
      const move = this.validMoves.find(m => m.col === col && m.row === row);

      if (move) {
        this._executeMove(this.selectedPiece, move);
        this.selectedPiece = null;
        this.validMoves = [];
      } else {
        // Re-select another friendly piece
        const piece = this.board.getPieceAt(col, row);
        if (piece && piece.color === this.currentPlayer) {
          this.selectedPiece = piece;
          this.validMoves = this._getLegalMoves(piece);
        } else {
          this.selectedPiece = null;
          this.validMoves = [];
        }
      }
    } else {
      const piece = this.board.getPieceAt(col, row);
      if (piece && piece.color === this.currentPlayer) {
        this.selectedPiece = piece;
        this.validMoves = this._getLegalMoves(piece);
      }
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  _getLegalMoves(piece) {
    const candidates = piece.getMoves(this.board, this.enPassantTarget);
    const legal = candidates.filter(move => !this._wouldLeaveKingInCheck(piece, move));

    // Extra castling safety: king must not be in check now, and must not pass through check
    return legal.filter(move => {
      if (!move.castling) return true;
      if (this._isKingInCheck(piece.color)) return false;
      // Kingside passes through col 5; queenside passes through col 3
      const passingCol = move.col === 6 ? 5 : 3;
      if (this._wouldLeaveKingInCheck(piece, { col: passingCol, row: piece.row })) return false;
      return true;
    });
  }

  _wouldLeaveKingInCheck(piece, move) {
    const origCol = piece.col;
    const origRow = piece.row;

    // Temporarily remove captured piece (regular capture)
    const captured = this.board.getPieceAt(move.col, move.row);
    if (captured) this.board.pieces = this.board.pieces.filter(p => p !== captured);

    // Temporarily remove en passant captured pawn (it's on the capturing pawn's original row)
    let epCaptured = null;
    if (move.enPassant) {
      epCaptured = this.board.getPieceAt(move.col, piece.row);
      if (epCaptured) this.board.pieces = this.board.pieces.filter(p => p !== epCaptured);
    }

    // Move piece temporarily
    piece.col = move.col;
    piece.row = move.row;

    const inCheck = this._isKingInCheck(piece.color);

    // Restore everything
    piece.col = origCol;
    piece.row = origRow;
    if (captured) this.board.pieces.push(captured);
    if (epCaptured) this.board.pieces.push(epCaptured);

    return inCheck;
  }

  _isKingInCheck(color) {
    const king = this.board.pieces.find(p => p instanceof King && p.color === color);
    if (!king) return false;

    const enemyColor = color === 'white' ? 'black' : 'white';
    return this.board.pieces
      .filter(p => p.color === enemyColor)
      .some(p => p.getMoves(this.board, null).some(m => m.col === king.col && m.row === king.row));
  }

  _executeMove(piece, move) {
    // En passant: captured pawn is on piece's current row, destination column
    if (move.enPassant) {
      this.board.removePiece(move.col, piece.row);
    }

    // Regular capture
    const target = this.board.getPieceAt(move.col, move.row);
    if (target) this.board.removePiece(move.col, move.row);

    // Castling: also move the rook
    if (move.castling) {
      const rook = this.board.getPieceAt(move.rookFrom, piece.row);
      if (rook) {
        rook.col = move.rookTo;
        rook.hasMoved = true;
      }
    }

    // Move the piece
    piece.col = move.col;
    piece.row = move.row;
    piece.hasMoved = true;

    // Set en passant target for opponent's next move
    this.enPassantTarget = null;
    if (move.doubleMove) {
      const epDir = piece.color === 'white' ? 1 : -1;
      this.enPassantTarget = { col: piece.col, row: piece.row + epDir };
    }

    // Pawn promotion – auto-promote to Queen
    if (piece instanceof Pawn) {
      const promRow = piece.color === 'white' ? 0 : 7;
      if (piece.row === promRow) {
        const queen = new Queen(piece.color, piece.col, piece.row);
        this.board.pieces = this.board.pieces.filter(p => p !== piece);
        this.board.pieces.push(queen);
      }
    }

    // Switch turn
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    this._updateStatus();
  }

  _updateStatus() {
    const hasAnyLegalMove = this.board.pieces
      .filter(p => p.color === this.currentPlayer)
      .some(p => this._getLegalMoves(p).length > 0);

    if (!hasAnyLegalMove) {
      this.status = this._isKingInCheck(this.currentPlayer) ? 'checkmate' : 'stalemate';
    } else {
      this.status = this._isKingInCheck(this.currentPlayer) ? 'check' : 'playing';
    }
  }
}
