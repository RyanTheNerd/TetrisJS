/*
   addScore(name, score): Add a score with a corresponding name to localStorage
   compileScores: Sorts scores and keeps top 5
*/
export default class Scoreboard {
   constructor(game) {
      let version = window.localStorage.getItem("version");
      window.localStorage.setItem("version", game.version);
      let defaultScores = ['Ryan', 'John', 'Kyle', 'Dom', 'Emma'].map(
         (name, i) => {return [name, (i+1)*10000]}
      );
      let localScores = JSON.parse(window.localStorage.getItem("scores"));

      if(localScores == null || version != game.version) {
         this.scores = defaultScores;
         this.writeScores();
      }

      else {
         this.scores = localScores;
      }
      this.compileScores();
   }
   addScore(name, score) {
      this.scores.push([name, score]);
      this.compileScores();
      this.writeScores();
   }
   writeScores() {
      window.localStorage.setItem("scores", JSON.stringify(this.scores));
   }
   compileScores() {
      this.scores = this.scores.sort(
         (a, b) => {
            return b[1] - a[1];
         }).slice(0, 5);
   }
}