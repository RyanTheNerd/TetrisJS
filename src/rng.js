export default class RNG {
    constructor() {
        this.weight = 0.1;
        this.balance = {};
        for(let tetromino of "IJLOSTZ") {
            this.balance[tetromino] = 1;
        }
    }
    randomTetromino() {
        let highest = ['I', 0];
        for(let [tetromino, weight] of Object.entries(this.balance)) { 
            let likeliness = weight * Math.random();
            if(likeliness > highest[1]) {
                highest = [tetromino, likeliness];
            }
        }
        this.balance[highest[0]] -= this.weight;
        for(let key in this.balance) {
            if(highest[0] != key) {
                this.balance[key] += this.weight / 7;
            }
        }
        return highest[0];
    }
}