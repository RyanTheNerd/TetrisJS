import PlayField from './playfield';
import Interface from './interface';
import Scoreboard from './scoreboard';
import RNG from './rng';

const VERSION = "1.4";


/* Game: The root object controling all parts of the game
   reset(showEndScreen): Resets the game and starts it if showEndScreen == false
   randomTetromino: Returns a random tetromino from RNG
   changeLevel: Changes the level based on the number of lines cleared
*/

export default class Game {
   constructor(config) {
      this.RNG = new RNG(config.seed);
      this.version = VERSION; // A major version change erases scores
      this.startLevel = config.startLevel || 0;

      let lineClear = (this.startLevel * 10) + 10;

      let lineMax = (this.startLevel * 10) - 50;
      if(lineMax < 0) {
         this.startingLines = lineClear;
      }
      else {
         this.startingLines = lineClear > lineMax ? lineMax : lineClear;
      }

      this.playField = new PlayField({
         game: this,
         w: 10,
         h: 20,
      });

      this.scoreboard = new Scoreboard(this);

      this.interface = new Interface({
         game: this,
         w: 10, h: 20, 
         seed: config.seed,
         playbackData: config.playbackData,
      });
      this.reset(true);
   }
   reset(showEndScreen) {
      this.gameOver = showEndScreen;
      this.paused = false;
      this.score = 0;
      this.level = this.startLevel;
      this.lines = 0;
      this.playField.reset();
      this.interface.changeFPT();
   }
   randomTetromino() {
      return this.RNG.randomTetromino();
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
}
