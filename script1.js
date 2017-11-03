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
let possibleMoves = [];
let countIndexes = 0;
let stateAnimationOnMap = false;
let stateAnimationOnLowbar = false;

function AddDrawObject(order, translation, texture, vertexs, blend, texCoord) {
  let attributes = [new Attribute('a_position', vertexs),
                    new Attribute('a_texcoord', texCoord ? texCoord : Utils.madeRectangle(0, 0, 1, 1))];
  let uniforms = [new Uniform('u_translation', translation)];
  let obj = new DrawObject(gl, program, attributes, uniforms, blend, texture);
  DrawObjects.push(obj);
  obj.index = countIndexes;
  obj.order = order;
  indexes[countIndexes] = DrawObjects.length - 1;
  return countIndexes++;
}

function AddColorObject(order, translation, vertexs, color, blend) {
  let attributes = [new Attribute('a_position', vertexs)];
  let uniforms = [new Uniform('u_translation', translation), new Uniform('u_color', color)];
  let obj = new DrawObject(gl, program1, attributes, uniforms, blend);
  DrawObjects.push(obj);
  obj.index = countIndexes;
  obj.order = order;
  indexes[countIndexes] = DrawObjects.length - 1;
  return countIndexes++;
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
      return 2;
      break;
    case 'mage':
      return 3;
      break;
    case 'thief':
      return 4;
      break;
    case 'priest':
      return 5;
      break;
    case 'skeleton1':
      return 6;
      break;
    case 'skeleton2':
      return 7;
      break;
  }
}

function AddEntity(unit) {
  let nameTexture = unit.class;
  let index;
  switch (nameTexture) {
    case 'warrior':
      index = 8;
      break;
    case 'mage':
      index = 9;
      break;
    case 'thief':
      index = 10;
      break;
    case 'priest':
      index = 11;
      break;
    case 'skeleton2':
      index = 12;
      break;
    case 'skeleton1':
      index = 13;
      break;
    default:
      console.log("ERROR ADDENTITY, NAMETEXTURE NOT FOUND");
  }
  unit.entity = new Entity();
  unit.entity.lowbarId = AddDrawObject(0, Utils.transOnLowbar(lowbar++), images[imageUnit(unit)], Utils.madeRectangle(0, 0, 0.09, -0.09*ratio), true);
  unit.entity.mapId = AddDrawObject(unit.ypos, Utils.translationForUnits(unit), images[index], Utils.madeRectangle(0, 0, (1.2 / 9)*1.7, -(1.2 / 9) * 1.7 * ratio), true);
  unit.entity.healthbarId = AddColorObject(unit.ypos, Utils.transForHealthbar(unit), Utils.madeRectangle(0, 0, 1.2/16 - 0.006, -0.015), [250/255, 44/255, 31/255, 1.0]);
  lowbarUnits.push(unit);
}

function getObj(ind) {
  return DrawObjects[indexes[ind]];
}

function movingTo(TileStart, path) {
  if (stateAnimationOnMap) {
    setTimeout(function() {
      requestAnimationFrame(movingTo.bind(this, TileStart, path));
    }, 50);
    return;
  }
  stateAnimationOnMap = true;

  let unit = TileStart.unitOnTile;
  for (let i = path.length - 2; i >= 0; i--) {
    setTimeout(function() {
      MoveAnimation(Utils.translationForUnits(path[i + 1]), Utils.translationForUnits(path[i]), 0.2, unit.entity.mapId);
      MoveAnimation(Utils.transForHealthbar(path[i + 1]), Utils.transForHealthbar(path[i]), 0.2, unit.entity.healthbarId);
    }, 200*(path.length - 2 - i));
  }
  let transActiveTile = getObj(activeTile).getTrans();
  setTimeout(function() {
    if (transActiveTile == getObj(activeTile).getTrans()) {
      getObj(activeTile).setTrans(Utils.translationOnMap(unit.ypos, unit.xpos));
    }
    stateAnimationOnMap = false;
  }, 200*(path.length));
}

function Thunderbolt(TileStart, TileDest) {
  let DestT = Utils.translationForUnits(TileDest.unitOnTile);
  let thunderbolt = AddDrawObject(12, Utils.translationOnMap(TileDest.ypos, TileDest.xpos), images[34], Utils.madeRectangle(0, 0, 1.2/16, 1.2 - DestT[1]), true);
  FrameAnimation(thunderbolt, 2, 64, 9, 8, true);
}

function Fireball(TileStart, TileDest) {
  let fireball = AddDrawObject(12, Utils.translationOnMap(TileStart.ypos, TileDest.xpos), images[32], Utils.madeRectangle(0, 0, 0.06, -0.06 * ratio), true);
  FrameAnimation(fireball, 2, 32, 6, 6, true);
  MoveAnimation(Utils.translationForUnits(TileStart), Utils.translationOnMap(TileDest.ypos, TileDest.xpos),
  2, fireball);
  setTimeout(function() {
    for (let ii = TileDest.xpos - 2; ii < TileDest.xpos + 3; ii++) {
      for (let jj = TileDest.ypos - 2; jj < TileDest.ypos + 3; jj++) {
        if (ii >= 0 && ii < 16 && jj >= 0 && jj < 12) {
          FrameAnimation(AddDrawObject(12, Utils.translationOnMap(jj, ii), images[33], Utils.madeRectangle(0, 0, 1 / 16, -(1 / 16) * ratio), true),
          1.2, 44, 6, 8, true);
        }
      }
    }
  }, 2000);
}

function deltaTrasn(start, deltaT, deltaTime, timeA) {
  return [start[0] + deltaT[0]*(deltaTime/timeA), start[1] + deltaT[1]*(deltaTime/timeA)];
}

function MoveAnimation(start, dest, timeA, id) {
  let currentTime = performance.now() * 0.001;
  let deltaT = [dest[0] - start[0], dest[1] - start[1]];
  requestAnimationFrame(Moving);
  function Moving(now) {
    now *= 0.001;
    let deltaTime = now - currentTime;
    if (deltaTime >= timeA) {
      getObj(id).setTrans(dest);
      SortObjects();
    } else {
      getObj(id).setTrans(deltaTrasn(start, deltaT, deltaTime, timeA));
      SortObjects();
      requestAnimationFrame(Moving);
    }
  }
}

function FrameAnimation(id, timeA, countFrames,colls, rows, deleteInEnd) {
  let currentTime = performance.now() * 0.001;
  requestAnimationFrame(FrameAnim);
  function FrameAnim(now) {
    now *= 0.001;
    let deltaTime = now - currentTime;
    if (deltaTime >= timeA) {
      if (deleteInEnd) {
        DeleteEntity(id);
      }
    } else {
      let frame = Math.floor((deltaTime % timeA)/timeA * countFrames);
      getObj(id).setTexCoord(Utils.madeRectangle((frame % colls)/colls, Math.floor(frame / colls)/rows, ((frame % colls) + 1)/colls, (Math.floor(frame / colls)+ 1)/rows));
      requestAnimationFrame(FrameAnim);
    }
  }
}

function ChangeActiveEntity() {
  if (stateAnimationOnLowbar) {
    setTimeout(function() {
      requestAnimationFrame(ChangeActiveEntity);
    }, 50);
    return;
  }
  stateAnimationOnLowbar = true;
  let x = lowbarUnits[0];
  lowbarUnits.splice(0, 1);
  lowbarUnits.push(x);
  let t = Utils.transOnLowbar(0);
  MoveAnimation(t, [t[0], t[1] + 0.17], 0.5, lowbarUnits[lowbarUnits.length - 1].entity.lowbarId);
  for (let i = 0; i < lowbarUnits.length - 1; i++) {
    MoveAnimation(Utils.transOnLowbar(i + 1), Utils.transOnLowbar(i),
    0.8, lowbarUnits[i].entity.lowbarId);
  }
  setTimeout(function() {
    let t = Utils.transOnLowbar(0);
    MoveAnimation([t[0], t[1] + 0.17], [t[0] + (lowbarUnits.length - 1)*0.1, t[1] + 0.17], 0.5, lowbarUnits[lowbarUnits.length - 1].entity.lowbarId);
  }, 600);
  setTimeout(function() {
    let t = Utils.transOnLowbar(lowbarUnits.length - 1);
    MoveAnimation([t[0], t[1] + 0.17], t, 0.5, lowbarUnits[lowbarUnits.length - 1].entity.lowbarId);
  }, 1200);
  setTimeout(function() { stateAnimationOnLowbar = false;}, 1800);
}

function RemoveUnitsInInitiativeLine(units) {
  if (stateAnimationOnLowbar) {
    setTimeout(function() {
      requestAnimationFrame(RemoveUnitsInInitiativeLine.bind(this, units));
    }, 50);
    return;
  }
  stateAnimationOnLowbar = true;
  units.forEach(function(unit) {
    lowbarUnits.splice(lowbarUnits.indexOf(unit), 1);
    DeleteEntity(unit.entity.lowbarId);
  });
  lowbarUnits.forEach(function(unit, i) {
    MoveAnimation(getObj(unit.entity.lowbarId).getTrans(), Utils.transOnLowbar(i), 0.5, unit.entity.lowbarId);
  });
  setTimeout(function() { stateAnimationOnLowbar = false;}, 600);
}

function DeleteEntity(index) {
  delete DrawObjects[indexes[index]];
}

function SortObjects() {
  lowbarUnits.forEach(function(unit) {
    getObj(unit.entity.mapId).order = unit.ypos;
    getObj(unit.entity.healthbarId).order = unit.ypos;
  });
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
  getObj(sender.unitOnTile.entity.mapId).setTexture(images[14 + 3 * index]);
  setTimeout(function(nameSkill, sender, target) {
    getObj(sender.unitOnTile.entity.mapId).setTexture(images[15 + 3 * index]);
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
        timer = 0;
        break;
    }
    setTimeout(function(sender, target) {
      // getObj(target.unitOnTile.entity.mapId).setTexture(images[92]);
      getObj(sender.unitOnTile.entity.mapId).setTexture(images[8 + index]);
      wounded.forEach(function(item) {
        if (item.healthpoint[0] > 0) {
          getObj(item.entity.healthbarId).setVertexs(Utils.madeRectangle(0, 0, (1.2/16)*(item.healthpoint[0]/item.healthpoint[1]) - 0.006, -0.015));
        } else {
          getObj(item.entity.healthbarId).setVertexs(Utils.madeRectangle(0, 0, 0, 0));
        }
      });
    }, timer + 400, sender, target);
  }, 500, nameSkill, sender, target);
}

function unitAttackAndKill(nameSkill, sender, target, DeadUnits, wounded) {
  let index = indexUnit(sender.unitOnTile);
  getObj(sender.unitOnTile.entity.mapId).setTexture(images[14 + 3 * index]);
  setTimeout(() => {
    getObj(sender.unitOnTile.entity.mapId).setTexture(images[15 + 3 * index]);
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
      getObj(sender.unitOnTile.entity.mapId).setTexture(images[8 + index]);
      RemoveUnitsInInitiativeLine(DeadUnits);
      DeadUnits.forEach((unit) => {
        getObj(unit.entity.mapId).setTexture(images[16 + 3 * indexUnit(unit)]);
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

function showPossibleMoves(path) {
  for (let i = 0; i < path.length; i++) {
    possibleMoves.push(AddDrawObject(-1, Utils.translationOnMap(path[i]), images[0], Utils.madeRectangle(0, 0, 1.2/16, -(1.2/16)*ratio)));
  }
}

function setTranslation(index, x) {
  getObj(index).setTrans(x);
}

function InitEvents() {
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
  activeElem = [AddDrawObject(-1, [-2, 3], images[0], Utils.madeRectangle(0, 0, 1.2 / 16, -(1.2 / 16) * ratio)), -1, -1];
  activeTile = AddDrawObject(-1, [-2, 3], images[1], Utils.madeRectangle(0, 0, 1.2 / 16, -(1.2 / 16) * ratio));
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

function InitGraphic(textures) {
  images = textures;
  InitEvents();
  InitHtmlObjects();
  InitGui();
  StartGame();
}

function StartGraphic(callback) {
  gl = document.getElementById('canvas').getContext("webgl");
  console.log("Init gl");
  if (!gl) {
    alert('Беда, брат! Твой браузер не поддерживает WebGl, но ты держись :D');
    return;
  }
  let Loader = new loader(['textures/activeGrass.jpg', 'textures/activeTile.png',
    'entity/warrior_portrait.png', 'entity/mage_portrait.png',
    'entity/thief_portrait.png', 'entity/priest_portrait.png',
    'entity/skeleton1_portrait.png', 'entity/skeleton2_portrait.png',
    'entity/warrior.png', 'entity/mage.png', 'entity/thief.png',
    'entity/priest.png', 'entity/skeleton1.png', 'entity/skeleton2.png',
    'conditions/WarriorAngry.png', 'conditions/WarriorAttack.png', 'conditions/WarriorDead.png',
    'conditions/MageAngry.png', 'conditions/MageAttack.png', 'conditions/MageDead.png',
    'conditions/ThiefAngry.png', 'conditions/ThiefAttack.png', 'conditions/ThiefDead.png',
    'conditions/PriestAngry.png', 'conditions/PriestAttack.png', 'conditions/PriestDead.png',
    'conditions/Skeleton1Angry.png', 'conditions/Skeleton1Attack.png', 'conditions/Skeleton1Dead.png',
    'conditions/Skeleton2Angry.png', 'conditions/Skeleton2Attack.png', 'conditions/Skeleton2Dead.png',
    'animations/fireball.png', 'animations/explosion.png', 'animations/thunderbolt1.png'
  ], gl);
  Loader.load(InitGraphic, callback);
}
