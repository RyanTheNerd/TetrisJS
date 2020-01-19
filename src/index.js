import PlayField from './playfield';
import Interface from './interface';
import Scoreboard from './scoreboard';


class Game {
   constructor() {
      this.score = 0;
      this.playField = new PlayField({
         game: this,
         w: 10,
         h: 17,
      });
      this.scoreboard = new Scoreboard();
      this.interface = new Interface({game: this, w: 10, h: 17});
      this.reset();
      this.gameOver = true;
   }
   reset() {
      this.gameOver = false;
      this.paused = false;
      this.score = 0;
      this.playField.reset();
   }
}

let game = new Game();
