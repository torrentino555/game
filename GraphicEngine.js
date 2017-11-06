class GraphicEngine {
  constructor(idCanvas, loop) {
    this.sprites = [];
    this.loop = loop;
    this.gl = document.getElementById(idCanvas).getContext("webgl");
    if (!this.gl) {
      alert('Error in initializate ' + idCanvas + ': Беда, брат! Твой браузер не поддерживает WebGl, но ты держись :D');
      return;
    }
    window.addEventListener('resize', function() {
      this.render(performance.now());
    }.bind(this));
    this.programForSprite = new Program(this.gl, vertexShader, fragmentShader).create();
    this.programForColorObj = new Program(this.gl, vertexShader1, fragmentShader1).create()
  }

  addSprite(translation, texture, vertexs, blend, texCoord) {
    let attributes = [new Attribute('a_position', vertexs),
      new Attribute('a_texcoord', texCoord ? texCoord : Utils.madeRectangle(0, 0, 1, 1))
    ];
    let uniforms = [new Uniform('u_translation', translation)];
    let sprite = new DrawObject(this.gl, this.programForSprite, attributes, uniforms, blend, texture);
    this.sprites.push(sprite);
    return this.sprites.length - 1;
  }

  addColorSprite(translation, vertexs, color, blend) {
    let attributes = [new Attribute('a_position', vertexs)];
    let uniforms = [new Uniform('u_translation', translation), new Uniform('u_color', color)];
    let sprite = new DrawObject(this.gl, this.programForColorObj, attributes, uniforms, blend);
    this.sprites.push(sprite);
    return this.sprites.length - 1;
  }

  render(now) {
    Utils.resize(this.gl);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    let lastProgram;
    this.sprites.forEach((sprite) => {
      if (lastProgram == undefined) {
        this.gl.useProgram(sprite.program);
        lastProgram = sprite.program;
      } else if (lastProgram != sprite.program) {
        this.gl.useProgram(sprite.program);
        lastProgram = sprite.program;
      }
      sprite.render();
    });

    if (this.loop) {
      requestAnimationFrame(this.render.bind(this));
    }
  }
}
