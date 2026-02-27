class Board {
  constructor() {
    this.size = 8;
    this.sizeSquare = 60;
    this.spaceOut = 30;
    this.colors = {
      primary: '#222831',
      secondary: '#ececec',
      selected: '#f6f080',
      validDot: 'rgba(0,0,0,0.25)',
      capture: '#c0392b',
      check: '#e74c3c',
    };
    this.pieces = [];
  }

  // Grid position → top-left pixel coordinate of that square
  getCoordinates(col, row) {
    return {
      x: this.sizeSquare * col + this.spaceOut,
      y: this.sizeSquare * row + this.spaceOut,
    };
  }

  // Pixel → grid position (returns null if outside the board)
  getGridPosition(px, py) {
    const col = Math.floor((px - this.spaceOut) / this.sizeSquare);
    const row = Math.floor((py - this.spaceOut) / this.sizeSquare);
    if (col >= 0 && col < this.size && row >= 0 && row < this.size) {
      return { col, row };
    }
    return null;
  }

  getPieceAt(col, row) {
    return this.pieces.find(p => p.col === col && p.row === row) || null;
  }

  removePiece(col, row) {
    this.pieces = this.pieces.filter(p => !(p.col === col && p.row === row));
  }

  _isLight(col, row) {
    return (col + row) % 2 !== 0;
  }

  draw(selectedPiece, validMoves, inCheck, currentPlayer) {
    // 1. Draw squares
    for (let col = 0; col < this.size; col++) {
      for (let row = 0; row < this.size; row++) {
        const { x, y } = this.getCoordinates(col, row);
        const isSelected = selectedPiece && selectedPiece.col === col && selectedPiece.row === row;

        noStroke();
        if (isSelected) {
          fill(this.colors.selected);
        } else {
          fill(this._isLight(col, row) ? this.colors.secondary : this.colors.primary);
        }
        rect(x, y, this.sizeSquare, this.sizeSquare);
      }
    }

    // 2. Valid move indicators
    if (validMoves) {
      for (const move of validMoves) {
        const { x, y } = this.getCoordinates(move.col, move.row);
        const hasPiece = this.getPieceAt(move.col, move.row);

        if (hasPiece) {
          noFill();
          stroke(this.colors.capture);
          strokeWeight(3);
          rect(x + 2, y + 2, this.sizeSquare - 4, this.sizeSquare - 4);
          noStroke();
        } else {
          noStroke();
          fill(this._isLight(move.col, move.row) ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)');
          circle(x + this.sizeSquare / 2, y + this.sizeSquare / 2, this.sizeSquare * 0.33);
        }
      }
    }

    // 3. King-in-check highlight
    if (inCheck) {
      const king = this.pieces.find(p => p instanceof King && p.color === currentPlayer);
      if (king) {
        const { x, y } = this.getCoordinates(king.col, king.row);
        noFill();
        stroke(this.colors.check);
        strokeWeight(4);
        rect(x + 2, y + 2, this.sizeSquare - 4, this.sizeSquare - 4);
        noStroke();
      }
    }

    // 4. Board labels (a–h, 1–8)
    noStroke();
    fill(160, 160, 180);
    textSize(11);

    textAlign(RIGHT, CENTER);
    for (let r = 0; r < this.size; r++) {
      const { y } = this.getCoordinates(0, r);
      text(this.size - r, this.spaceOut - 6, y + this.sizeSquare / 2);
    }

    textAlign(CENTER, TOP);
    for (let c = 0; c < this.size; c++) {
      const { x } = this.getCoordinates(c, 0);
      text(String.fromCharCode(97 + c), x + this.sizeSquare / 2, this.spaceOut + this.size * this.sizeSquare + 5);
    }

    // 5. Pieces (always on top)
    for (const piece of this.pieces) {
      const { x, y } = this.getCoordinates(piece.col, piece.row);
      piece.draw(x, y, this.sizeSquare);
    }
  }
}
