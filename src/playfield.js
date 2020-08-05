/* PlayField: Keeps track of all cells and current/next tetromino
   getCell(x, y): returns false if (x, y) is not on playfield, 
      null if location available, otherwise returns cell at (x, y)

   dropCurrentTetromino(soft): drops currentTetromino, then steps if soft == false

   reset: Resets all attributes to their default values
*/

/*
solidify means to move from the tetromino to the row
*/

export default class PlayField {
   
   constructor(config) {
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
   addCell(cell) {
      this.cells.push(cell);
   }
   solidifyCell(cell) {
      this.rows[cell.y].push(cell);
   }
   addTetromino(tetromino) {
     for(let cell of tetromino.cells) {
        this.cells.push(cell);
     } 
   }
   getclearedRows() {
      let clearedRows = 0;
      for(let row in this.rows) {
         if(this.rows[row].length == this.w) {

            // remove the cell from this.cells
            for(let cell of this.rows[row]) {
               this.cells.splice(this.cells.indexOf(cell), 1);
            }

            // Delete the row and the cells in it
            this.rows.splice(row, 1);
            this.rows.unshift(new Array());

            // Shift the cells above the deleted row down
            this.cells.forEach((cell) => {if(cell.y < row) cell.y += 1});

            // Add it to the cleared row count
            clearedRows++;
         }
      }
      return clearedRows;
   }
   reset() {
      this.cells = [];
      this.rows = [...Array(this.h)].map(() => Array());
   }
}