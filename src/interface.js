import InputManager from "./inputManager";

/* Interface: In charge of all drawing and executing game actions
   changeFPT(level): changes the frames per tick of the game based on level
   handleInput: Executes pending actions from inputManager
   drawText(text, x, y, fontSize, textAlign): Draws text on the interface
   refresh: Runs the corresponding screen based on the game state
   drawPlayField: Draws the playfield and makes the game tick

*/

export default class Interface {
   constructor(config) {
      this.record = config.record;
      this.recording = {};
      this.w = config.w;
      this.h = config.h;
      this.game = config.game;
      this.rotation = 0;
      this.inputManager = new InputManager(this);
      
      // Canvas stuff
      this.canvas = document.createElement('canvas');
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.frames = 0;
      this.inGameFrames = 0;
      this.framesPerTick = null;
      
      this.canvas.height = window.innerHeight;
      this.cellSize = Math.floor(window.innerHeight / this.h);
      this.canvas.width = this.cellSize * this.w;
      this.refresh();
   }
      
   changeFPT(level = this.game.level) {
      let fpt = 48 - Math.floor(Math.log10(level + 1) * 32);
      if(fpt < 1) fpt = 1;
      if(fpt == this.framesPerTick) {
         return false;
      }
      return this.framesPerTick = fpt;
   }
   handleInput() {
      let ipmg = this.inputManager;
      let tetromino = this.game.playField.currentTetromino;
      let x = 0;
      let y = 0;
      if(ipmg.readAction("pause")) {
         console.log("pause key");
         this.game.paused = !this.game.paused;
         return;
      }
      else if(ipmg.readAction("restart")) {
         this.game.reset();
      }
      else if(!(this.game.paused)) {
         if(ipmg.readAction("left")) {
            x = -1;
         }
         else if(ipmg.readAction("right")) {
            x = 1;
         }
         else if(ipmg.readAction("down")) {
            y = 1;
         }
         else if(ipmg.readAction("rotateLeft")) {
            tetromino.rotate('left');
         }
         else if(ipmg.readAction("rotateRight")) {
            tetromino.rotate('right');
         }
         else if(ipmg.readAction("softDrop")) {
            this.game.playField.dropCurrentTetromino(true);
            this.inGameFrames += this.framesPerTick - (this.inGameFrames % this.framesPerTick);
         }

      }
      if(ipmg.readAction('drop')) {
         if(this.game.gameOver) {
            this.inputManager.recording.exportData();
            this.game.reset();
            this.game.gameOver = false;
         }
         else if(this.game.paused) {
            this.game.paused = false;
         
         }
         else {
            this.game.playField.dropCurrentTetromino();
         }
      }
      tetromino.move(x, y);
   }
   drawText(text, x=null, y=null, fontSize="16px", textAlign="center") {
      if(x == null) x = this.canvas.width/2;
      if(y == null) y = this.canvas.height/2;
      this.ctx.font = `${fontSize} Monospace`;
      this.ctx.textAlign = textAlign;
      this.ctx.fillStyle = "black";
      this.ctx.fillText(text, x+1, y+1);
      this.ctx.fillStyle = "white";
      this.ctx.fillText(text, x, y);
   }
   drawEndScreen() {
      this.clear();
      this.drawText("Press space to start", null, this.canvas.height - 50);
      if(this.frames % 120 > 60) this.drawText("Highscores: ", null, 250, "25px");
      this.drawText(`Tetris JS v${this.game.version}`, null, 100, "35px" );
      for(let i in this.game.scoreboard.scores) {
         let score = this.game.scoreboard.scores[i];
         this.drawText(`${score[0]}: ${score[1]}`, null, 300 + i * 32);
      }
         
   }
   drawPausedScreen() {
      this.drawPlayField();
      this.clear(0.50);
      this.drawText("PAUSED", null, 150, "32px");
      this.drawText("CONTROLS:", null, 150 + 45, "18px");
      
      let prevY = 150 + 45;
      for(let control of this.inputManager.listControls()) {
         this.drawText(control, null, prevY += 32);
      }
   }
   drawPlayField() {
      this.inGameFrames++;
      if(!(this.inGameFrames % this.framesPerTick)) {
         this.game.playField.step();
      }
      this.game.playField.cells.forEach((cell) => {
         this.drawCell(cell);

      });
      this.drawTetrominoGuide(this.game.playField.currentTetromino);
      let startPos = [(this.w - 1)*this.cellSize, 0];
      this.drawText(`Score: ${this.game.score}`, 0, 16, '16px', 'left');
      this.drawText(`Next tetromino: `, startPos[0], 16, '16px', 'end');
      this.drawText(`Level: ${this.game.level}`, 0, 32 + 8, '16px', 'left');
      this.game.playField.nextTetromino.cells.forEach((cell) => {
         let relativePos = cell.relativePos();
         relativePos[0] *= this.cellSize/4;
         relativePos[1] *= this.cellSize/4;
         
         let cellPos = [startPos[0] + relativePos[0], startPos[1] + relativePos[1]];
         this.drawCell(cell, cellPos, 1/4);
      });

   }
   clear(alpha=1) {
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(20, 20, 20, ${alpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.closePath();
   }
   refresh() {
      this.frames++;
      this.handleInput();
      this.clear();
      if(this.game.gameOver) {
         this.drawEndScreen();
      }
      else if (this.game.paused) {
         this.drawPausedScreen();
      }
      else {
         this.drawPlayField();
      }
      window.requestAnimationFrame(this.refresh.bind(this));
   }
   drawCube(x, y, fill, stroke, cellSize = this.cellSize) {
      this.ctx.beginPath();
      this.ctx.fillStyle = fill;
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = cellSize/this.cellSize * 4;
      this.ctx.fillRect(x, y, cellSize, cellSize);
      this.ctx.strokeRect(x, y, cellSize, cellSize);


   }
   drawCell(cell, pos=null, scale=null) {
      if(pos == null) pos = [cell.x*this.cellSize, cell.y*this.cellSize];
      if(scale == null) scale = 1;
      let cellSize, fill, stroke;
      cellSize = this.cellSize*scale;
      if(cell != null && cell != undefined) {
         stroke = "white";
         fill = cell.color;
      }
      else {
         stroke = "black";
         fill = "black";
      }
      this.drawCube(pos[0], pos[1], fill, stroke, cellSize);
      
   }
   drawTetrominoGuide(tetromino) {
      // Find the lowest the tetromino can go
      let i;
      for(i = 0; tetromino.canMoveTo(0, i); i++) {};
      i--;
      if(i <= 2) {
         return;
      }

      for(let cell of tetromino.cells) {
         let relPos = cell.relativePos();
         let drawPos = [
            cell.x * this.cellSize, 
            (cell.y + i) * this.cellSize
         ];

         this.drawCube(drawPos[0], drawPos[1], "black", cell.color);
      }

   }
}
