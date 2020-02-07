const KEY_BINDINGS = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowDown: "turbo",
    Space: "drop",
    KeyS: "softDrop",
    ArrowUp: "rotateRight",
    KeyF: "rotateRight",
    KeyD: "rotateLeft",
    KeyR: "restart",
    KeyP: "pause",
    Enter: "pause",
}
const KEY_DESCS = {
   ArrowLeft: "Left Arrow",
   ArrowRight: "Right Arrow",
   ArrowUp: "Up Arrow",
   ArrowDown: "Down Arrow",
   Space: "Space",
   KeyF: "F",
   KeyD: "D",
   KeyR: "R",
   KeyP: "P",
   Enter: "Enter",
}
const ACTION_DESCS = {
   left: "Move Left",
   right: "Move Right",
   turbo: "Turbo",
   drop: "Drop Tetromino",
   softDrop: "Soft Drop",
   rotateRight: "Rotate Right",
   rotateLeft: "Rotate Left",
   restart: "Restart Game",
   pause: "Pause Game",
}


export default class InputManager {
   constructor(_interface) {
      this.interface = _interface;
      // Input stuff

      this.keyBindings = KEY_BINDINGS;
      // TODO: make keys activate actions
      this.keys = Object.keys(KEY_BINDINGS);
      this.turboKeys = {
         "left": false,
         "right": false,
      };
      this.actions = {}; 
      for(const action of Object.values(KEY_BINDINGS)) {
         this.actions[action] = false;
      }

      this.recordingTable = {
         left: 0,
         right: 1,
         down: 2,
         drop: 3,
         rotate: 4,
      };
      // Handles keyboard events
      window.addEventListener('keydown', function(event) {
         for(let key of Object.keys(this.keyBindings)) {
            let action = this.keyBindings[key];
            if(event.repeat) return;
            if(event.code == key) {
               this.actions[action] = true;
               if(Object.keys(this.turboKeys).includes(action)) {
                  this.turboKeys[action] = true;
               }
            }
         }
      }.bind(this));
      window.addEventListener('keyup', function(event) {
         for(let key of Object.keys(this.keyBindings)) {
            let action = this.keyBindings[key];
            if(event.code == key) {
               this.actions[action] = false;
               if(Object.keys(this.turboKeys).includes(action)) {
                  this.turboKeys[action] = false;
               }
            }
         }
      }.bind(this));

      // Handles touch screen events
      window.addEventListener('touchstart', function(event) {
         event.preventDefault();
      }.bind(this));
      window.addEventListener('touchcancel', function(event) {
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
               this.input[boxName] = true;
            }
         }
         
      }.bind(this));

      window.addEventListener('touchmove', function(event) {
         event.preventDefault();
      }.bind(this));
   }
   listControls() {
       let controls = [];
       for(let [key, keyDesc] of Object.entries(KEY_DESCS)) {
            controls.push(`${keyDesc}: ${ACTION_DESCS[KEY_BINDINGS[key]]}`); 
       }
       return controls;
   }
   readAction(action) {
      let turbo = this.actions["turbo"];
      let turboKeys = Object.keys(this.turboKeys);
      let keyState = this.actions[action];

      // if action is a turbo key
      if(turboKeys.includes(action)) {
         if(keyState == true) {  // and action is acivated
            this.actions[action] = false; // default behavior
            return true;
         }
         // if turbo mode is activated and key is physically pressed
         else if(this.turboKeys[action] && turbo) {   
            return true;
         } 
         return false;
      }
      else if(action == "turbo") {
         return keyState;
      }
      else if(keyState == true) {
         this.actions[action] = false;
         return true;
      }
      else {
         return false;
      }
   }
}
