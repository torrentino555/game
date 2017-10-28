// import DungeonMapMaker from "DungeonMapMaker"
// import Game from "DemoGameModule.js"

tiledMap = new DungeonMapMaker().dungeonMapMaker(Math.random() * 10 + 25);
actionDeque = [];
interval = 100;
// WIDTH = 16;
HEIGHT = 12;
PARTYSIZE = 4;
ENEMIESSIZE = 6;

class GameModule {
  constructor() {
    this.game = new DemoGameModule();
  }

  gameStart(context) {
    context.game.gamePrepare();
    context.game.startGameLoop();
  }

  gameGraphic() {
    console.log("GameGraphic");
    let back = new background(tiledMap);
    back.render();
    window.StartGraphic(this.gameStart, this);
  }
}
