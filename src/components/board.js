class Board {
  constructor() {
    this.size = 8;
    this.sizeSquare = 60;
    this.spaceOut = 30;
    this.colors = {
      primary: color('#222831'),
      secondary: color('#ececec'),
    };
    this.matrix = [];
  }

  build() {
    this.matrix = new Array(this.size).fill(new Array(this.size).fill({})).map((_, i) => {
      return _.map((__, j) => {
        const x = this.sizeSquare * i + this.spaceOut;
        const y = this.sizeSquare * j + this.spaceOut;
        const color = (i % 2 === 0 && j % 2 === 0) || (i % 2 === 1 && j % 2 === 1) ? this.colors.primary : this.colors.secondary;

        return {
          coordinates: { x, y },
          player: null,
          color,
        };
      });
    });
  }

  draw() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const current = this.matrix[i][j];

        fill(current.color);
        square(current.coordinates.x, current.coordinates.y, this.sizeSquare);
      }
    }
  }

  getCoordinates(position) {
    return this.matrix[position.x][position.y].coordinates;
  }
}
