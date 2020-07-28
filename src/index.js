import Game from "./game";

const PARAMS = {
   w: {fullName: "width", type: "int", default: 10},
   h: {fullName: "height", type: "int", default: 20},
   lvl: {fullName: "startLevel", type: "int", default: 0},
   pbid: {fullName: "playbackID", type: "str", default: null},
   dm: {fullName: "darkMode", type: "bool", default: false},
   reset: {fullName: "resetScores", type: "bool", default: false},
   music: {fullName: "enableMusic", type: "bool", default: false},
};


const params = (new URL(document.location)).searchParams;

const config = Object.entries(PARAMS).reduce((config, [param, props]) => {
   if(props.type == "int") config[props.fullName] = parseInt(params.get(param)) || props.default;
   else if(props.type == "bool") config[props.fullName] = params.has(param) || props.default;
   else if(props.type == "str") config[props.fullName] = params.get(param) || props.default;
   return config;
}, {});

console.log(config);

const game = new Game(config);