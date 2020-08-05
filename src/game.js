import PlayField from './playfield';
import DisplayManager from './displayManager';
import InputManager from './inputManager';
import Scoreboard from './scoreboard';
import TetrominoBag from './bag';

const VERSION = "1.4";

export default class Game {
   constructor(config) {
      this.actions = {
         inGame: {
            reset: () => this.reset,
            pause: () => {this.state = "paused"},
            left: () => {this.dx -= 1},
            right: () => {this.dx += 1},
            down: () => {this.dy += 1},
            rotateLeft: () => {this.currentTetromino.rotate("left")},
            rotateRight: () => {this.currentTetromino.rotate("right")},
            drop: () => {this.dropCurrentTetromino()},
            softDrop: () => {this.dropCurrentTetromino(true)},
         },
         gameOver: {
            pause: () => {this.startGame()},
            drop: () => {this.startGame()},
         },
         paused: {
            pause: () => {this.state = "inGame"},
            drop: () => {this.state = "inGame"},
         }

      };
      this.state = "gameOver";
      this.dx = 0;
      this.dy = 0;

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

      this.scoreboard = new Scoreboard(this);
      this.displayManager = new DisplayManager({
         game: this,
         w: 10, h: 20, 
         seed: config.seed,
         playbackData: config.playbackData,
      });
      this.inputManager = new InputManager(this);


      this.playField = new PlayField({
         game: this,
         w: 10,
         h: 20,
      });

      this.bag = new TetrominoBag(this.playField, config.seed);
      this.reset();
   }
   reset() {
      // Frames
      this.framesUntilTick = 60;
      this.frames = 0;

      // Game state
      this.state = "gameOver";

      // Score / lines / level
      this.score = 0;
      this.level = this.startLevel;
      this.lines = 0;

      window.requestAnimationFrame(() => {this.refresh()});
   }
   startGame() {
      this.state = "inGame";
      this.playField.reset();
      this.getNextTetromino();
      this.currentTetromino.addToPlayField();
      this.changeFPT();
   }
   getNextTetromino() {
       this.currentTetromino = this.nextTetromino || this.bag.randomTetromino();
       this.nextTetromino = this.bag.randomTetromino();
   }
   dropCurrentTetromino(soft = false) {
      this.currentTetromino.drop();
      this.framesUntilTick = soft ? this.framesPerTick : 0;
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
   changeFPT() {
      let fpt = 48 - Math.floor(Math.log10(this.level + 1) * 32);
      if(fpt < 1) fpt = 1;
      if(fpt == this.framesPerTick) {
         return false;
      }
      return this.framesPerTick = fpt;
   }
   handleFullRows() {
      let clearedRows = this.playField.getclearedRows();
      if(clearedRows == 4) {
         this.consecutiveTetris++;
         this.score += this.consecutiveTetris > 1 ? 1200 : 800;
      }
      else {
         this.score += clearedRows + 100;
         this.consecutiveTetris = 0;
      }
      this.changeLevel();
      this.changeFPT();

   }
   handleInput() {
      let pendingActions = this.inputManager.getPendingActions();
      let actions = this.actions[this.state];

      for(let action of Object.keys(actions)) {
         if(pendingActions[action] == true) {
            actions[action]();
         }
      }
      if(this.state == "inGame") {
         this.currentTetromino.move(this.dx, this.dy);
         this.dx = 0; this.dy = 0;
      }
   }
   refresh() {
      this.handleInput();
      if(this.framesUntilTick == 0) {
         this.changeFPT();
         if(this.state == "inGame") this.tick();
         this.framesUntilTick = this.framesPerTick;
      }
      this.displayManager.refresh(this.frames);
      this.framesUntilTick--;
      this.frames++;
      window.requestAnimationFrame(this.refresh.bind(this));
   }
   tick() {
      if(!this.currentTetromino.move(0, 1)) {
         this.currentTetromino.solidify();
         if(this.currentTetromino.y == 0) {
            this.gameOver = true;
            this.scoreboard.addScore('You', this.score);
            this.scoreboard.compileScores();
         }
         
         this.getNextTetromino();
         this.currentTetromino.addToPlayField();
         this.handleFullRows();
      }
   }
}
