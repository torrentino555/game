class Program {
  constructor(gl, vertexShader, fragmentShader) {
    this.gl = gl;
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
  }

  createShader(type, source) {
    let shader = this.gl.createShader(type); // создание шейдера
    this.gl.shaderSource(shader, source); // устанавливаем шейдеру его программный код
    this.gl.compileShader(shader); // компилируем шейдер
    let success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (success) { // если компиляция прошла успешно - возвращаем шейдер
      return shader;
    }
    console.log(this.gl.getShaderInfoLog(shader));
    this.gl.deleteShader(shader);
  }

  create() {
    let program = this.gl.createProgram();
    let source1 = document.getElementById(this.vertexShader).text;
    let source2 = document.getElementById(this.fragmentShader).text;
    this.gl.attachShader(program , this.createShader(this.gl.VERTEX_SHADER, source1));
    this.gl.attachShader(program , this.createShader(this.gl.FRAGMENT_SHADER, source2));
    this.gl.linkProgram(program);
    let success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (success) {
      return program;
    }
    console.log(this.gl.getProgramInfoLog(program));
    this.gl.deleteProgram(program);
  }
}
