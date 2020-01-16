import Interface from './interface';
import Tetromino from './tetromino';
export default class PlayField {
   
   constructor(config) {
      this.w = config.w;
      this.h = config.h;
      this.score = 0;
      this.tetrisCount = 0;
      
      
      this.reset();
      this.gameOver = true;
      this.display = new Interface(this, this.w, this.h);
   }
   getCell(x, y) {
      for(let cell of this.cells) {
         if(cell.x == x && cell.y == y) {
            return cell;
         }
      }
      if(x < this.w && x >= 0 && y < this.h && y >= 0) {
         return null;
      }
      else {
         return false;
      }
   }
   step() {
      if(this.gameOver || this.paused) {
         return; 
      }
      if(!this.currentTetromino.move(0, 1)) {
         if(this.currentTetromino.y == 0) {
            this.gameOver = true;
            console.log("You died lol");
            this.display.highscores.push(['You', this.score]);
            this.display.cleanScores();
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
            }
            if(clearedLines == 4) {
               this.tetrisCount++;
               this.score += this.tetrisCount > 1 ? 1200 : 800;
            }
            else {
               this.tetrisCount = 0;
               this.score += clearedLines * 100;
            }
            this.framesPerTick = Math.floor(this.score / 2500) + 45;
         }
         this.currentTetromino = this.nextTetromino;
         this.currentTetromino.enable(); 
         this.nextTetromino = new Tetromino(this, [3, 0], 'random');
      }
   }
   reset() {
      this.gameOver = false;
      this.paused = false;
      this.cells = [];
      this.rows = [...Array(this.h)].map(e => Array());
      this.currentTetromino = new Tetromino(this, [3, 0], 'random');
      this.currentTetromino.enable();
      this.nextTetromino = new Tetromino(this, [3, 0], 'random');
      this.score = 0;
   }
   
}