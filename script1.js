'use strict';

let ratio = 16 / 9;
let activeElem;
let activeTile;
let gl;
let fpsNode = document.createTextNode("");
let images = [];
let DrawObjects = [];
let dropMenu = 0;
let program;
let program1;
let tex;
let lowbar = 0;

function NewAdd(program, translation, texture, vertexs, blend, texCoord) {
  let attributes = [new Attribute('a_position', vertexs),
                    new Attribute('a_texcoord', texCoord ? texCoord : Utils.madeRectangle(0, 0, 1, 1))];
  let uniforms = [new Uniform('u_translation', translation)];
  let obj = new DrawObject(gl, program, attributes, uniforms, blend, texture);
  DrawObjects.push(obj);
  return DrawObjects.length - 1;
}

function AddDrawObject(translation, texture, vertexs, blend, texCoord) {
    return NewAdd(program, translation, texture, vertexs, blend, texCoord);
}

function AddColorObject(translation, vertexs, color, blend) {
  let attributes = [new Attribute('a_position', vertexs)];
  let uniforms = [new Uniform('u_translation', translation), new Uniform('u_color', color)];
  let obj = new DrawObject(gl, program1, attributes, uniforms, blend);
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
    case 'skeleton1':
      return 4;
      break;
    case 'skeleton2':
      return 5;
      break;
  }
}

function AddEntity(unit) {
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
  unit.entity = new Entity();
  let t = Utils.translationOnMap(unit.ypos, unit.xpos);
  t[0] -= 0.08;
  t[1] += (1.2 / 12) * ratio;
  unit.entity.lowbarId = AddDrawObject(Utils.transOnLowbar(lowbar++), images[index], madeRectangle(0, 0, 0.1*1.3, -0.2*1.3), true);
  unit.entity.mapId = AddDrawObject(t, images[index], madeRectangle(0, 0, (1.2 / 9)*1.7, -(1.2 / 9) * 1.7 * ratio), true);
  unit.entity.healthbarId = AddColorObject([t[0] + 0.083, t[1] + (1.2/17)*ratio - (1.2 / 12) * ratio], madeRectangle(0, 0, 1.2/16 - 0.006, -0.015), [250/255, 44/255, 31/255, 1.0]);
}


function moveTo(TileStart, TileDest) {
  let obj = DrawObjects[TileStart.unitOnTile.entity.mapId];
  let healthbar = DrawObjects[TileStart.unitOnTile.entity.healthbarId];
  TileDest.unitOnTile = TileStart.unitOnTile;
  TileDest.unitOnTile.xpos = TileDest.xpos;
  TileDest.unitOnTile.ypos = TileDest.ypos;
  TileStart.unitOnTile = null;
  let time = performance.now() * 0.001;
  let pT = obj.getTrans();
  let nT = Utils.translationOnMap(TileDest.ypos, TileDest.xpos);
  let translationActiveTile = DrawObjects[activeTile].getTrans();
  nT[0] -= 0.08;
  nT[1] += (1.2 / 12) * ratio;
  let deltaTranslation = [nT[0] - pT[0], nT[1] - pT[1]];
  let timeAnimation = 2;
  requestAnimationFrame(AnimationMove);

  function AnimationMove(now) {
    now *= 0.001;
    let deltaTime = now - time;
    if (deltaTime >= timeAnimation) {
      obj.setTrans(nT);
      if (translationActiveTile == DrawObjects[activeTile].getTrans()) {
        obj.uniforms[0].valie = nT;
        DrawObjects[TileDest.unitOnTile.entity.healthbarId].setTrans([nT[0] + 0.083, nT[1]  + (1.2/17)*ratio - (1.2 / 12) * ratio]);
        DrawObjects[activeTile].setTrans([nT[0] + 0.08, nT[1] - (1.2/12)*ratio]);
      }
    } else {
      obj.setTrans([pT[0] + deltaTranslation[0] * deltaTime / timeAnimation,
        pT[1] + deltaTranslation[1] * deltaTime / timeAnimation]);
      DrawObjects[TileDest.unitOnTile.entity.healthbarId].setTrans([obj.getTrans()[0] + 0.083, obj.getTrans()[1]  + (1.2/17)*ratio - (1.2 / 12) * ratio]);
      requestAnimationFrame(AnimationMove);
    }
  }
}

function Thunderbolt(TileStart, TileDest) {
  let time = performance.now() * 0.001;
  let timeAnimation = 2;
  let DestT = DrawObjects[TileDest.unitOnTile.entity.mapId].getTrans();
  let index = AddDrawObject(Utils.translationOnMap(TileDest.ypos, TileDest.xpos), images[109], madeRectangle(0, 0, 1.2/16, 1.2 - DestT[1]), true);
  requestAnimationFrame(AnimationThunderbolt);

  function AnimationThunderbolt(now) {
    now *= 0.001;
    let deltaTime = now - time;
    if (deltaTime >= timeAnimation) {
      DeleteEntity(index);
    } else {
      let AnimObj = DrawObjects[index];
      AnimObj.setTexture(images[109 + Math.floor((deltaTime % 1) / (1 / 44))]);
      requestAnimationFrame(AnimationThunderbolt);
    }
  }
}

function Fireball(TileStart, TileDest) {
  let time = performance.now() * 0.001;
  let StartObj = DrawObjects[TileStart.unitOnTile.entity.mapId];
  let DestObj = DrawObjects[TileDest.unitOnTile.entity.mapId];
  let StartT = StartObj.getTrans();
  let DestT = DestObj.getTrans();
  let deltaT = [DestT[0] +0.018 - StartT[0], DestT[1] - (1.2/25)*ratio - StartT[1]];
  let timeAnimation = 2;
  let index = AddDrawObject(StartT, images[15], madeRectangle(0, 0, 0.06, -0.06 * ratio), true);
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
            obj.push(AddDrawObject(Utils.translationOnMap(jj, ii), images[46], madeRectangle(0, 0, 1 / 16, -(1 / 16) * ratio), true));
          }
        }
      }
      Explosion(obj);
      setTimeout(function(obj) {
        obj.forEach(function(item) {
          DeleteEntity(item);
        });
      }, 2000, obj);
    } else {
      let AnimObj = DrawObjects[index];
      AnimObj.setTexture(images[15 + Math.floor((deltaTime % 1) / (1 / 31))]);
      AnimObj.setTrans([StartT[0] + deltaT[0] * deltaTime / timeAnimation, StartT[1] + deltaT[1] * deltaTime / timeAnimation]);
      requestAnimationFrame(AnimationFireball);
    }
  }
}

function Explosion(obj) {
  let time = performance.now() * 0.001;
  let timeAnimation = 2;
  requestAnimationFrame(AnimationExplosion);

  function AnimationExplosion(now) {
    now *= 0.001;
    let deltaTime = now - time;
    if (deltaTime < timeAnimation) {
      let texture = images[46 + Math.floor((deltaTime % 1) / (1 / 44))];
      obj.forEach(function(item) {
        DrawObjects[item].setTexture(texture);
      });
      requestAnimationFrame(AnimationExplosion);
    }
  }
}

function DeleteEntity(index) {
  delete DrawObjects[index];
}

function ActiveEntity(unit) {
  DrawObjects[activeTile].setTrans(Utils.translationOnMap(unit.ypos, unit.xpos));
  document.onmousedown = function(event) {
    if (event.which == 1 && activeElem[1] != -1 && dropMenu == 0) {
      let div = document.createElement('div');
      dropMenu = div;
      let ul = document.createElement('ul');
      div.className = 'drop-menu';
      div.style.left = event.clientX - 40 + 'px';
      div.style.top = event.clientY - 15 + 'px';
      div.appendChild(ul);
      let elem = tiledMap[activeElem[2]][activeElem[1]];
      if (elem.isOccupied() && elem.unitOnTile.type != unit.type && !elem.unitOnTile.isDead()) {
        unit.skills.forEach(function(item, i) {
          if (i == 0) return;
          let li = document.createElement('li');
          li.innerHTML = item.name;
          li.onclick = function() {
            let action = new Action();
            action.sender = tiledMap[unit.ypos][unit.xpos];
            action.target = tiledMap[activeElem[2]][activeElem[1]];
            action.ability = item;
            actionDeque.push(action);
            dropMenu.remove();
            dropMenu = 0;
          };
          ul.appendChild(li);
        });
      } else if (!tiledMap[activeElem[2]][activeElem[1]].isOccupied()){
        let li = document.createElement('li');
        li.innerHTML = unit.skills[0].name;
        li.onclick = function() {
          let action = new Action();
          action.sender = tiledMap[unit.ypos][unit.xpos];
          action.target = tiledMap[activeElem[2]][activeElem[1]];
          action.ability = unit.skills[0];
          actionDeque.push(action);
          dropMenu.remove();
          dropMenu = 0;
        };
        ul.appendChild(li);
      }
      document.getElementsByClassName('container')[0].appendChild(div);
    } else if (event.which == 1 && dropMenu != 0 && event.target.tagName != 'LI') {
      dropMenu.remove();
      dropMenu = 0;
    }
  };
}

function unitAttack(nameSkill, sender, target, wounded) {
  console.log(wounded);
  let index = indexUnit(sender.unitOnTile);
  DrawObjects[sender.unitOnTile.entity.mapId].setTexture(images[90 + 3 * index]);
  setTimeout(function(nameSkill, sender, target) {
    DrawObjects[sender.unitOnTile.entity.mapId].setTexture(images[91 + 3 * index]);
    let timer;
    switch (nameSkill) {
      case 'Fire ball':
        timer = 2000;
        Fireball(sender, target);
        break;
      case 'Thunderbolt':
        timer = 2000;
        Thunderbolt(sender, target);
        break;
      default:
        timer = 500;
        break;
    }
    setTimeout(function(sender, target) {
      // DrawObjects[target.unitOnTile.entity.mapId]setTexture(images[92]);
      DrawObjects[sender.unitOnTile.entity.mapId].setTexture(images[9 + index]);
      wounded.forEach(function(item) {
        if (item.healthpoint[0] > 0) {
          DrawObjects[item.entity.healthbarId].setVertexs(madeRectangle(0, 0, (1.2/16)*(item.healthpoint[0]/item.healthpoint[1]) - 0.006, -0.015));
        } else {
          DrawObjects[item.entity.healthbarId].setVertexs(madeRectangle(0, 0, 0, 0));
        }
      });
    }, timer, sender, target);
  }, 500, nameSkill, sender, target);
}

function unitAttackAndKill(nameSkill, sender, target, DeadUnits, wounded) {
  console.log("KILL");
  let index = indexUnit(sender.unitOnTile);
  DrawObjects[sender.unitOnTile.entity.mapId].setTexture(images[90 + 3 * index]);
  setTimeout(() => {
    DrawObjects[sender.unitOnTile.entity.mapId].setTexture(images[91 + 3 * index]);
    let timer;
    switch (nameSkill) {
      case 'Fire ball':
        timer = 2000;
        Fireball(sender, target);
        break;
      case 'Thunderbolt':
        timer = 2000;
        Thunderbolt(sender, target);
        break;
      default:
        timer = 500;
        break;
    }
    setTimeout(function(sender, target) {
      // DrawObjects[target.unitOnTile.entity.mapId].setTexture(images[92]);
      DrawObjects[sender.unitOnTile.entity.mapId].setTexture(images[9 + index]);
      DeadUnits.forEach((unit) => {
        DrawObjects[unit.entity.mapId].setTexture(images[92 + 3 * indexUnit(unit)]);
      });
      wounded.forEach((unit) => {
        if (unit.healthpoint[0] > 0) {
          DrawObjects[unit.entity.healthbarId].setVertexs(madeRectangle(0, 0, (1.2/16)*(unit.healthpoint[0]/unit.healthpoint[1]) - 0.006, -0.015));
        } else {
          DrawObjects[unit.entity.healthbarId].setVertexs(madeRectangle(0, 0, 0, 0));
        }
      });
    }, timer + 50, sender, target);
  }, 500);

}


function loadImage(url, callback) {
  let image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(urls, callback, arg, context) {
  let imagesToLoad = urls.length;
  let onImageLoad = function() {
    imagesToLoad--;
    if (imagesToLoad == 0) {
      callback(arg, context);
    }
  };
  for (let i = 0; i < imagesToLoad; i++) {
    let image = loadImage(urls[i], onImageLoad);
    images.push(image);
  }
}

function setTranslation(index, x) {
  DrawObjects[index].setTrans(x);
}

function InitGlAndEvents() {
  gl = document.getElementById('canvas').getContext("webgl");
  console.log("Init gl");
  if (!gl) {
    alert('Беда, брат! Твой браузер не поддерживает WebGl, но ты держись :D');
    return;
  }
  program = new Program(gl, '2d-vertex-shader', '2d-fragment-shader').create();
  program1 = new  Program(gl, '2d-vertex-shader2', '2d-fragment-shader2').create()
  tex = gl.createTexture();
  gl.canvas.onmousemove = function(event) {
    let x = event.clientX / gl.canvas.clientWidth;
    let y = event.clientY / gl.canvas.clientHeight;
    if (x >= 0.2 && x <= 0.8 && y >= 0.065 && y <= 0.865) {
      let i = Math.floor(((x - 0.2) / 0.6) / (1 / 16));
      let j = Math.floor(((y - 0.065) / 0.8) / (1 / 12));
      if (tiledMap[j][i].isWall) {
        setTranslation(activeElem[0], [-2, -2]);
        activeElem[1] = -1;
        activeElem[2] = -1;
      } else if (activeElem[1] == -1 || activeElem[1] != i || activeElem[2] != j) {
        setTranslation(activeElem[0], Utils.translationOnMap(j, i));
        activeElem[1] = i;
        activeElem[2] = j;
      }
    } else {
      setTranslation(activeElem[0], [-2, -2]);
      activeElem[1] = -1;
    }
  };
}

function InitHtmlObjects() {
  document.getElementById('fps').appendChild(fpsNode);
}

function InitGui() {
  activeElem = [AddDrawObject([-2, -2], images[2], madeRectangle(0, 0, 1.2 / 16, -(1.2 / 16) * ratio)), -1, -1];
  activeTile = AddDrawObject([-2, -2], images[108], madeRectangle(0, 0, 1.2 / 16, -(1.2 / 16) * ratio));
  AddDrawObject([-0.55, -0.79], images[5], madeRectangle(0, 0, 1.1, -0.2)); // lowbar
  AddDrawObject([-0.63, -0.80], images[4], madeRectangle(0, 0, 0.1, -0.17), true); // стрелочка
}

function StartGame() {

  requestAnimationFrame(DrawScene);

  function DrawScene(now) {
    now *= 0.001;
    var deltaTime = now - time;
    time = now;
    fpsNode.nodeValue = (1 / deltaTime).toFixed(0);

    Utils.resize(gl);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    let lastProgram;
    DrawObjects.forEach(function(item) {
      // if (item.needRender) {
        if (lastProgram == undefined) {
          gl.useProgram(item.program);
          lastProgram = item.program;
        } else if (lastProgram != item.program) {
          gl.useProgram(item.program);
          lastProgram = item.program;
        }
        item.render();
      // }
    });

    requestAnimationFrame(DrawScene);
  }
}

function InitGraphic(callback, context) {
  console.log("Start init");
  InitGlAndEvents();
  InitHtmlObjects();
  InitGui();
  StartGame();
  callback(context);
}

function StartGraphic(callback, context) {
  console.log("StartGraphic");
  loadImages(['textures/grass.jpg', 'textures/wall.jpg', 'textures/activeGrass.jpg',
    'textures/clickGrass.jpg', 'textures/arrow.png', 'textures/lowbar.jpg',
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
    'conditions/PriestAttack.png', 'conditions/PriestDead.png',
    'conditions/Skeleton1Angry.png',
    'conditions/Skeleton1Attack.png', 'conditions/Skeleton1Dead.png',
    'conditions/Skeleton2Angry.png',
    'conditions/Skeleton2Attack.png', 'conditions/Skeleton2Dead.png', 'textures/activeTile.png',
    'animations/thunderbolt/1.gif',
    'animations/thunderbolt/2.gif',
    'animations/thunderbolt/3.gif', 'animations/thunderbolt/4.gif', 'animations/thunderbolt/5.gif',
    'animations/thunderbolt/6.gif', 'animations/thunderbolt/7.gif', 'animations/thunderbolt/8.gif',
    'animations/thunderbolt/9.gif', 'animations/thunderbolt/10.gif', 'animations/thunderbolt/11.gif',
    'animations/thunderbolt/12.gif', 'animations/thunderbolt/13.gif', 'animations/thunderbolt/14.gif',
    'animations/thunderbolt/15.gif', 'animations/thunderbolt/16.gif', 'animations/thunderbolt/17.gif',
    'animations/thunderbolt/18.gif', 'animations/thunderbolt/19.gif', 'animations/thunderbolt/20.gif',
    'animations/thunderbolt/21.gif', 'animations/thunderbolt/22.gif', 'animations/thunderbolt/23.gif',
    'animations/thunderbolt/24.gif', 'animations/thunderbolt/25.gif', 'animations/thunderbolt/26.gif',
    'animations/thunderbolt/27.gif', 'animations/thunderbolt/28.gif', 'animations/thunderbolt/29.gif',
    'animations/thunderbolt/30.gif', 'animations/thunderbolt/31.gif', 'animations/thunderbolt/32.gif',
    'animations/thunderbolt/33.gif',
    'animations/thunderbolt/34.gif', 'animations/thunderbolt/35.gif', 'animations/thunderbolt/36.gif',
    'animations/thunderbolt/37.gif', 'animations/thunderbolt/38.gif', 'animations/thunderbolt/39.gif',
    'animations/thunderbolt/40.gif', 'animations/thunderbolt/41.gif', 'animations/thunderbolt/42.gif',
    'animations/thunderbolt/43.gif', 'animations/thunderbolt/44.gif'
  ], InitGraphic, callback, context);
}
