class Queen extends Piece {
  constructor() {
    super();
    this.sprite.data = loadImage(`${this.sprite.path}/black/queen.${this.sprite.ext}`);
    this.position = {
      ...this.position,
      start: {
        x: 0,
        y: 0,
      },
    };
  }

  getPosition() {
    return this.position.current;
  }

  setCoordinates(coordinates) {
    this.coordinates = coordinates;
  }
}
