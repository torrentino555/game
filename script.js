'use strict';

let ratio = 16/9;
let activeElem = -1;
let clickElem = -1;
let gl = canvas.getContext("webgl");
let mass = dungeonMapMaker(16, 12, Math.random() * 25 + 20);
let fpsNode = document.createTextNode("");
let timeNode = document.createTextNode("");
let images = [];
let time = 0;

function loadImage(url, callback) {
  let image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(urls, callback) {
  let imagesToLoad = urls.length;
  let onImageLoad = function() {
    imagesToLoad--;
    if (imagesToLoad == 0) {
      callback();
    }
  };
  for (let i = 0; i < imagesToLoad; i++) {
    let image = loadImage(urls[i], onImageLoad);
    images.push(image);
  }
}

function init() {
  if (!gl) {
    alert('Беда, брат! Твой браузер не поддерживает WebGl, но ты держись :D');
  return;
  }
  gl.canvas.onmousemove = function(event) {
    let x = event.clientX / gl.canvas.clientWidth;
    let y = event.clientY / gl.canvas.clientHeight;
    if (x >= 0.2 && x <= 0.8 && y >= 0.025 && y <= 0.825) {
      let i = Math.floor(((x - 0.2)/0.6)/(1/16));
      let j = Math.floor(((y - 0.025)/0.8)/(1/12));
      activeElem = [i, j];
    } else {
      activeElem = -1;
    }
  };
  document.addEventListener("contextmenu",
    function(event) {
      event.preventDefault();
  });
  document.addEventListener('mousedown',
    function(event) {
      if (event.which == 3 && activeElem != -1) {
        let div = document.createElement('div');
        let ul = document.createElement('ul');
        div.className = 'drop-menu';
        div.style.left = event.clientX - 40 + 'px';
        div.style.top = event.clientY - 15 + 'px';
        div.appendChild(ul);
        let colls = ['magic arrow', 'fireball', 'thunderball', 'lightning'];
        colls.forEach(function(item) {
          let li = document.createElement('li');
          let img = new Image();
          img.src = 'icons/' + item + '.png';
          img.style.width = "25px";
          img.style.height = "25px";
          img.style.paddingRight = "5px";
          img.onload = function() { li.insertBefore(img, li.firstChild);};
          li.innerHTML = item;
          ul.appendChild(li);
        });
        document.getElementsByClassName('container')[0].appendChild(div);
        console.log("Правый клик");
        console.log(event.clientX + " " + event.clientY);
      } else if (activeElem != -1) {
        clickElem = activeElem;
      }
  });
  gl.canvas.onmouseup = function(event) {
    if (clickElem != -1) {
      clickElem = -1;
    }
  };
  document.getElementById('fps').appendChild(fpsNode);
  let timeElem = document.getElementById('time');
  timeElem.appendChild(timeNode);
  timeElem.parentNode.style.top = "25%";
  timeElem.parentNode.style.left = "5.7%";

}

function StartGame() {
  var program = createProgramWithShaders(gl,
    [['2d-vertex-shader', gl.VERTEX_SHADER], ['2d-fragment-shader', gl.FRAGMENT_SHADER]]);

  var positionLocation = gl.getAttribLocation(program, 'a_position');
  var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord');
  var translationLocation = gl.getUniformLocation(program, 'u_translation');

  var positionBuffer = gl.createBuffer();
  var texBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);;
  setTexcoords(gl);

  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  requestAnimationFrame(DrawScene);

  function DrawScene(now) {
    now *= 0.001;
    var deltaTime = now - time;
    time = now;
    fpsNode.nodeValue = (1/deltaTime).toFixed(0);
    let minutes = Math.floor(now / 60);
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    let seconds = Math.floor(now % 60);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    timeNode.nodeValue = minutes + ":" + seconds;
    console.log(Math.floor(100 + 100*gl.canvas.clientWidth/1300) + "%");
    document.getElementById('time').style.fontSize = gl.canvas.clientWidth/5.3 + "%";

    resize(gl);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    Draw(translationLocation);
    requestAnimationFrame(DrawScene);
  }

  function Draw() {
    var primitiveType = gl.TRIANGLES;
    gl.uniform2fv(translationLocation, [0, 0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[6]);
    gl.drawArrays(primitiveType, 0, 6);
    mass.forEach(function (item, j) {
      item.forEach(function (value, i) {
      let index;
      if (value) {
        index = 1;
      } else if (clickElem != -1 && i == clickElem[0] && j == clickElem[1]) {
        index = 3;
      } else if (activeElem != -1 && i == activeElem[0] && j == activeElem[1] ) {
        index = 2;
      } else {
        index = 0;
      }
      gl.uniform2fv(translationLocation, [-0.6 + i*(1.2/16), 0.95 - j*(1.2/16)*ratio]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[index]);
      gl.drawArrays(primitiveType, 6, 6);
    })});
    gl.enable( gl.BLEND );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform2fv(translationLocation, [-0.6, 0.95]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[8]);
    gl.drawArrays(primitiveType, 30, 6);
    gl.uniform2fv(translationLocation, [-0.55, -0.62]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[4]);
    gl.drawArrays(primitiveType, 12, 6);
    gl.disable(gl.BLEND);
    gl.uniform2fv(translationLocation, [-0.55, -0.75]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[5]);
    gl.drawArrays(primitiveType, 18, 6);
    gl.uniform2fv(translationLocation, [-0.9, 0.95]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[7]);
    gl.drawArrays(primitiveType, 24, 6);
  }
}

init();
loadImages(['textures/grass.jpg', 'textures/wall.jpg', 'textures/activeGrass.jpg',
'textures/clickGrass.jpg','textures/arrow.png', 'textures/lowbar.jpg',
'textures/background.jpg', 'textures/hourglass.png', 'textures/grid.png'], StartGame);
