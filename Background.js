class Background {
  constructor(map) {
    this.tiledMap = map;
    this.textures;
    this.ratio = 16 / 9;
    this.DrawObjects = [];
    this.gl = document.getElementById('background').getContext("webgl");
    if (!this.gl) {
      alert('Беда, брат! Твой браузер не поддерживает WebGl, но ты держись :D');
      return;
    }
    this.program = new Program(this.gl, '2d-vertex-shader', '2d-fragment-shader').create();
    this.texture = this.gl.createTexture();
  }

  NewAdd(program, translation, texture, vertexs, blend, texCoord) {
    let attributes = [new Attribute('a_position', vertexs),
                      new Attribute('a_texcoord', texCoord ? texCoord : Utils.madeRectangle(0, 0, 1, 1))];
    let uniforms = [new Uniform('u_translation', translation)];
    let obj = new DrawObject(this.gl, program, attributes, uniforms, blend, texture);
    this.DrawObjects.push(obj);
  }

  AddDrawObject(translation, texture, vertexs, blend, texCoord) {
    this.NewAdd(this.program, translation, texture, vertexs, blend, texCoord);
  }

  AddMapAndBackground() {
    this.AddDrawObject([0, 0], this.textures[2], Utils.madeRectangle(-1, 1, 1, -1));
    let coord = Utils.madeRectangle(0, 0, 1.2 / 16, -(1.2 / 16) * this.ratio);
    this.tiledMap.forEach(function(item, j) {
      item.forEach(function(value, i) {
        if (value.isWall) {
          this.AddDrawObject(Utils.translationOnMap(i, j), this.textures[0], coord);
        } else {
          this.AddDrawObject(Utils.translationOnMap(i, j), this.textures[1], coord);
        };
      }.bind(this));
    }.bind(this));
  }

  AddGui() {
    this.AddDrawObject([-0.9, 0.85], this.textures[3], Utils.madeRectangle(0, 0, 0.2, -0.6)); // часы
    this.AddDrawObject([-0.6, 0.85], this.textures[4], Utils.madeRectangle(0, 0, 1.2, -(1.2 / 16) * 12 * this.ratio), true,
      Utils.madeRectangle(0.008, 0.01, 0.990, 0.992)); // сетка
    this.AddDrawObject([-0.55, -0.79], this.textures[5], Utils.madeRectangle(0, 0, 1.1, -0.1*this.ratio)); // lowbar
    this.AddDrawObject([-0.63, -0.80], this.textures[6], Utils.madeRectangle(0, 0, 0.1, -0.17), true); // стрелочка
  }

  render() {
    let Loader = new loader(['textures/wall.jpg', 'textures/grass.jpg', 'textures/background.png',
      'textures/hourglass.png', 'textures/grid.png', 'textures/initiativeLine.png', 'textures/arrow.png'], this.gl);
    Loader.load(this.onLoad.bind(this));
  }

  onLoad(textures) {
    this.textures = textures;
    this.AddMapAndBackground();
    this.AddGui();
    window.onresize = function() {
      this.draw();
    }.bind(this);
    this.gl.useProgram(this.program);
    this.draw();
  }

  draw() {
    this.gl.disable(this.gl.DEPTH_TEST);
    let time = performance.now()*0.001;
    Utils.resize(this.gl);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.DrawObjects.forEach(function(item) {
      item.render();
    });
    console.log(performance.now()*0.001 - time);
  }
}
