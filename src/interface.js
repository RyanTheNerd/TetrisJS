export default class Interface {
   constructor(playField, w, h) {
      this.w = w;
      this.h = h;
      
      // Highscore stuff
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
         KeyZ: "rotateLeft",
         KeyX: "rotateRight",
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
            rotateRight: [w/3, 0, w * 2/3, h*3/4],
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
      else if(this.inputs.rotateLeft) {
         this.inputs.rotateLeft = false;
         tetromino.rotate('left');
      }
      else if(this.inputs.rotateRight) {
         this.inputs.rotateRight = false;
         tetromino.rotate('right');
      }
      else if(this.inputs.drop) {
         this.inputs.drop = false;
         tetromino.fall();
         if(this.playField.gameOver || this.playField.paused) {
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
      this.drawPlayField();
      this.drawText("PAUSED", null, null, "32px");
      this.drawText("Press space to restart", this.canvas.width/2, this.canvas.height/2 + 45);
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
      if(cell != null && cell != undefined) {
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