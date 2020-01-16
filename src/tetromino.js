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
       
      if(this.type == "random") {
         let types = Object.keys(TetrominoPatterns);
         this.type = types[Math.floor(Math.random()*types.length)];
      }
      this.rotationChart = (this.type == 'I') ? RotationChart.I : RotationChart.standard;
      
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
               let cell = new Cell(this.playField, this, k + this.x, j + this.y, this.color, x);
               this.cells.push(cell);
            }
         });
      });
   }
   enable() {
         this.playField.cells.push(...this.cells);
   }
   rotate(direction) {
      let rotateCount = 0;
      if("JLSTZI".includes(this.type)) {
         for(let cell of this.cells) {
            // canRotate changes cell.nextState to 
               // the position after rotation if it returns true
            if(cell.canRotate(direction)) {
               rotateCount++;
            }
         }   
         if(rotateCount == this.cells.length) {
            for(let cell of this.cells) {
               cell.setNextState();
            }
         }
      }
   }
   move(x, y) {
      let moveCount = 0;
      for(let cell of this.cells) {
         if(cell.canMoveTo(cell.x+x, cell.y+y)) {
            moveCount++;
         }
      }
      if (moveCount == this.cells.length) {
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
   constructor(playField, tetromino, x, y, color, address) {
      this.playField = playField;
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
   canRotate(direction) {
      let prevPos = this.relativePos();
      let rotationChart = this.tetromino.rotationChart;
      let newAddress = rotationChart[this.address];
      if(direction == "left") {
         for(let i = 0; i < 2; i++) {
            newAddress = rotationChart[newAddress];
         }
      }
      let newPos = this.relativePos(newAddress);
      let newX = this.x + newPos[0] - prevPos[0]; 
      let newY = this.y + newPos[1] - prevPos[1];
      return this.canMoveTo(newX, newY, newAddress);
   }
   canMoveTo(x, y, address = null) {
      if (address == null) {
         address = this.address;
      }
      let toCell = this.playField.getCell(x, y);
      if(toCell == null || this.tetromino.cells.includes(toCell)) {
         this.nextState = {x: x, y: y, address: address};
         return true;
      }
      else {
         this.nextState = null;
         return false;
      }
   }
   setNextState() {
      for(let [key, value] of Object.entries(this.nextState)) {
         this[key] = value;
      }
      this.nextState = null;
   }
}