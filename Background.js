class Background {
  constructor(map) {
    this.map = map;
    this.textures;
    this.ratio = 16 / 9;
    this.engine = new GraphicEngine('background', false);
  }

  InitMapAndSprites() {
    this.engine.addSprite([0, 0], this.textures[2], Utils.madeRectangle(-1, 1, 1, -1));
    let coord = Utils.madeRectangle(0, 0, 1.2 / 16, -(1.2 / 16) * this.ratio);
    this.map.forEach(function(item, j) {
      item.forEach(function(value, i) {
        if (value.isWall) {
          this.engine.addSprite(Utils.translationOnMap(i, j), this.textures[0], coord);
        } else {
          this.engine.addSprite(Utils.translationOnMap(i, j), this.textures[1], coord);
        };
      }.bind(this));
    }.bind(this));
    this.engine.addSprite([-0.9, 0.85], this.textures[3], Utils.madeRectangle(0, 0, 0.2, -0.6)); // часы
    this.engine.addSprite([-0.6, 0.85], this.textures[4], Utils.madeRectangle(0, 0, 1.2, -(1.2 / 16) * 12 * this.ratio), true,
      Utils.madeRectangle(0.008, 0.01, 0.990, 0.992)); // сетка
    this.engine.addSprite([-0.55, -0.79], this.textures[5], Utils.madeRectangle(0, 0, 1.1, -0.1*this.ratio)); // lowbar
    this.engine.addSprite([-0.63, -0.80], this.textures[6], Utils.madeRectangle(0, 0, 0.1, -0.17), true); // стрелочка
  }

  render() {
    let loader = new Loader(['textures/wall.jpg', 'textures/grass.jpg', 'textures/background.png',
      'textures/hourglass.png', 'textures/grid.png', 'textures/initiativeLine.png', 'textures/arrow.png'], this.engine.gl);
    loader.load(this.onLoad.bind(this));
  }

  onLoad(textures) {
    this.textures = textures;
    this.InitMapAndSprites();
    this.engine.render();
  }
}
