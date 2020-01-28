import PlayField from './playfield';
import Interface from './interface';
import Scoreboard from './scoreboard';

const VERSION = "1.2";

class Game {
   constructor(config) {
      this.version = VERSION;
      this.startLevel = config.startLevel;
      let lineClear = (this.startLevel * 10) + 10;
      let lineMax = (this.startLevel * 10) - 50;
      if(lineMax < 0) {
         lineMax = 1e10;
      }
      this.startingLines = lineClear > lineMax ? lineMax : lineClear;
      this.playField = new PlayField({
         game: this,
         w: 10,
         h: 20,
      });
      this.scoreboard = new Scoreboard(this);
      this.interface = new Interface({game: this, w: 10, h: 20});
      this.reset(true);
   }
   reset(showEndScreen) {
      this.gameOver = showEndScreen;
      this.paused = false;
      this.score = 0;
      this.level = this.startLevel;
      this.lines = 0;
      this.playField.reset();
      this.changeFPT();
   }
   changeLevel() {
      if(this.level <= this.startLevel) {
         if(this.lines > this.startingLines) {
            this.level++;
         }
      }
      else {
         this.level = this.startLevel + Math.ceil((this.lines - this.startingLines)/10);
      }
   }
   changeFPT(level = this.level) {
      let fpt = 48 - Math.floor(Math.log10(this.level + 1) * 32);
      if(fpt < 1) fpt = 1;
      if(fpt == this.interface.framesPerTick) {
         return false;
      }
      return this.interface.framesPerTick = fpt;
   }
}

let game = new Game({startLevel: 0});
for(let i = 0; i < 30; i++) {
   game.lines += 10;
   game.changeLevel();
   game.changeFPT();
}

