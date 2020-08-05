/* DisplayManager: In charge of all drawing and executing game actions
   changeFPT(level): changes the frames per tick of the game based on level
   drawText(text, x, y, fontSize, textAlign): Draws text on the DisplayManager
   refresh: Runs the corresponding screen based on the game state
   drawPlayField: Draws the playfield and makes the game tick

*/

export default class DisplayManager {
   constructor(config) {
      this.w = config.w;
      this.h = config.h;
      this.game = config.game;
      this.rotation = 0;
      this.controls = this.game.inputManager.listControls();
      
      // Canvas stuff
      this.canvas = document.createElement('canvas');
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');

      this.frames = 0;
      
      //  Manage scale
      this.cellSize = Math.min(Math.floor(window.innerWidth / this.w), Math.floor(window.innerHeight / this.h));
      this.canvas.width = this.w * this.cellSize;
      this.canvas.height = this.h * this.cellSize;

   }
   // Change the number of frames per tick of the game
   // Apply the list of currently pending actions
   drawText(text, x=null, y=null, fontSize="16px", textAlign="center") {
      // Draw in the center by default
      if(x == null) x = this.canvas.width/2;
      if(y == null) y = this.canvas.height/2;

      this.ctx.font = `${fontSize} Monospace`;
      this.ctx.textAlign = textAlign;
      this.ctx.fillStyle = "black";
      this.ctx.fillText(text, x+1, y+1);
      this.ctx.fillStyle = "white";
      this.ctx.fillText(text, x, y);
   }
   drawEndScreen(displayText) {
      this.clear();
      this.drawText("Press space to start", null, this.canvas.height - 50);
      if(displayText) this.drawText("Highscores: ", null, 250, "25px");
      this.drawText(`Tetris JS v${this.game.version}`, null, 100, "35px");

      this.game.scoreboard.scores.forEach((score, i) => {
         this.drawText(`${score[0]}: ${score[1]}`, null, 300 + i * 32);
      });
   }
   drawPausedScreen() {
      this.drawPlayField();
      this.clear(0.5);
      this.drawText("PAUSED", null, 150, "32px");
      this.drawText("CONTROLS:", null, 150 + 45, "18px");
      
      let prevY = 150 + 45;
      this.controls.forEach((control) => this.drawText(control, null, prevY += 32, '16px', "left"));
   }
   drawPlayField() {
      this.drawTetrominoGuide(this.game.currentTetromino);
      let startPos = [(this.w - 1.25)*this.cellSize, 0];
      this.drawText(`Score: ${this.game.score}`, 0, 16, '16px', 'left');
      this.drawText(`Next tetromino: `, startPos[0], 16, '16px', 'end');
      this.drawText(`Level: ${this.game.level}`, 0, 32 + 8, '16px', 'left');
      this.drawCells();
      this.drawTetrominoSmall(this.game.nextTetromino, startPos[0], 0);
   }
   clear(alpha=1) {
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(20, 20, 20, ${alpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.closePath();
   }
   refresh(frames) {
      this.clear();
      if(this.game.state == 'gameOver') {
         this.drawEndScreen(frames % 120 > 60);
      }
      else if (this.game.state == "paused") {
         this.drawPausedScreen();
      }
      else if (this.game.state == "inGame") {
         this.drawPlayField();
      }
   }
   drawCube(x, y, fill, stroke, cellSize = this.cellSize) {
      this.ctx.beginPath();
      this.ctx.fillStyle = fill;
      this.ctx.strokeStyle = stroke;
      this.ctx.lineWidth = cellSize/this.cellSize * 4;
      this.ctx.fillRect(x, y, cellSize, cellSize);
      this.ctx.strokeRect(x, y, cellSize, cellSize);
   }
   drawCell(cell) {
      let pos = [cell.x*this.cellSize, cell.y*this.cellSize];
      let cellSize, fill, stroke;
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
   drawCellSmall(cell, x, y) {
      let relPos = cell.relativePos();
      let pos = [x + relPos[0]*0.25, y + relPos[1]*0.25];
      this.drawCube(pos[0], pos[1], cell.color, "white", this.cellSize / 4);
   }
   drawCells() {
      this.game.playField.cells.forEach((cell) => {
         this.drawCell(cell);
      });
   }
   drawTetrominoSmall(tetromino, x, y) {
      let cellSize = this.cellSize * 0.25;
      for(let cell of tetromino.cells) {
         let relPos = cell.relativePos();
         let cellPos = [
            x + relPos[0] * cellSize, 
            y + relPos[1] * cellSize
         ];
         this.drawCellSmall(cell, ...cellPos);
      }
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
         let drawPos = [
            cell.x * this.cellSize, 
            (cell.y + i) * this.cellSize
         ];

         this.drawCube(drawPos[0], drawPos[1], "black", cell.color);
      }
   }
}