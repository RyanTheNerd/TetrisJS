import Tetromino from './tetromino';
const XorShift = require("xorshift").constructor;


export default class TetrominoBag {
    constructor(playField, seed = null) {
        if(seed == null) {
            seed = [];
            for(let i = 0; i < 4; i++) {
                seed.push(Math.floor(Math.random()*Math.pow(2, 32)));
            }
        }
        this.playField = playField;
        this.seed = seed;
        this.RNG = new XorShift(this.seed);
        this.tetrominos = "IJLOSTZ";
        this.pieces = [];
    }
    refillBag() {
        this.pieces = this.tetrominos.split('');
        for(let i = this.pieces.length-1; i > 0; i--) {
            let j = Math.floor(Math.random()*i);
            let placeholder = this.pieces[i];
            this.pieces[i] = this.pieces[j]; this.pieces[j] = placeholder;
        }

    }
    randomTetromino() {
        if(this.pieces.length === 0) this.refillBag();
        return new Tetromino(this.playField, this.pieces.pop());
    }
}