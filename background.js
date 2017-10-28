class background {
  constructor(map) {
    this.tiledMap = map;
    this.textures;
    this.ratio = 16 / 9;
    this.DrawObjects = [];
    this.AttribLocations = [];
    this.UniformLocations = [];
    this.gl = document.getElementById('background').getContext("webgl");
    if (!this.gl) {
      alert('Беда, брат! Твой браузер не поддерживает WebGl, но ты держись :D');
      return;
    }

  }

  Build() {
    let defTexCoord = background.madeRectangle(0, 0, 1, 1);
    let texCoord = [];
    let vertexs = [];
    this.DrawObjects.forEach(function(item) {
      vertexs = vertexs.concat(item.vertexs);
      if (item.texCoord) {
        texCoord = texCoord.concat(item.texCoord);
      } else {
        texCoord = texCoord.concat(defTexCoord);
      }
    });
    this.AttribLocations[0].coord = vertexs;
    this.AttribLocations[1].coord = texCoord;

    this.AttribLocations.forEach(function(obj, i) {
      obj.buffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj.buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(obj.coord), this.gl.STATIC_DRAW);
    }.bind(this));
  }

  AddDrawObject(translation, texture, vertexs, blend, texCoord) {
    let obj = new DrawObject(translation, texture, vertexs, blend, texCoord);
    this.DrawObjects.push(obj);
    return this.DrawObjects.length - 1;
  }

  AddMapAndBackground() {
    this.AddDrawObject([0, 0], this.textures[2], background.madeRectangle(-1, 1, 1, -1));////
    let coord = background.madeRectangle(0, 0, 1.2 / 16, -(1.2 / 16) * this.ratio);
    this.tiledMap.forEach(function(item, j) {
      item.forEach(function(value, i) {
        if (value.isWall) {
          this.AddDrawObject(translationOnMap(i, j), this.textures[0], coord);
        } else {
          this.AddDrawObject(translationOnMap(i, j), this.textures[1], coord);
        };
      }.bind(this));
    }.bind(this));
  }

  AddGui() {
    this.AddDrawObject([-0.9, 0.95], this.textures[3], background.madeRectangle(0, 0, 0.2, -0.6)); // часы
    this.AddDrawObject([-0.6, 0.85], this.textures[4], background.madeRectangle(0, 0, 1.2, -(1.2 / 16) * 12 * this.ratio), true,
      background.madeRectangle(0.008, 0.01, 0.990, 0.992)); // сетка
  }

  static madeRectangle(x0, y0, width, height) {
    return [
      x0, y0,
      width, y0,
      x0, height,
      x0, height,
      width, y0,
      width, height
    ];
  }

  static translationOnMap(i, j) {
    return [-0.6 + j * (1.2 / 16), 0.85 - i * (1.2 / 16) * ratio];
  }

  render() {
    let Loader = new loader(['textures/wall.jpg', 'textures/grass.jpg', 'textures/background.jpg',
      'textures/hourglass.png', 'textures/grid.png']);
    Loader.load(this.onLoad.bind(this));
  }

  onLoad(textures) {
    this.textures = textures;
    this.AddMapAndBackground();
    this.AddGui();
    this.draw();
  }

  draw() {
    this.program = createProgramWithShaders(this.gl, [
      [
        '2d-vertex-shader', this.gl.VERTEX_SHADER
      ],
      ['2d-fragment-shader', this.gl.FRAGMENT_SHADER]
    ]);

    this.AttribLocations.push({
      name: 'position',
      location: this.gl.getAttribLocation(this.program, 'a_position')
    });
    this.AttribLocations.push({
      name: 'texCoord',
      location: this.gl.getAttribLocation(this.program, 'a_texcoord')
    });
    this.UniformLocations.push({
      name: 'translation',
      location: this.gl.getUniformLocation(this.program, 'u_translation')
    });

    this.Build();

    resize(this.gl);

    let texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.program);

    this.AttribLocations.forEach(function(obj, i) {
      this.gl.enableVertexAttribArray(obj.location);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj.buffer);
      this.gl.vertexAttribPointer(obj.location, 2, this.gl.FLOAT, false, 0, 0);
    }.bind(this));

    let offset = 0;
    this.DrawObjects.forEach(function(obj, i) {
      if (obj.blend) {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      } else {
        this.gl.disable(this.gl.BLEND);
      }
      this.gl.uniform2fv(this.UniformLocations[0].location, obj.translation);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, obj.texture);
      this.gl.drawArrays(this.gl.TRIANGLES, offset, 6);
      offset += 6;
    }.bind(this));
    console.log("END");
    // requestAnimationFrame(this.draw.bind(this));
  }
}
