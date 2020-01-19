export default class Scoreboard {
   constructor() {
    
      this.scores = JSON.parse(window.localStorage.getItem("scores")) || 
      ['Ryan', 'John', 'Kyle', 'Dom', 'Emma'].map(
         (name, i) => {return [name, (i+1)*10000]}
      );
      console.log(this.scores);
      this.cleanScores();
   }
   addScore(name, score) {
      this.scores.push([name, score]);
      this.cleanScores();
      window.localStorage.setItem("scores", JSON.stringify(this.scores));
   }
   cleanScores() {
      this.scores = this.scores.sort(
         (a, b) => {
            return b[1] - a[1];
         }).slice(0, 5);
   }
}