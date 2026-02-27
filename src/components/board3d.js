class Board3D {
  constructor() {
    this.size = 8;
    this.sq = 60;       // square size in 3D units
    this.sqH = 8;       // square slab height
    this.pieces = [];
    this._camera = null; // set each frame via setCameraState()
  }

  // ─── Data interface (same contract as Board) ────────────────────────────────

  getPieceAt(col, row) {
    return this.pieces.find(p => p.col === col && p.row === row) || null;
  }

  removePiece(col, row) {
    this.pieces = this.pieces.filter(p => !(p.col === col && p.row === row));
  }

  /** Called once per frame from sketch3d so picking knows the current camera. */
  setCameraState(ex, ey, ez, w, h) {
    this._camera = { ex, ey, ez, w, h };
  }

  /**
   * Convert screen click → board square via ray-plane intersection.
   * Casts a ray from the camera eye through the screen pixel and finds
   * where it hits the board surface plane (y = 0).
   */
  getGridPosition(mx, my) {
    if (!this._camera) return null;
    const { ex, ey, ez, w, h } = this._camera;

    // ── Camera basis (view direction from eye toward origin) ──────────────────
    const len = Math.sqrt(ex * ex + ey * ey + ez * ez);
    const vdx = -ex / len, vdy = -ey / len, vdz = -ez / len; // forward

    // right = cross(forward, worldUp=(0,1,0)) = (-vdz, 0, vdx)
    const rLen = Math.sqrt(vdz * vdz + vdx * vdx);
    const rx = -vdz / rLen, rz = vdx / rLen; // ry = 0

    // camUp = cross(right, forward)
    const ux = -rz * vdy;
    const uy = rz * vdx - rx * vdz;
    const uz = rx * vdy;

    // ── Ray direction through pixel (mx, my) ──────────────────────────────────
    const tanH   = Math.tan(Math.PI / 6); // half-angle for 60° FOV (PI/3)
    const aspect = w / h;
    const ndcX   = (2 * mx / w - 1) * tanH * aspect;
    const ndcY   = (2 * my / h - 1) * tanH;

    const rdx = vdx + ndcX * rx + ndcY * ux;
    const rdy = vdy + ndcX * 0  + ndcY * uy; // ry = 0
    const rdz = vdz + ndcX * rz + ndcY * uz;

    // ── Intersect ray with board plane y = 0 ─────────────────────────────────
    if (Math.abs(rdy) < 0.0001) return null; // ray parallel to board
    const t = -ey / rdy;
    if (t <= 0) return null; // intersection behind camera

    const ix = ex + t * rdx;
    const iz = ez + t * rdz;

    // ── World pos → grid square ───────────────────────────────────────────────
    const col = Math.floor(ix / this.sq + this.size / 2);
    const row = Math.floor(iz / this.sq + this.size / 2);
    if (col < 0 || col >= this.size || row < 0 || row >= this.size) return null;
    return { col, row };
  }

  // ─── 3D helpers ─────────────────────────────────────────────────────────────

  /** Center of square in world space (board surface at y = 0). */
  _sq3D(col, row) {
    return {
      x: (col - 3.5) * this.sq,
      z: (row - 3.5) * this.sq,
    };
  }

  _isLight(col, row) {
    return (col + row) % 2 !== 0;
  }

  // ─── Main draw ──────────────────────────────────────────────────────────────

  draw(selectedPiece, validMoves, inCheck, currentPlayer) {
    noStroke();

    // Base platform
    push();
    translate(0, this.sqH * 2.5, 0);
    fill(25, 27, 35);
    box(this.size * this.sq + 30, this.sqH * 5, this.size * this.sq + 30);
    pop();

    // Board squares
    for (let col = 0; col < this.size; col++) {
      for (let row = 0; row < this.size; row++) {
        const { x, z } = this._sq3D(col, row);

        const isLight = this._isLight(col, row);
        const isSelected = selectedPiece && selectedPiece.col === col && selectedPiece.row === row;
        const isTarget = validMoves && validMoves.some(m => m.col === col && m.row === row);
        const hasPiece = this.getPieceAt(col, row);

        push();
        translate(x, -this.sqH / 2, z);

        if (isSelected) {
          fill(246, 240, 100);
        } else if (isTarget && hasPiece) {
          fill(200, 70, 70);
        } else {
          fill(isLight ? [236, 236, 228] : [34, 40, 49]);
        }

        box(this.sq - 1, this.sqH, this.sq - 1);

        // Valid move dot (empty squares)
        if (isTarget && !hasPiece) {
          translate(0, -this.sqH / 2 - 5, 0);
          fill(120, 210, 100, 200);
          sphere(this.sq * 0.13);
        }

        pop();
      }
    }

    // King-in-check highlight
    if (inCheck) {
      const king = this.pieces.find(p => p instanceof King && p.color === currentPlayer);
      if (king) {
        const { x, z } = this._sq3D(king.col, king.row);
        push();
        translate(x, -this.sqH / 2, z);
        noFill();
        stroke(231, 76, 60);
        strokeWeight(3);
        box(this.sq - 1, this.sqH + 2, this.sq - 1);
        noStroke();
        pop();
      }
    }

    // Board labels
    this._drawLabels();

    // Pieces
    for (const piece of this.pieces) {
      const { x, z } = this._sq3D(piece.col, piece.row);
      this._drawPiece(piece, x, -this.sqH, z);
    }
  }

  _drawLabels() {
    noStroke();
    fill(160, 160, 180);
    textSize(13);

    const edge = this.size * this.sq / 2 + 22;

    for (let c = 0; c < this.size; c++) {
      const x = (c - 3.5) * this.sq;
      // Front edge (a–h)
      push();
      translate(x, -this.sqH - 3, edge);
      rotateX(-HALF_PI);
      textAlign(CENTER, CENTER);
      text(String.fromCharCode(97 + c), 0, 0);
      pop();
    }

    for (let r = 0; r < this.size; r++) {
      const z = (r - 3.5) * this.sq;
      // Left edge (8–1)
      push();
      translate(-edge, -this.sqH - 3, z);
      rotateX(-HALF_PI);
      rotateZ(HALF_PI);
      textAlign(CENTER, CENTER);
      text(this.size - r, 0, 0);
      pop();
    }

  }

  // ─── Piece renderer ─────────────────────────────────────────────────────────

  _drawPiece(piece, x, yBase, z) {
    const isWhite = piece.color === 'white';
    const bc = isWhite ? [245, 232, 200] : [55, 55, 68];   // body color
    const tc = isWhite ? [210, 170,  90] : [100, 88, 78];   // top/accent color

    push();
    translate(x, yBase, z);
    noStroke();

    const n = piece.constructor.name;

    if (n === 'Pawn') {
      // Body cylinder + sphere head
      fill(...bc);
      push(); translate(0, -11, 0); cylinder(8, 22, 8, 1); pop();
      fill(...tc);
      push(); translate(0, -29, 0); sphere(7, 8, 4); pop();

    } else if (n === 'Rook') {
      // Column + battlement box
      fill(...bc);
      push(); translate(0, -14, 0); cylinder(10, 28, 8, 1); pop();
      fill(...tc);
      push(); translate(0, -31, 0); box(19, 7, 19); pop();
      // Battlements (two small boxes on corners)
      fill(...bc);
      for (const [bx, bz] of [[-6,-6],[-6,6],[6,-6],[6,6]]) {
        push(); translate(bx, -37, bz); box(5, 7, 5); pop();
      }

    } else if (n === 'Knight') {
      // Pedestal + angled head
      fill(...bc);
      push(); translate(0, -13, 0); cylinder(10, 26, 8, 1); pop();
      fill(...tc);
      push(); translate(0, -30, 0); box(15, 10, 12); pop();
      fill(...bc);
      push(); translate(5, -40, 0); rotateZ(0.4); box(8, 14, 9); pop();

    } else if (n === 'Bishop') {
      // Slim column + conical top
      fill(...bc);
      push(); translate(0, -18, 0); cylinder(7, 36, 8, 1); pop();
      fill(...tc);
      push(); translate(0, -42, 0); cone(7, 16, 8, 1); pop();

    } else if (n === 'Queen') {
      // Column + large sphere crown
      fill(...bc);
      push(); translate(0, -20, 0); cylinder(9, 40, 8, 1); pop();
      fill(...tc);
      push(); translate(0, -51, 0); sphere(10, 10, 6); pop();
      // Small spikes (cone points) around crown
      fill(...bc);
      for (let a = 0; a < 5; a++) {
        push();
        const angle = (TWO_PI / 5) * a;
        translate(sin(angle) * 10, -54, cos(angle) * 10);
        cone(3, 8, 6, 1);
        pop();
      }

    } else if (n === 'King') {
      // Column + cross on top
      fill(...bc);
      push(); translate(0, -22, 0); cylinder(9, 44, 8, 1); pop();
      fill(...tc);
      push(); translate(0, -48, 0); box(20, 5, 5); pop(); // horizontal
      push(); translate(0, -55, 0); box(5, 16, 5); pop(); // vertical
    }

    pop();
  }
}
