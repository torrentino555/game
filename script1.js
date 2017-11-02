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
let lowbarUnits = [];
let notFirstActive = false;
let indexes = [];
let countIndexes = 0;
let stateAnimationOnMap = false;
let stateAnimationOnLowbar = false;

function AddDrawObject(order, index, translation, texture, vertexs, blend, texCoord) {
  let attributes = [new Attribute('a_position', vertexs),
                    new Attribute('a_texcoord', texCoord ? texCoord : Utils.madeRectangle(0, 0, 1, 1))];
  let uniforms = [new Uniform('u_translation', translation)];
  let obj = new DrawObject(gl, program, attributes, uniforms, blend, texture);
  DrawObjects.push(obj);
  obj.index = index;
  obj.order = order;
  return DrawObjects.length - 1;
}

function AddColorObject(order, index, translation, vertexs, color, blend) {
  let attributes = [new Attribute('a_position', vertexs)];
  let uniforms = [new Uniform('u_translation', translation), new Uniform('u_color', color)];
  let obj = new DrawObject(gl, program1, attributes, uniforms, blend);
  obj.index = index;
  obj.order = order;
  DrawObjects.push(obj);
  return DrawObjects.length - 1;
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

function imageUnit(unit) {
  switch (unit.class) {
    case 'warrior':
      return 0;
      break;
    case 'mage':
      return 1;
      break;
    case 'thief':
      return 3;
      break;
    case 'priest':
      return 6;
      break;
    case 'skeleton1':
      return 7;
      break;
    case 'skeleton2':
      return 8;
      break;
  }
}

function AddEntity(unit) {
  let nameTexture = unit.class;
    console.log(nameTexture);
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
  unit.entity.lowbarId = countIndexes;
  indexes[countIndexes] = AddDrawObject(0, countIndexes, Utils.transOnLowbar(lowbar++), images[imageUnit(unit)], Utils.madeRectangle(0, 0, 0.09, -0.09*ratio), true);
  countIndexes++;
  unit.entity.mapId = countIndexes;
  indexes[countIndexes] = AddDrawObject(unit.ypos, countIndexes, Utils.translationForUnits(unit), images[index], Utils.madeRectangle(0, 0, (1.2 / 9)*1.7, -(1.2 / 9) * 1.7 * ratio), true);
  countIndexes++;
  unit.entity.healthbarId = countIndexes;
  indexes[countIndexes] = AddColorObject(unit.ypos, countIndexes, Utils.transForHealthbar(unit), Utils.madeRectangle(0, 0, 1.2/16 - 0.006, -0.015), [250/255, 44/255, 31/255, 1.0]);
  countIndexes++;
  lowbarUnits.push(unit);
}

function getObj(ind) {
  return DrawObjects[indexes[ind]];
}


function movingTo(TileStart, path) {
  if (stateAnimationOnMap) {
    setTimeout(function() {
      requestAnimationFrame(movingTo.bind(this, TileStart, path));
    }, 200);
    return;
  }
  stateAnimationOnMap = true;
    let unit = TileStart.unitOnTile;
    for (let i = path.length - 1; i >= 0; i--) {
      if (i == path.length - 1) {
        setTimeout(function() {
          StartAnimation(Utils.translationForUnits(TileStart), Utils.translationForUnits(path[i]), 0.3, unit.entity.mapId);
          StartAnimation(Utils.transForHealthbar(TileStart), Utils.transForHealthbar(path[i]), 0.3, unit.entity.healthbarId);
        }, 0);
      } else {
        setTimeout(function() {
          StartAnimation(Utils.translationForUnits(path[i + 1]), Utils.translationForUnits(path[i]), 0.3, unit.entity.mapId);
          StartAnimation(Utils.transForHealthbar(path[i + 1]), Utils.transForHealthbar(path[i]), 0.3, unit.entity.healthbarId);
        }, 300*(path.length - 1 - i));
      }
    }
    let transActiveTile = getObj(activeTile).getTrans();
    setTimeout(function() {
      if (transActiveTile == getObj(activeTile).getTrans()) {
        getObj(activeTile).setTrans(Utils.translationOnMap(unit.ypos, unit.xpos));
      }
      stateAnimationOnMap = false;
    }, 300*(path.length));
}

function Thunderbolt(TileStart, TileDest) {
  let time = performance.now() * 0.001;
  let timeAnimation = 2;
  let DestT = getObj(TileDest.unitOnTile.entity.mapId).getTrans();
  indexes[countIndexes] = AddDrawObject(20, countIndexes, Utils.translationOnMap(TileDest.ypos, TileDest.xpos), images[109], Utils.madeRectangle(0, 0, 1.2/16, 1.2 - DestT[1]), true);
  let index = countIndexes;
  countIndexes++;
  requestAnimationFrame(AnimationThunderbolt);

  function AnimationThunderbolt(now) {
    now *= 0.001;
    let deltaTime = now - time;
    if (deltaTime >= timeAnimation) {
      DeleteEntity(index);
    } else {
      let AnimObj = getObj(index);
      AnimObj.setTexture(images[109 + Math.floor((deltaTime % 1) / (1 / 44))]);
      requestAnimationFrame(AnimationThunderbolt);
    }
  }
}

function Fireball(TileStart, TileDest) {
  let time = performance.now() * 0.001;
  let StartObj = getObj(TileStart.unitOnTile.entity.mapId);
  let StartT = Utils.translationForUnits(TileStart);
  let DestT = Utils.translationForUnits(TileDest);
  let deltaT = [DestT[0] +0.018 - StartT[0], DestT[1] - (1.2/25)*ratio - StartT[1]];
  let timeAnimation = 2;
  indexes[countIndexes] = AddDrawObject(20, countIndexes, StartT, images[15], Utils.madeRectangle(0, 0, 0.06, -0.06 * ratio), true);
  let index = countIndexes;
  countIndexes++;
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
            indexes[countIndexes] = AddDrawObject(20, countIndexes, Utils.translationOnMap(jj, ii), images[46], Utils.madeRectangle(0, 0, 1 / 16, -(1 / 16) * ratio), true);
            obj.push(countIndexes);
            countIndexes++;
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
      let AnimObj = getObj(index);
      AnimObj.setTexture(images[15 + Math.floor((deltaTime % 1) / (1 / 31))]);
      AnimObj.setTrans([StartT[0] + deltaT[0] * deltaTime / timeAnimation, StartT[1] + deltaT[1] * deltaTime / timeAnimation]);
      requestAnimationFrame(AnimationFireball);
    }
  }
}

function Explosion(obj) {
  let time = performance.now() * 0.001;
  let timeAnimation = 1;
  requestAnimationFrame(AnimationExplosion);

  function AnimationExplosion(now) {
    now *= 0.001;
    let deltaTime = now - time;
    if (deltaTime < timeAnimation) {
      console.log(Math.floor((deltaTime % timeAnimation) / (timeAnimation / 44)));
      let texture = images[46 + Math.floor((deltaTime % timeAnimation) / (timeAnimation / 44))];
      obj.forEach(function(item) {
        getObj(item).setTexture(texture);
      });
      requestAnimationFrame(AnimationExplosion);
    }
  }
}

function deltaTrasn(start, deltaT, deltaTime, timeA) {
  return [start[0] + deltaT[0]*(deltaTime/timeA), start[1] + deltaT[1]*(deltaTime/timeA)];
}

function StartAnimation(start, dest, timeA, id) {
  let time = performance.now() * 0.001;
  let deltaT = [dest[0] - start[0], dest[1] - start[1]];
  let args = {
    time: time,
    deltaT: deltaT,
    start: start,
    dest: dest,
    timeA: timeA,
    id: id,
  };
  requestAnimationFrame(MoveEntity.bind(this, performance.now(), time, timeA, start, dest, id, deltaT));
}

function MoveEntity(now, time, timeA, start, dest, id, deltaT) {
  now *= 0.001;
  let deltaTime = now - time;
  if (deltaTime > timeA) {
    getObj(id).setTrans(dest);
  } else {
    getObj(id).setTrans (deltaTrasn(start, deltaT, deltaTime, timeA));
    requestAnimationFrame(MoveEntity.bind(this, performance.now(), time, timeA, start, dest, id, deltaT));
  }
}

function ChangeActiveEntity() {
  if (stateAnimationOnLowbar) {
    setTimeout(function() {
      requestAnimationFrame(ChangeActiveEntity);
    }, 200);
    return;
  }
  stateAnimationOnLowbar = true;
  let x = lowbarUnits[0];
  lowbarUnits.splice(0, 1);
  lowbarUnits.push(x);
  let t = Utils.transOnLowbar(0);
  StartAnimation(t, [t[0], t[1] + 0.17], 0.5, lowbarUnits[lowbarUnits.length - 1].entity.lowbarId);
  for (let i = 0; i < lowbarUnits.length - 1; i++) {
    StartAnimation(Utils.transOnLowbar(i + 1), Utils.transOnLowbar(i),
    0.8, lowbarUnits[i].entity.lowbarId);
  }
  setTimeout(function() {
    let t = Utils.transOnLowbar(0);
    StartAnimation([t[0], t[1] + 0.17], [t[0] + (lowbarUnits.length - 1)*0.1, t[1] + 0.17], 0.5, lowbarUnits[lowbarUnits.length - 1].entity.lowbarId);
  }, 600);
  setTimeout(function() {
    let t = Utils.transOnLowbar(lowbarUnits.length - 1);
    StartAnimation([t[0], t[1] + 0.17], t, 0.5, lowbarUnits[lowbarUnits.length - 1].entity.lowbarId);
  }, 1200);
  setTimeout(function() { stateAnimationOnLowbar = false;}, 1800);
}

function RemoveUnitsInInitiativeLine(units) {
  if (stateAnimationOnLowbar) {
    setTimeout(function() {
      requestAnimationFrame(RemoveUnitsInInitiativeLine.bind(this, units));
    }, 200);
    return;
  }
  stateAnimationOnLowbar = true;
  units.forEach(function(unit) {
    lowbarUnits.splice(lowbarUnits.indexOf(unit), 1);
    DeleteEntity(unit.entity.lowbarId);
  });
  lowbarUnits.forEach(function(unit, i) {
    let t = Utils.transOnLowbar(i);
    StartAnimation(getObj(unit.entity.lowbarId).getTrans(), t, 0.5, unit.entity.lowbarId);
  });
  setTimeout(function() { stateAnimationOnLowbar = false;}, 600);
}

function DeleteEntity(index) {
  delete DrawObjects[indexes[index]];
}

function SortObjects() {
  DrawObjects.sort(function(a, b) {
    if (a.order > b.order) return 1;
    return -1;
  });
  for (let i = 0; i < DrawObjects.length; i++) {
    if (DrawObjects[i] != undefined) {
      indexes[DrawObjects[i].index] = i;
    }
  }
}

function ActiveEntity(unit) {
  SortObjects();
  if (notFirstActive) {
    ChangeActiveEntity(unit);
  } else {
    notFirstActive = true;
  }
  getObj(activeTile).setTrans(Utils.translationOnMap(unit.ypos, unit.xpos));
  document.onmousedown = function(event) {
    let x = event.clientX / gl.canvas.clientWidth;
    let y = event.clientY / gl.canvas.clientHeight;
    if (event.which == 1 && x >= 0.2 && x <= 0.8 && y >= 0.065 && y <= 0.865 && document.getElementById('menu').hasAttribute('hidden') && dropMenu == 0 && !stateAnimationOnMap) {
      let i = Math.floor(((x - 0.2) / 0.6) / (1 / 16));
      let j = Math.floor(((y - 0.065) / 0.8) / (1 / 12));
      let div = document.createElement('div');
      dropMenu = div;
      let ul = document.createElement('ul');
      div.className = 'drop-menu';
      div.style.left = event.clientX - 40 + 'px';
      div.style.top = event.clientY - 15 + 'px';
      div.appendChild(ul);
      let elem = window.tiledMap[i][j];
      let func = function(item) {
        let li = document.createElement('li');
        li.innerHTML = item.name;
        li.onclick = function() {
          let action = new Action();
          action.sender = window.tiledMap[unit.xpos][unit.ypos];
          action.target = window.tiledMap[i][j];
          action.ability = item;
          actionDeque.push(action);
          dropMenu.remove();
          dropMenu = 0;
        };
        ul.appendChild(li);
      };
      if (elem.isOccupied() && elem.unitOnTile.type == unit.type) {
        console.log("Союзник");
        unit.skills.forEach(function(item, i) {
          if (item.name != 'Move' && item.typeOfArea == "circle" && item.damage[0] < 0) {
            console.log(item.name);
            func(item);
          }
        });
      } else if (elem.isOccupied() && elem.unitOnTile.type != unit.type) {
        console.log("Противник")
        unit.skills.forEach(function(item, i) {
          if (item.name != 'Move' && item.damage[0] > 0) {
            console.log(item.name);
            func(item);
          }
        });
      } else {
        console.log("Карта")
        unit.skills.forEach(function(item, i) {
          if (item.typeOfArea == "circle" || item.name == 'Move') {
            console.log(item.name);
            func(item);
          }
        });
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
  getObj(sender.unitOnTile.entity.mapId).setTexture(images[90 + 3 * index]);
  setTimeout(function(nameSkill, sender, target) {
    getObj(sender.unitOnTile.entity.mapId).setTexture(images[91 + 3 * index]);
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
      // getObj(target.unitOnTile.entity.mapId).setTexture(images[92]);
      getObj(sender.unitOnTile.entity.mapId).setTexture(images[9 + index]);
      wounded.forEach(function(item) {
        if (item.healthpoint[0] > 0) {
          getObj(item.entity.healthbarId).setVertexs(Utils.madeRectangle(0, 0, (1.2/16)*(item.healthpoint[0]/item.healthpoint[1]) - 0.006, -0.015));
        } else {
          getObj(item.entity.healthbarId).setVertexs(Utils.madeRectangle(0, 0, 0, 0));
        }
      });
    }, timer, sender, target);
  }, 500, nameSkill, sender, target);
}

function unitAttackAndKill(nameSkill, sender, target, DeadUnits, wounded) {
  let index = indexUnit(sender.unitOnTile);
  getObj(sender.unitOnTile.entity.mapId).setTexture(images[90 + 3 * index]);
  setTimeout(() => {
    getObj(sender.unitOnTile.entity.mapId).setTexture(images[91 + 3 * index]);
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
      // getObj(target.unitOnTile.entity.mapId).setTexture(images[92]);
      getObj(sender.unitOnTile.entity.mapId).setTexture(images[9 + index]);
      RemoveUnitsInInitiativeLine(DeadUnits);
      DeadUnits.forEach((unit) => {
        getObj(unit.entity.mapId).setTexture(images[92 + 3 * indexUnit(unit)]);
        getObj(unit.entity.healthbarId).setVertexs(Utils.madeRectangle(0, 0, 0, 0));
      });
      wounded.forEach((unit) => {
        if (unit.healthpoint[0] > 0) {
          getObj(unit.entity.healthbarId).setVertexs(Utils.madeRectangle(0, 0, (1.2/16)*(unit.healthpoint[0]/unit.healthpoint[1]) - 0.006, -0.015));
        } else {
          getObj(unit.entity.healthbarId).setVertexs(Utils.madeRectangle(0, 0, 0, 0));
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
  getObj(index).setTrans(x);
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
    if (x >= 0.2 && x <= 0.8 && y >= 0.065 && y <= 0.865 && document.getElementById('menu').hasAttribute('hidden') && !stateAnimationOnMap) {
      let i = Math.floor(((x - 0.2) / 0.6) / (1 / 16));
      let j = Math.floor(((y - 0.065) / 0.8) / (1 / 12));
      if (window.tiledMap[i][j].isWall) {
        setTranslation(activeElem[0], [-2, 3]);
        activeElem[1] = -1;
        activeElem[2] = -1;
      } else if (activeElem[1] == -1 || activeElem[1] != i || activeElem[2] != j) {
        setTranslation(activeElem[0], Utils.translationOnMap(j, i));
        activeElem[1] = i;
        activeElem[2] = j;
      }
    } else {
      setTranslation(activeElem[0], [-2, 3]);
      activeElem[1] = -1;
    }
  };
}

function InitHtmlObjects() {
  document.getElementById('fps').appendChild(fpsNode);
}

function InitGui() {
  indexes[countIndexes] = AddDrawObject(-1, countIndexes, [-2, 3], images[2], Utils.madeRectangle(0, 0, 1.2 / 16, -(1.2 / 16) * ratio));
  activeElem = [countIndexes, -1, -1];
  countIndexes++;
  indexes[countIndexes] = AddDrawObject(-1, countIndexes, [-2, 3], images[108], Utils.madeRectangle(0, 0, 1.2 / 16, -(1.2 / 16) * ratio));
  activeTile = countIndexes;
  countIndexes++;
  AddDrawObject(-1, -1, [-0.55, -0.79], images[5], Utils.madeRectangle(0, 0, 1.1, -0.1*ratio)); // lowbar
  AddDrawObject(-1, -1, [-0.63, -0.80], images[4], Utils.madeRectangle(0, 0, 0.1, -0.17), true); // стрелочка
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
        if (lastProgram == undefined) {
          gl.useProgram(item.program);
          lastProgram = item.program;
        } else if (lastProgram != item.program) {
          gl.useProgram(item.program);
          lastProgram = item.program;
        }
        item.render();
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
  loadImages(['entity/warrior_portrait.png', 'entity/mage_portrait.png', 'textures/activeGrass.jpg',
    'entity/thief_portrait.png', 'textures/arrow.png', 'textures/initiativeLine.png',
    'entity/priest_portrait.png', 'entity/skeleton1_portrait.png', 'entity/skeleton2_portrait.png', 'entity/warrior.png',
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
