const XorShift = require("xorshift").constructor;


export default class Randomizer {
    constructor(seed = null) {
        if(seed == null) {
            seed = [];
            for(let i = 0; i < 4; i++) {
                seed.push(Math.floor(Math.random()*Math.pow(2, 32)));
            }
        }
        this.seed = seed;
        this.RNG = new XorShift(this.seed);
        this.tetrominos = "IJLOSTZ";
        this.bag = [];
    }
    refillBag() {
        this.bag = this.tetrominos.split('');
        for(let i = this.bag.length-1; i > 0; i--) {
            let j = Math.floor(Math.random()*i);
            let placeholder = this.bag[i];
            this.bag[i] = this.bag[j]; this.bag[j] = placeholder;
        }

    }
    randomTetromino() {
        if(this.bag.length === 0) {
            this.refillBag();
        }
        let piece = this.bag.pop();
        console.log(piece);
        return piece;

    }
}