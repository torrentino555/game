'use strict';

let ratio = 16/9;
let activeElem;
let clickElem;
let activeTile;
let gl;
let map = new DungeonMapMaker().dungeonMapMaker(Math.random() * 25 + 20);
let fpsNode = document.createTextNode("");
let timeNode = document.createTextNode("");
let images = [];
let DrawObjects = [];
let AttribLocations = [];
let UniformLocations = [];
let actionDeque = [];
let dropMenu = 0;
let time = 0;

function AddDrawObject(translation, texture, vertexs, blend, texCoord) {
  let obj = new DrawObject(translation, texture, vertexs, blend, texCoord);
  DrawObjects.push(obj);
  return DrawObjects.length - 1;
}

function madeRectangle(x0, y0, width, height) {
  return [
    x0, y0,
    width, y0,
    x0, height,
    x0, height,
    width, y0,
    width, height
  ];
}

function translationOnMap(i, j) {
  return [-0.6 + j*(1.2/16), 0.85 - i*(1.2/16)*ratio];
}

function indexUnit(unit) {
  switch (unit.class) {
    case 'warrior':
      return 0;
      break;
    case 'mage':
      return 1;
      break;
    case 'thief':
      return 2;
      break;
    case 'priest':
      return 3;
      break;
  }
}

function  AddEntity(unit) {
  let nameTexture = unit.class;
  let index;
  switch (nameTexture) {
    case 'warrior':
      index = 9;
      break;
    case 'mage':
      index = 10;
      break;
    case 'thief':
      index = 11;
      break;
    case 'priest':
      index = 12;
      break;
    case 'skeleton2':
      index = 13;
      break;
    case 'skeleton1':
      index = 14;
      break;
    default:
      console.log("ERROR ADDENTITY, NAMETEXTURE NOT FOUND");
  }
  let t = translationOnMap(unit.xpos, unit.ypos);
  t[0] -= 0.015;
  t[1] += (1.2/16)*ratio;
  return unit.mapId = AddDrawObject(t, images[index], madeRectangle(0, 0, 1.2/10, -(1.2/8)*ratio), true,
  madeRectangle(0.25, 0.15, 0.85, 0.80));
}

function moveTo(TileStart, TileDest) {
  let obj = DrawObjects[TileStart.unitOnTile.mapId];
  let time = performance.now()*0.001;
  let pT = obj.translation;
  let nT = translationOnMap(TileDest.xpos, TileDest.ypos);
  nT[0] -= 0.015;
  nT[1] += (1.2/16)*ratio;
  let deltaTranslation = [nT[0] - pT[0], nT[1] - pT[1]];
  let timeAnimation = 2;
  requestAnimationFrame(AnimationMove);

  function AnimationMove(now) {
    now *= 0.001;
    let deltaTime = now - time;
    if (deltaTime >= timeAnimation) {
      obj.translation = nT;
    } else {
      obj.translation = [pT[0] + deltaTranslation[0]*deltaTime/timeAnimation,
        pT[1] + deltaTranslation[1]*deltaTime/timeAnimation];
      requestAnimationFrame(AnimationMove);
    }
  }
}

function Fireball(TileStart, TileDest) {
  let time = performance.now()*0.001;
  let StartObj = DrawObjects[TileStart.unitOnTile.mapId];
  let DestObj = DrawObjects[TileDest.unitOnTile.mapId];
  let StartT = StartObj.translation;
  let DestT = DestObj.translation;
  let deltaT = [DestT[0] - StartT[0], DestT[1] - StartT[1]];
  let timeAnimation = 2;
  let index = AddDrawObject(StartT, images[15], madeRectangle(0, 0, 0.06, -0.06*ratio), true);
  Build();
  requestAnimationFrame(AnimationFireball);
  function AnimationFireball(now) {
    now *= 0.001;
    let deltaTime = now - time;
    if (deltaTime >= timeAnimation) {
      time = now;
      DeleteEntity(index);
      let obj = [];
      for (let ii = TileDest.xpos - 2; ii < TileDest.xpos + 3; ii++) {
        for (let jj = TileDest.ypos - 2; jj < TileDest.ypos + 3; jj++) {
          if (ii >= 0 && ii < 16 && jj >= 0 && jj < 12) {
            obj.push(AddDrawObject(translationOnMap(jj, ii), images[46], madeRectangle(0, 0, 1/16, -(1/16)*ratio), true));
          }
        }
      }
      Build();
      Explosion(obj);
      setTimeout(function(obj) {
        obj.forEach(function(item) {
          DeleteEntity(item);
        });
        Build();
      }, 2000, obj);
    } else {
      let AnimObj = DrawObjects[index];
      AnimObj.texture = images[15 + Math.floor((deltaTime % 1)/(1/31))];
      AnimObj.translation = [StartT[0] + deltaT[0]*deltaTime/timeAnimation, StartT[1] + deltaT[1]*deltaTime/timeAnimation]
      requestAnimationFrame(AnimationFireball);
    }
  }
}

function Explosion(obj) {
  let time = performance.now()*0.001;
  let timeAnimation = 2;
  requestAnimationFrame(AnimationExplosion);

  function AnimationExplosion(now) {
    now *= 0.001;
    let deltaTime = now - time;
    if (deltaTime < timeAnimation) {
      let texture = images[46 + Math.floor((deltaTime % 1)/(1/44))];
      obj.forEach(function(item) {
        DrawObjects[item].texture = texture;
      });
      requestAnimationFrame(AnimationExplosion);
    }
  }
}

function DeleteEntity(index) {
  delete DrawObjects[index];
}

function ActiveEntity(unit) {
  if (DrawObjects[activeTile].translation[0] == -2) {
    console.log(DrawObjects[unit.mapId].translation)
    DrawObjects[activeTile].translation = translationOnMap(unit.xpos, unit.ypos);
  }
  document.onmousedown = function(event) {
      if (event.which == 1 && activeElem[1] != -1 && dropMenu == 0) {
        let div = document.createElement('div');
        dropMenu = div;
        let ul = document.createElement('ul');
        div.className = 'drop-menu';
        div.style.left = event.clientX - 40 + 'px';
        div.style.top = event.clientY - 15 + 'px';
        div.appendChild(ul);
        unit.skills.forEach(function(item) {
          let li = document.createElement('li');
          li.innerHTML = item.name;
          li.onclick = function() {
            actionDeque.push([unit, item, map[activeElem[1]][activeElem[2]].unitOnTile]);
            dropMenu.remove();
            dropMenu = 0;
          };
          ul.appendChild(li);
        });
        document.getElementsByClassName('container')[0].appendChild(div);
      } else if (event.which == 1 && dropMenu != 0 && event.target.tagName != 'LI') {
        dropMenu.remove();
        dropMenu = 0;
      }
    };
}

function unitAttack(nameSkill, sender, target) {
  let index = indexUnit(sender.unitOnTile);
  DrawObjects[sender.unitOnTile.mapId].texture = images[90 + 3*index];
  setTimeout(function(nameSkill, sender, target) {
    DrawObjects[sender.unitOnTile.mapId].texture = images[91 + 3*index];
    switch (nameSkill) {
      case 'fireball':
        Fireball(sender, target);
        setTimeout(function(sender, target) {
          // DrawObjects[target.unitOnTile.mapId].texture = images[92];
          DrawObjects[sender.unitOnTile.mapId].texture = images[9 + index];
        }, 2000, sender, target);
        break;
    }
  }, 500, nameSkill, sender, target);
}

function unitAttackAndKill(nameSkill, sender, target, DeadUnits) {
  let index= indexUnit(sender.unitOnTile);
  DrawObjects[sender.unitOnTile.mapId].texture = images[90 + 3*index];
  setTimeout(() => {
    DrawObjects[sender.unitOnTile.mapId].texture = images[91 + 3*index];
    switch (nameSkill) {
      case 'fireball':
        Fireball(sender, target);
        setTimeout(function(sender, target) {
          // DrawObjects[target.unitOnTile.mapId].texture = images[92];
          DrawObjects[sender.unitOnTile.mapId].texture = images[9 + index];
          DeadUnits.forEach((unit) => {
            DrawObjects[unit.mapId].texture = images[92 + 3*indexUnit(unit)];
          });
        }, 2050, sender, target);
        break;
    }
  }, 500);

}

function loadImage(url, callback) {
  let image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(urls, callback, arg) {
  let imagesToLoad = urls.length;
  let onImageLoad = function() {
    imagesToLoad--;
    if (imagesToLoad == 0) {
      callback(arg);
    }
  };
  for (let i = 0; i < imagesToLoad; i++) {
    let image = loadImage(urls[i], onImageLoad);
    images.push(image);
  }
}

function setTranslation(index, x) {
  DrawObjects[index].translation = x;
}

function InitGlAndEvents() {
  gl = canvas.getContext("webgl");
  if (!gl) {
    alert('Беда, брат! Твой браузер не поддерживает WebGl, но ты держись :D');
  return;
  }
  gl.canvas.onmousemove = function(event) {
    let x = event.clientX / gl.canvas.clientWidth;
    let y = event.clientY / gl.canvas.clientHeight;
    if (x >= 0.2 && x <= 0.8 && y >= 0.065 && y <= 0.865) {
      let i = Math.floor(((x - 0.2)/0.6)/(1/16));
      let j = Math.floor(((y - 0.065)/0.8)/(1/12));
      if (map[j][i].isWall) {
        setTranslation(activeElem[0], [-2, -2]);
        activeElem[1] = -1;
        activeElem[2] = -1;
      } else if (activeElem[1] == -1 || activeElem[1] != i || activeElem[2] != j) {
        setTranslation(activeElem[0], translationOnMap(j, i));
        activeElem[1] = i;
        activeElem[2] = j;
      }
    } else {
      setTranslation(activeElem[0], [-2, -2]);
      activeElem[1] = -1;
    }
  };
  document.addEventListener("contextmenu",
    function(event) {
      event.preventDefault();
  });

  gl.canvas.onmouseup = function(event) {
    if (DrawObjects[clickElem].translation[0] != -2) {
      setTranslation(clickElem, [-2, -2]);
    }
  };
}

function InitHtmlObjects() {
  document.getElementById('fps').appendChild(fpsNode);
  let timeElem = document.getElementById('time');
  timeElem.appendChild(timeNode);
  timeElem.parentNode.style.top = "25%";
  timeElem.parentNode.style.left = "6.3%";
}

function InitMapAndBackground() {
  AddDrawObject([0, 0], images[6], madeRectangle(-1, 1, 1, -1));
  let coord = madeRectangle(0, 0, 1.2/16, -(1.2/16)*ratio);
  map.forEach(function (item, i) {
    item.forEach(function (value, j) {
    if (!value.isWall) {
      AddDrawObject(translationOnMap(i, j), images[0], coord);
    } else {
      AddDrawObject(translationOnMap(i, j), images[1], coord);
    };
  })});
}

function InitGui() {
  activeElem = [
    AddDrawObject([-2, -2], images[2], madeRectangle(0, 0, 1.2/16, -(1.2/16)*ratio)), -1, -1];
  clickElem = AddDrawObject([-2, -2], images[3], madeRectangle(0, 0, 1.2/16, -(1.2/16)*ratio));
  activeTile = AddDrawObject([-2, -2], images[102], madeRectangle(0, 0, 1.2/16, -(1.2/16)*ratio));
  AddDrawObject([-0.6, 0.85], images[8], madeRectangle(0, 0, 1.2, -(1.2/16)*12*ratio), true,
  madeRectangle(0.008, 0.01, 0.990, 0.992)); // сетка
  AddDrawObject([-0.55, -0.79], images[5], madeRectangle(0, 0, 1.1, -0.2)); // lowbar
  AddDrawObject([-0.63, -0.80], images[4], madeRectangle(0, 0, 0.1, -0.17), true); // стрелочка
  AddDrawObject([-0.9, 0.95], images[7], madeRectangle(0, 0, 0.2, -0.6)); // часы
}

function Build() {
  let defTexCoord = madeRectangle(0, 0, 1, 1);
  let texCoord = [];
  let vertexs = [];
  DrawObjects.forEach(function(item) {
    vertexs = vertexs.concat(item.vertexs);
    if (item.texCoord) {
      texCoord = texCoord.concat(item.texCoord);
    } else {
      texCoord = texCoord.concat(defTexCoord);
    }
  });
  AttribLocations[0].coord = vertexs;
  AttribLocations[1].coord = texCoord;

  AttribLocations.forEach(function(obj, i) {
    obj.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.coord), gl.STATIC_DRAW);
  });
}

function StartGame() {
  var program = createProgramWithShaders(gl,
    [['2d-vertex-shader', gl.VERTEX_SHADER], ['2d-fragment-shader', gl.FRAGMENT_SHADER]]);

  AttribLocations.push({name: 'position', location: gl.getAttribLocation(program, 'a_position')});
  AttribLocations.push({name: 'texCoord', location: gl.getAttribLocation(program, 'a_texcoord')});
  UniformLocations.push({name: 'translation', location: gl.getUniformLocation(program, 'u_translation')});

  Build();

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

    resize(gl);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    AttribLocations.forEach(function(obj, i) {
      gl.enableVertexAttribArray(obj.location);
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
      gl.vertexAttribPointer(obj.location, 2, gl.FLOAT, false, 0, 0);
    });

    Draw();
    requestAnimationFrame(DrawScene);
  }

  function Draw() {
    let offset = 0;
    DrawObjects.forEach(function(obj, i) {
      if (obj.blend) {
        gl.enable( gl.BLEND );
        gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      } else {
        gl.disable(gl.BLEND);
      }
      gl.uniform2fv(UniformLocations[0].location, obj.translation);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, obj.texture);
      gl.drawArrays(gl.TRIANGLES, offset, 6);
      offset += 6;
    });
  }
}

function InitGraphic(callback) {
  InitGlAndEvents();
  InitHtmlObjects();
  InitMapAndBackground();
  InitGui();
  StartGame();
  callback();
}

function StartGraphic(callback) {
  loadImages(['textures/grass.jpg', 'textures/wall.jpg', 'textures/activeGrass.jpg',
  'textures/clickGrass.jpg','textures/arrow.png', 'textures/lowbar.jpg',
  'textures/background.jpg', 'textures/hourglass.png', 'textures/grid.png', 'entity/warrior.png',
  'entity/mage.png', 'entity/thief.png', 'entity/priest.png', 'entity/skeleton2.png',
  'entity/skeleton1.png', 'animations/fireball/1.gif', 'animations/fireball/2.gif',
  'animations/fireball/3.gif', 'animations/fireball/4.gif', 'animations/fireball/5.gif',
  'animations/fireball/6.gif', 'animations/fireball/7.gif', 'animations/fireball/8.gif',
  'animations/fireball/9.gif', 'animations/fireball/10.gif', 'animations/fireball/11.gif',
  'animations/fireball/12.gif', 'animations/fireball/13.gif', 'animations/fireball/14.gif',
  'animations/fireball/15.gif', 'animations/fireball/16.gif', 'animations/fireball/17.gif',
  'animations/fireball/18.gif', 'animations/fireball/19.gif', 'animations/fireball/20.gif',
  'animations/fireball/21.gif', 'animations/fireball/22.gif', 'animations/fireball/23.gif',
  'animations/fireball/24.gif', 'animations/fireball/25.gif', 'animations/fireball/26.gif',
  'animations/fireball/27.gif', 'animations/fireball/28.gif', 'animations/fireball/29.gif',
  'animations/fireball/30.gif', 'animations/fireball/31.gif', 'animations/explosion/1.gif',
  'animations/explosion/2.gif',
  'animations/explosion/3.gif', 'animations/explosion/4.gif', 'animations/explosion/5.gif',
  'animations/explosion/6.gif', 'animations/explosion/7.gif', 'animations/explosion/8.gif',
  'animations/explosion/9.gif', 'animations/explosion/10.gif', 'animations/explosion/11.gif',
  'animations/explosion/12.gif', 'animations/explosion/13.gif', 'animations/explosion/14.gif',
  'animations/explosion/15.gif', 'animations/explosion/16.gif', 'animations/explosion/17.gif',
  'animations/explosion/18.gif', 'animations/explosion/19.gif', 'animations/explosion/20.gif',
  'animations/explosion/21.gif', 'animations/explosion/22.gif', 'animations/explosion/23.gif',
  'animations/explosion/24.gif', 'animations/explosion/25.gif', 'animations/explosion/26.gif',
  'animations/explosion/27.gif', 'animations/explosion/28.gif', 'animations/explosion/29.gif',
  'animations/explosion/30.gif', 'animations/explosion/31.gif', 'animations/explosion/32.gif',
  'animations/explosion/33.gif',
  'animations/explosion/34.gif', 'animations/explosion/35.gif', 'animations/explosion/36.gif',
  'animations/explosion/37.gif', 'animations/explosion/38.gif', 'animations/explosion/39.gif',
  'animations/explosion/40.gif', 'animations/explosion/41.gif', 'animations/explosion/42.gif',
  'animations/explosion/43.gif', 'animations/explosion/44.gif', 'conditions/WarriorAngry.png',
  'conditions/WarriorAttack.png', 'conditions/WarriorDead.png',
  'conditions/MageAngry.png',
  'conditions/MageAttack.png', 'conditions/MageDead.png',
  'conditions/ThiefAngry.png',
  'conditions/ThiefAttack.png', 'conditions/ThiefDead.png',
  'conditions/PriestAngry.png',
  'conditions/PriestAttack.png', 'conditions/PriestDead.png', 'textures/activeTile.png'], InitGraphic, callback);
}
//
// function Game() {
//   let skills = [new Skill(), new Skill()];
//   skills[0].name = 'fireball';
//   skills[1].name = 'move';
//   let units = [new Unit(), new Unit(), new Unit(), new Unit()];
//   map[9][10].unitOnTile = units[0];
//   map[9][10].xpos = 9;
//   map[9][10].ypos = 10;
//   units[0].xpos = 9;
//   units[0].ypos = 10;
//   units[0].class = "mage";
//   units[0].skills = skills;
//   AddEntity(units[0]);
//   map[6][5].unitOnTile = units[1];
//   units[1].class = "warrior";
//   units[1].skills = skills;
//   map[6][5].xpos = 6;
//   map[6][5].ypos = 5;
//   units[1].xpos = 6;
//   units[1].ypos = 5;
//   AddEntity(units[1]);
//   map[10][9].unitOnTile = units[2];
//   units[2].class = "thief";
//   units[2].skills = skills;
//   map[10][9].xpos = 10;
//   map[10][9].ypos = 9;
//   units[2].xpos = 10;
//   units[2].ypos = 9;
//   AddEntity(units[2]);
//   map[10][10].unitOnTile = units[3];
//   units[3].class = "priest";
//   units[3].skills = skills;
//   map[10][10].xpos = 10;
//   map[10][10].ypos = 10;
//   units[3].xpos = 10;
//   units[3].ypos = 10;
//   AddEntity(units[3]);
//   Build();
//   ActiveEntity(units[3]);
//   unitAttackAndKill('fireball', map[units[1].xpos][units[1].ypos], map[units[3].xpos][units[3].ypos], [units[0], units[2], units[3]]);
//   // moveTo(map[3][3], map[3][10]);
// }
//
// StartGraphic(Game);
