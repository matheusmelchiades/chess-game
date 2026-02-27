let board3d;
let game3d;
let statusEl;

// Camera state
let camRotX  = -PI / 4;   // elevation angle (negative = looking down)
let camRotY  = PI / 8;    // horizontal rotation
let camDist  = 560;

let _dragStart = null;

// ─── p5.js lifecycle ──────────────────────────────────────────────────────────

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  statusEl = createDiv('');
  statusEl.style('position', 'fixed');
  statusEl.style('bottom', '24px');
  statusEl.style('width', '100%');
  statusEl.style('text-align', 'center');
  statusEl.style('color', '#f0f0f0');
  statusEl.style('font-size', '18px');
  statusEl.style('font-family', 'monospace, sans-serif');
  statusEl.style('pointer-events', 'none');
  statusEl.style('letter-spacing', '0.05em');
  statusEl.style('text-shadow', '0 1px 6px rgba(0,0,0,0.9)');

  _startGame();
}

function draw() {
  background(18, 20, 28);

  // ── Camera ──────────────────────────────────────────────────────────────────
  const cr  = cos(camRotX);
  const sr  = sin(camRotX);
  const ey  = camDist * sr;          // negative = above board
  const ehr = camDist * cr;          // horizontal distance from origin
  const ex  = ehr * sin(camRotY);
  const ez  = ehr * cos(camRotY);

  camera(ex, ey, ez, 0, 0, 0, 0, 1, 0);

  // ── Lighting ─────────────────────────────────────────────────────────────────
  ambientLight(80);
  directionalLight(220, 210, 190, sin(camRotY), 1.2, cos(camRotY));
  pointLight(180, 180, 255, -300, -400, -300);

  // ── Scene ────────────────────────────────────────────────────────────────────
  const inCheck = game3d.status === 'check' || game3d.status === 'checkmate';
  board3d.draw(game3d.selectedPiece, game3d.validMoves, inCheck, game3d.currentPlayer);

  // ── HUD ──────────────────────────────────────────────────────────────────────
  _updateStatusEl();
}

// ─── Input ────────────────────────────────────────────────────────────────────

function mousePressed() {
  _dragStart = { x: mouseX, y: mouseY, rx: camRotX, ry: camRotY };
}

function mouseDragged() {
  if (!_dragStart) return;
  const dx = (mouseX - _dragStart.x) * 0.009;
  const dy = (mouseY - _dragStart.y) * 0.009;
  camRotY = _dragStart.ry + dx;
  camRotX = constrain(_dragStart.rx + dy, -HALF_PI + 0.08, -0.15);
}

function mouseWheel(event) {
  camDist = constrain(camDist + event.delta * 0.4, 220, 1200);
  return false; // prevent page scroll
}

function mouseClicked() {
  if (!_dragStart) return;

  // Only treat as a click if mouse barely moved (not a drag)
  const moved = dist(mouseX, mouseY, _dragStart.x, _dragStart.y);
  if (moved > 6) return;

  if (game3d.status === 'checkmate' || game3d.status === 'stalemate') {
    _startGame();
    return;
  }

  game3d.handleClick(mouseX, mouseY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _startGame() {
  board3d = new Board3D();
  game3d  = new Game(board3d);
  game3d.initPieces();
}

function _updateStatusEl() {
  let html = '';

  if (game3d.status === 'checkmate') {
    const winner = game3d.currentPlayer === 'white' ? 'Black' : 'White';
    html = `<span style="color:#ffd700;font-size:22px">Checkmate! ${winner} wins!</span>` +
           `<br><span style="color:#aaa;font-size:14px">Click anywhere to restart</span>`;
  } else if (game3d.status === 'stalemate') {
    html = `<span style="color:#ccc;font-size:22px">Stalemate — Draw</span>` +
           `<br><span style="color:#aaa;font-size:14px">Click anywhere to restart</span>`;
  } else {
    const name  = game3d.currentPlayer === 'white' ? 'White' : 'Black';
    const color = game3d.currentPlayer === 'white' ? '#f0e8d0' : '#aaa';
    html = `<span style="color:${color}">${name}&rsquo;s turn</span>`;
    if (game3d.status === 'check') {
      html += `&nbsp;&nbsp;<span style="color:#e74c3c;font-weight:bold">CHECK!</span>`;
    }
    html += `<br><span style="color:#555;font-size:13px">drag to orbit &nbsp;·&nbsp; scroll to zoom</span>`;
  }

  statusEl.html(html);
}
