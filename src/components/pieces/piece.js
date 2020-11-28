class Piece {
  constructor() {
    this.sprite = {
      path: 'src/components/pieces/sprites',
      ext: 'png',
      data: null,
    };
    this.size = 30;
    this.coordinates = {
      x: null,
      y: null,
    };
    this.position = {
      start: {
        x: 0,
        y: 0,
      },
      current: {
        x: 0,
        y: 0,
      },
    };
  }

  draw() {
    if (this.sprite.data && this.coordinates.x && this.coordinates.y) {
      imageMode(CENTER);
      image(this.sprite.data, this.coordinates.x + this.size, this.coordinates.y + this.size, this.size, this.size);
    }
  }

  moveUp() {
    const { x, y } = this.position.current;
    const target = y - 1;

    if (target >= 0) {
      this.position.current = { x, y: target };
    }
  }

  moveRight() {
    const { x, y } = this.position.current;
    const target = x + 1;

    if (target < 8) {
      this.position.current = { x: target, y };
    }
  }

  moveLeft() {
    const { x, y } = this.position.current;
    const target = x - 1;

    if (target >= 0) {
      this.position.current = { x: target, y };
    }
  }

  moveDown() {
    const { x, y } = this.position.current;
    const target = y + 1;

    if (target < 8) {
      this.position.current = { x, y: target };
    }
  }
}
