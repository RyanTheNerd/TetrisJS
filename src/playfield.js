import Tetromino from './tetromino';

export default class PlayField {
   
   constructor(config) {
      this.onlyTetromino = config.onlyTetromino || "random";
      this.game = config.game;
      this.w = config.w;
      this.h = config.h;
      this.tetrisCount = 0;
      this.reset();
   }
   getCell(x, y) {
      for(let cell of this.cells) {
         if(cell.x == x && cell.y == y) {
            return cell;
         }
      }
      // out of bounds
      // Negative y value is still valid
      if(x < this.w && x >= 0 && y < this.h) {
         return null;
      }
      // Doesn't exist
      else {
         return false;
      }
   }
   dropCurrentTetromino(soft = false) {
      this.currentTetromino.fall();
      if(!soft) {
         this.step();
      }
   }
   step() {
      if(this.game.gameOver || this.game.paused) {
         return; 
      }
      if(!this.currentTetromino.move(0, 1)) {
         if(this.currentTetromino.y == 0) {
            this.game.gameOver = true;
            this.game.scoreboard.addScore('You', this.game.score);
            this.game.scoreboard.cleanScores();
         }
         
         for(let cell of this.currentTetromino.cells) {
            this.rows[cell.y].push(cell);
         }
         
         let clearedLines = 0;
         for(let row in this.rows) {
            if(this.rows[row].length == this.w) {
               for (let cell of this.rows[row]) {
                  this.cells.splice(this.cells.indexOf(cell), 1);
               }
               this.cells.forEach((cell) => {if(cell.y < row) cell.y += 1});
               // Delete the row and the cells in it
               this.rows.splice(row, 1);
               this.rows.unshift(new Array());
               clearedLines++;
               this.game.lines++;
               this.game.changeLevel();
               this.game.interface.changeFPT();
            }
            if(clearedLines == 4) {
               this.tetrisCount++;
               this.game.score += this.tetrisCount > 1 ? 1200 : 800;
            }
            else {
               this.tetrisCount = 0;
               this.game.score += clearedLines * 100;
            }
         }

         this.currentTetromino = this.nextTetromino;
         this.currentTetromino.enable(); 
         this.nextTetromino = new Tetromino(this, [3, 0], this.onlyTetromino);
      }
   }
   reset() {
      this.cells = [];
      this.rows = [...Array(this.h)].map(e => Array());
      this.currentTetromino = new Tetromino(this, [3, 0], this.onlyTetromino);
      this.currentTetromino.enable();
      this.nextTetromino = new Tetromino(this, [3, 0], this.onlyTetromino);
   }
}