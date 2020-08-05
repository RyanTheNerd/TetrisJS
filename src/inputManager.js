/*
Constants: 
   KEYS: key is code, value is name
   TURBO_KEYS: List of keys that are turboable
   TURBO: keyName and keyDesc of key
   ACTIONS: key is action name, value is action description
   BINDINGS: key is the code, value is the action name

Methods:
   keyIsBinded(code): return true if key is binded, false otherwise
   handleKeys(code, down): Handle key up/down events
   getPendingActions(): Return a list of all activated keys, deactivate if not a turboable key or turbo isn't enabled
   listControls(): Return a list of all key bindings and their corresponding actions
*/
const KEYS = {
   ArrowLeft: 'Left Arrow',
   ArrowRight: 'Right Arrow',
   ArrowUp: 'Up Arrow',
   Space: 'Space',
   KeyS: 'S',
   KeyF: 'F',
   KeyD: 'D',
   KeyR: 'R',
   KeyP: 'P',
   Enter: 'Enter',
};

const TURBO_KEYS = ['ArrowLeft', 'ArrowRight'];
const TURBO = {keyName: "ArrowDown", keyDesc: "Down Arrow"}

// todo: figure out how to structure actions / key bindings
const ACTIONS = {
   left: "Move Left (Turboable)",
   right: "Move Right (Turboable)",
   turbo: "Turbo while pressed",
   rotateLeft: "Rotate Left",
   rotateRight: "Rotate Right",
   drop: "Drop Tetromino",
   softDrop: "Soft Drop",
   restart: "Restart Game",
   pause: "Pause Game",
};

const BINDINGS = {
   ArrowLeft: "left",
   ArrowRight: "right",
   ArrowUp: "rotateRight",
   Space: 'drop',
   KeyS: 'softDrop',
   KeyF: 'rotateRight',
   KeyD: 'rotateLeft',
   KeyR: 'restart',
   KeyP: 'pause',
   Enter: 'pause',
};


class Key {
   constructor(keyName, keyDesc, actionName, actionDesc, canTurbo = false) {
      this.keyName = keyName;
      this.keyDesc = keyDesc;
      this.actionName = actionName;
      this.actionDesc = actionDesc;

      this.down = false;
      this.activated = false;

      this.canTurbo = canTurbo;
   }
   getDesc() {
      return `${this.keyDesc}: ${this.actionDesc}`;
   }
   getAction() {
      return this.actionName;
   }
}

export default class InputManager {
   constructor() {
      this.keys = {};
      this.turboKey = new Key(TURBO.keyName, TURBO.keyDesc, "turbo", ACTIONS.turbo);
      for(let key of Object.keys(KEYS)) {
         this.keys[key] = new Key(key, KEYS[key], BINDINGS[key], ACTIONS[BINDINGS[key]], TURBO_KEYS.includes(key));
      }
      window.addEventListener('keydown', (ev) => this.handleKeys(ev.code, true));
      window.addEventListener('keyup', (ev) => this.handleKeys(event.code, false));
   }
   keyIsBinded(code) {
      return Object.keys(this.keys).includes(code) || code == this.turboKey.keyName;
   }
   handleKeys(key, down) {
   /*
      First, make sure key is binded
      If it's the turbo key then register it as down/up
      If the key is a non-turbo key
      If the key was previously up, register it as activated
      Register key as down/up
   */
      if(!this.keyIsBinded(key)) return false;
      if(key == this.turboKey.keyName) {this.turboKey.down = down; return}
      if(down && this.keys[key].down == false) {
         this.keys[key].activated = true;
      }
      this.keys[key].down = down;
   }
   getPendingActions() {
      /*      
      For every key:
         If it's activated, record it to actions
         If a turboable key is down, and turbo is down too, activate the key
         Otherwise deactivate it after registering
      */
      let actions = {};
      for(let key of Object.values(this.keys)) {
         if(key.activated) actions[key.actionName] = true;
         if(this.turboKey.down && key.down && key.canTurbo) key.activated = true;
         else key.activated = false;
      }
      return actions;
   }
   listControls() {
       let controls = [];
       for(let key of Object.values(this.keys)) {
            controls.push(key.getDesc()); 
       }
       controls.push(this.turboKey.getDesc());
       return controls;
   }
}