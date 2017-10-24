function setTexcoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
       ]),
       gl.STATIC_DRAW);
}

function setGeometry(gl) {
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0,
    1.4/16, 0,
    0, 1.4/12,
    0, 1.4/12,
    1.4/16, 0,
    1.4/16, 1.4/12
  ]), gl.STATIC_DRAW);
}
