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
      console.log(`Starting number of lines to increase level: ${this.startingLines}`);
      this.playField = new PlayField({
         game: this,
         w: 10,
         h: 17,
      });
      this.scoreboard = new Scoreboard(this);
      this.interface = new Interface({game: this, w: 10, h: 17});
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
      console.log(`Level: ${this.level}`);
   }
   changeFPT(level = this.level) {
   //// https://tetris.wiki/Tetris_(NES,_Nintendo)
   //   let fpt;
   //   if(level <= 8) {
   //      fpt = 48 - (5*level);
   //   }
   //   else if(level == 9) {
   //      fpt = 6;
   //   }
   //   else if(level <= 18) {
   //      fpt =  6 - Math.floor((level-7)/3);
   //   }
   //   else if(level <= 28) {
   //      fpt = 2;
   //   }
   //   else {
   //      fpt = 1;
   //   }
      let fpt = 48 - Math.floor(Math.log10(this.level + 1) * 32);
      console.log(`Lines: ${this.lines}`);
      console.log(`FPT: ${fpt}`);
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
