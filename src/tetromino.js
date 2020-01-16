const TetrominoPatterns =  {
   'I': [4, 5, 6, 7],  // I 
   'J': [0, 4, 5, 6],  // J
   'L': [2, 4, 5, 6],  // L
   'O': [1, 2, 5, 6],  // O
   'S': [1, 2, 4, 5],  // S
   'T': [1, 4, 5, 6],  // T
   'Z': [0, 1, 5, 6],  // Z
};

//[0, 1, 2, 3],
//[4, 5, 6, 7],
//[8, 9, 10, 11],
//[12, 13, 14, 15],

const RotationChart = {
   standard: [2, 6, 10, null, 1, 5, 9, null, 0, 4, 8],
   I: [3, 7, 11, 15, 2, 6, 10, 14, 1, 5, 9, 13, 0, 4, 8, 12],
}

export default class Tetromino {
   constructor(playField, position, type) {
      this.x = position[0];
      this.y = position[1];
      this.playField = playField;
      this.type = type;
      this.rotationLock = false;
       
      if(this.type == "random") {
         let types = Object.keys(TetrominoPatterns);
         this.type = types[Math.floor(Math.random()*types.length)];
      }
      
      let colors = {
         I: 'red', 
         J: 'orange', 
         L: 'yellow', 
         O: 'green', 
         T: 'blue', 
         S: 'purple',
         Z: 'violet',
      };
      this.color = colors[this.type];
      
      this.pattern = TetrominoPatterns[this.type];
      
      this.cells = [];
      [
         [0, 1, 2, 3],
         [4, 5, 6, 7],
         [8, 9, 10, 11],
         [12, 13, 14, 15],
      ].forEach((y, j) => {
         y.forEach((x, k) => {
            if(this.pattern.includes(x)) {
               let cell = new Cell(this, k + this.x, j + this.y, this.color, x);
               this.cells.push(cell);
            }
         });
      });
   }
   enable() {
         this.playField.cells.push(...this.cells);
   }
   rotate() {
      let moveableCells = [];
      if("JLSTZI".includes(this.type)) {
         for(let cell of this.cells) {
            let prevPos = cell.relativePos();
            let rotationChart = (this.type == 'I') ? RotationChart.I : RotationChart.standard;
            let newAddress = rotationChart[cell.address];
            let newPos = cell.relativePos(newAddress);
            let newX = cell.x + newPos[0] - prevPos[0]; 
            let newY = cell.y + newPos[1] - prevPos[1];
            let toCell = this.playField.getCell(newX, newY);
            if(toCell == null || this.cells.includes(toCell)) {
               moveableCells.push({cell: cell, x: newX, y: newY, addr: newAddress});
            }
            else {
               return;
            }
         }   
         if(moveableCells.length == this.cells.length) {
            for(let i of moveableCells) {
               i.cell.x = i.x;
               i.cell.y = i.y;
               i.cell.address = i.addr;
            }
         }
      }
   }
   move(x, y) {
      
      let moveableCells = [];
      for(let cell of this.cells) {
         let toCell = this.playField.getCell(cell.x+x, cell.y+y);
         if(toCell == null || this.cells.includes(toCell)) {
            moveableCells.push(cell);
         }
      }
      if (moveableCells.length == this.cells.length) {
         for(let cell of this.cells) {
            cell.x += x;
            cell.y += y;
         }
         this.x += x;
         this.y += y;
         return true;
      }
      return false;
   }
   fall() {
      while(this.move(0, 1));
   }
}

export class Cell {
   constructor(tetromino, x, y, color, address) {
      this.tetromino = tetromino;
      this.x = x;
      this.y = y;
      this.color = color;
      this.address = address;
   }
   relativePos(addr = this.address) {
      let x = addr % 4;
      let y = Math.floor(addr/4);
      return [x, y];
   }
}