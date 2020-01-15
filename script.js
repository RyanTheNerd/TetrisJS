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
// Standard is 3x3 only uses 0, 1, 2, 4, 5, 6, 8, 9, 10
// I is 4x4
const RotationChart = {
   standard: [2, 6, 10, null, 1, 5, 9, null, 0, 4, 8],
   I: [3, 7, 11, 15, 2, 6, 10, 14, 1, 5, 9, 13, 0, 4, 8, 12],
}

class Interface {
   constructor(playField, w, h) {
      this.w = w;
      this.h = h;
      
      // Highscore stuff
      // TODO - Display highscores on endscreen, add score entry 
      this.paused = false;
      this.playField = playField;
      this.highscores = ['Ryan', 'John', 'Kyle', 'Dom', 'Emma'].map(
         (name, i) => {return [name, (i+1)*10000]});
      this.cleanScores();
      
      // Canvas stuff
      this.canvas = document.createElement('canvas');
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.frame = 0;
      this.framesPerTick = 45;
      
      this.canvas.height = window.innerHeight;
      this.cellSize = Math.floor(window.innerHeight / this.h);
      this.canvas.width = this.cellSize * this.w;
      
      // Input stuff
      this.inputTable = {
         ArrowLeft: "left",
         ArrowRight: "right",
         ArrowDown: "down",
         ArrowUp: "rotate",
         Space: "drop",
         Enter: "toggle",
      }
      this.inputs = {
         left: false,
         right: false,
         down: false,
         drop: false,
         rotate: false,
         toggle: false,
      }
      
      // Handles keyboard events
      window.addEventListener('keydown', function(event) {
         for(let [key, value] of Object.entries(this.inputTable)) {
            if(event.code == key) {
               this.inputs[value] = true;
            }
         }
      }.bind(this));
      window.addEventListener('keyup', function(event) {
         for(let [key, value] of Object.entries(this.inputTable)) {
            if(event.code == key) {
               this.inputs[value] = false;
            }
         }
      }.bind(this));
      // Handles touch screen events
      this.canvas.addEventListener('touchstart', function(event) {
         event.preventDefault();
      }.bind(this));
      this.canvas.addEventListener('touchcancel', function(event) {
         event.preventDefault();
      }.bind(this));
      
      window.addEventListener('touchend', function(event) {
         event.preventDefault();
         let x = event.changedTouches[0].pageX;
         let y = event.changedTouches[0].pageY;
         let w = this.canvas.width;
         let h = this.canvas.height;
         
         let boxes = {
            rotate: [w/3, 0, w * 2/3, h*3/4],
            drop: [0, h * 3/4, w, h],
            left: [0, 0, w/3, h * 3/4],
            right: [w * 2/3, 0, w, h * 2/3],
         }
         for(let [boxName, box] of Object.entries(boxes)) {
            if(x > box[0] && x < box[2] && y > box[1] && y < box[3]) {
               this.inputs[boxName] = true;
               console.log(boxName);
            }
         }
         
      }.bind(this));
      this.canvas.addEventListener('touchmove', function(event) {
         event.preventDefault();
      }.bind(this));
      this.refresh();
   }
   cleanScores() {
      this.highscores = this.highscores.sort(
         (a, b) => {
            return b[1] - a[1];
         }).slice(0, 5);
   }
   handleInput() {
      let tetromino = this.playField.currentTetromino;
      let x = 0;
      let y = 0;
      if(this.inputs.toggle) {
         this.playField.paused = !this.playField.paused;
         this.inputs.toggle = false;
         return;
      }
      else if(this.inputs.left) {
         this.inputs.left = false;
         x = -1;
      }
      else if(this.inputs.right) {
         this.inputs.right = false;
         x = 1;
      }
      else if(this.inputs.down) {
         this.inputs.down = false;
         y = 1;
      }
      else if(this.inputs.rotate) {
         this.inputs.rotate = false;
         tetromino.rotate();
      }
      else if(this.inputs.drop) {
         this.inputs.drop = false;
         tetromino.fall();
         if(this.playField.gameOver) {
            this.playField.reset();
         }
      }
      tetromino.move(x, y);
   }
   drawText(text, x=null, y=null, fontSize="16px", textAlign="center") {
      if(x == null) x = this.canvas.width/2;
      if(y == null) y = this.canvas.height/2;
      this.ctx.font = `${fontSize} Monospace`;
      this.ctx.textAlign = textAlign;
      this.ctx.fillStyle = "white";
      this.ctx.fillText(text, x, y);
   }
   drawEndScreen() {
      this.clear();
      this.drawText("Press space to start", null, this.canvas.height - 50);
      if(this.frame % 120 > 60) this.drawText("Highscores: ", null, 250, "25px");
      this.drawText("Tetris", null, 100, "50px" );
      for(let i in this.highscores) {
         let score = this.highscores[i];
         this.drawText(`${score[0]}: ${score[1]}`, null, 300 + i * 32);
      }
         
   }
   drawPausedScreen() {
      this.drawText(`PAUSED`, null, null, "32px");
   }
   drawPlayField() {
      if(!(this.frame % this.framesPerTick)) {
         this.playField.step();
      }
      this.playField.cells.forEach((cell) => {
         this.drawCell(cell);

      });
      let startPos = [(this.w - 1)*this.cellSize, 0];
      this.drawText(`Score: ${this.playField.score}`, 0, 16, '16px', 'left');
      this.drawText(`Next tetromino: `, startPos[0], 16, "16px", "end");
      this.playField.nextTetromino.cells.forEach((cell) => {
         let relativePos = cell.relativePos();
         let cellPos = [startPos[0] + relativePos[0]*this.cellSize/4, startPos[1] + relativePos[1]*this.cellSize/4];
         this.drawCell(cell, cellPos, 1/4);
      });

   }
   clear() {
      this.ctx.beginPath();
      this.ctx.fillStyle = "rgb(20, 20, 20)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.closePath();
   }
   refresh() {
      this.frame++;
      this.handleInput();
      this.clear();
      if(this.playField.gameOver) {
         this.drawEndScreen();
      }
      else if (this.playField.paused) {
         this.drawPausedScreen();
      }
      else {
         this.drawPlayField();
      }
      window.requestAnimationFrame(this.refresh.bind(this));
   }
   drawCell(cell, pos=null, scale=null) {
      if(pos == null) pos = [cell.x*this.cellSize, cell.y*this.cellSize];
      if(scale == null) scale = 1;
      this.ctx.beginPath();
      this.ctx.lineWidth = `${scale*4}`;
      this.ctx.rect(pos[0], pos[1], this.cellSize*scale, this.cellSize*scale);
      if(cell instanceof Cell) {
         this.ctx.strokeStyle = "white";
         this.ctx.fillStyle = cell.color;
      }
      else {
         this.ctx.strokeStyle = "black";
         this.ctx.fillStyle = "black";
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      
   }
}


class PlayField {
   
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
      this.cells = [];
      this.rows = [...Array(this.h)].map(e => Array());
      this.currentTetromino = new Tetromino(this, [3, 0], 'random');
      this.currentTetromino.enable();
      this.nextTetromino = new Tetromino(this, [3, 0], 'random');
      this.score = 0;
   }
   
}

class Tetromino {
   constructor(playField, position, type, color) {
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


class Cell {
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

let playField = new PlayField({
   w: 10,
   h: 17,
});
