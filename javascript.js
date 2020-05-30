const DEG_TO_RAD = Math.PI / 180;
const FULL_ROTATION = 360;
const DECIMAL_PLACES = 4;
const BALL_RADIUS = 8;
const ANIMATION_INTERVAL = 20;

let solve = [];
let vals = [];
let stepInterval = 0;

let ball;
let canvas;
let ctx;
let width;
let height;
let rect;
let rectLeft = 0;
let rectTop = 0;
let rectRight;
let rectBottom;

//Define event listening to init things when the DOM loads
document.addEventListener('DOMContentLoaded', () => {
	loadCanvas();
	initEquations();
});

//Define utility class
class Util {
	static getId(text) {
		return document.getElementById(text);
	}
	
	static getClass(text) {
		return document.getElementsByClassName(text);
	}

	static setCalc(text) {
		Util.getId('calcText').innerHTML = text;
	}

	static longToShort(long) {
		switch(long) {
			case "Acceleration":
				return "a";
				break;
			case "Velocity Initial":
				return "vi";
				break;
			case "Velocity Final":
				return "vf";
				break;
			case "Displacement":
				return "d";
				break;
			case "Time":
				return "t";
				break;
			
			default:
				return null;
				break;
		}
	}
	
	static shortToLong(short) {
		switch(short) {
			case "a":
				return "Acceleration";
				break;
			case "d":
				return "Displacement";
				break;
			case "vi":
				return "Velocity Initial";
				break;
			case "vf":
				return "Velocity Final";
				break;
			case "t":
				return "Time";
				break;
			default:
				return null;
				break;
		}
	}
	
	static getUnits(variable) {
		switch(variable) {
			case "a":
				return "m/s²";
				break;
			case "d":
				return "m";
				break;
			case "vi":
				return "m/s";
				break;
			case "vf":
				return "m/s";
				break;
			case "t":
				return "s";
				break;
			default:
				return null;
				break;
		}
	}
}

//Switch between simulator and calculator
function switchModes(mode) {
	if(mode == "calc") {
		Util.getId('calcBox').style.display = "block";
		Util.getId('simBox').style.display = "none";
		Util.getId('calculator').style.backgroundColor = "#3094c2";
		Util.getId('calculator').style.color = "white";
		Util.getId('calculator').style.fontWeight = "300";
		Util.getId('simulation').style.backgroundColor = "white";
		Util.getId('simulation').style.color = "#3094c2";
		Util.getId('simulation').style.fontWeight = "500";
	} else {
		Util.getId('calcBox').style.display = "none";
		Util.getId('simBox').style.display = "block";
		Util.getId('simulation').style.backgroundColor = "#3094c2";
		Util.getId('simulation').style.color = "white";
		Util.getId('simulation').style.fontWeight = "300";
		Util.getId('calculator').style.backgroundColor = "white";
		Util.getId('calculator').style.color = "#3094c2";
		Util.getId('calculator').style.fontWeight = "500";
	}
}

//In the simulator, siwtch between the combined and separate modes
function switchVelocity(mode) {
	//Scalar means seaprate, vector means combined even though all velocities are vectors
	let scalar = Util.getClass('scalar');
	for(i of [0,1]) scalar[i].style.display = 'none';
	let vector = Util.getClass('vector');
	for(i of [0,1]) vector[i].style.display = 'none';
	if(mode == 'scalar') for(i of [0,1]) scalar[i].style.display = 'block';
	else for(i of [0,1]) vector[i].style.display = 'block';
}

//Easy method to check valid inputs
String.prototype.isNumber = function(){return parseFloat(this).toString() === this.toString();}

//Load the canvas and init certain variables
function loadCanvas() {
	canvas = document.getElementById("canvas");   // used to get the canvas to draw on it
	width = canvas.width;         // declares a variable called width and assigns it the width of the canvas
	height = canvas.height;       // declares a variable called height and assigns it the height of the canvas
	ctx = canvas.getContext("2d");	
	rect = canvas.getBoundingClientRect();
	rectRight = rectLeft + width;
	rectBottom = rectTop + height;

	//Set up onchange events
	let list = [...Util.getClass('simChange')];
	list.forEach(item => item.addEventListener('change', function() {updateValues(item)}));
	//Init all vals for simulation
	let temp = ["t", "a", "dy", "dx", "vf", "vi", "vx", "vm", "va"];
	temp.forEach(item => vals[item] = parseFloat(Util.getId('simInput-'+item).value));

	//Make images crisper
	ctx.mozImageSmoothingEnabled    = false;
	ctx.oImageSmoothingEnabled      = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled     = false;
	ctx.imageSmoothingEnabled       = false;

	//Start drawing
	ball = new Ball(width/2, height/2);
	setInterval(drawOnCanvas, ANIMATION_INTERVAL);
}

function drawOnCanvas() {
	ctx.clearRect(0,0,width,height);
	drawBall();
	drawText();
}

function drawBall() {
	ctx.fillStyle = ball.colour;
	ctx.beginPath();
	ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, 2 * Math.PI);
	ctx.fill();
}

function drawText() {
	let xDraw = 8;
	let yDraw = 16;
	let lineSize = 16;
	ctx.fillStyle = "black";
	ctx.font = "12px Arial";
	ctx.fillText(`Canvas Dimensions: 560 m by 560 m`, xDraw, yDraw);
}

//Initialize all equations
function initEquations() {
	//Order for everything will be a, d, t, vi, vf
	solve["a"] = [];
	solve["vi"] = [];
	solve["vf"] = [];
	solve["d"] = [];
	solve["t"] = [];

	
	//Acceleration
	solve["a"]["vi"] = (vf, d, t) => {
		return (d-(vf*t))/(-0.5*Math.pow(t,2));
	}
	solve["a"]["vf"] = (vi, d, t) => {
		return (d-(vi*t))/(0.5*Math.pow(t,2));
	}
	solve["a"]["d"] = (vi, vf, t) => {
		return (vf-vi)/t;
	}
	solve["a"]["t"] = (vi, vf, d) => {
		return (Math.pow(vf,2)-Math.pow(vi,2))/(2*d);
	}

	//Initial Velocity
	solve["vi"]["a"] = (vf, d, t) => {
		return (2*d)/t - vf;
	}
	solve["vi"]["vf"] = (a, d, t) => {
		return (d-0.5*a*Math.pow(t,2))/t;
	}
	solve["vi"]["d"] = (a, vf, t) => {
		return -(a*t)+vf;
	}
	solve["vi"]["t"] = (a, vf, d) => {
		return Math.sqrt(Math.pow(vf,2)-2*a*d);
	}

	//Final Velocity
	solve["vf"]["a"] = (vi, d, t) => {
		return (2*d)/t-vi;
	}
	solve["vf"]["vi"] = (a, d, t) => {
		return (d+0.5*a*Math.pow(t,2))/t;
	}
	solve["vf"]["d"] = (a, vi, t) => {
		return (a*t)+vi;
	}
	solve["vf"]["t"] = (a, vi, d) => {
		return Math.sqrt(Math.pow(vi,2)+2*a*d);
	}

	//Displacement
	solve["d"]["a"] = (vi, vf, t) => {
		return (vi+vf)*t/2;
	}
	solve["d"]["vi"] = (a, vf, t) => {
		return vf*t - 0.5*a*Math.pow(t,2);
	}
	solve["d"]["vf"] = (a, vi, t) => {
		return vi*t + 0.5*a*Math.pow(t,2);
	}
	solve["d"]["t"] = (a, vi, vf) => {
		return (Math.pow(vf,2)-Math.pow(vi,2))/(2*a);
	}

	//Time
	solve["t"]["a"] = (vi, vf, d) => {
		return (2*d)/(vi+vf);
	}
	solve["t"]["vi"] = (a, vf, d) => {
		return quadraticFormula(-0.5*a,vf,-d);
	}
	solve["t"]["vf"] = (a, vi, d) => {
		return quadraticFormula(0.5*a,vi,-d);
	}
	solve["t"]["d"] = (a, vi, vf) => {
		return (vf-vi)/a;
	}
}

function quadraticFormula(a,b,c) {
	let ret = [];
	ret[0] = (-b+Math.sqrt(Math.pow(b,2)-4*a*c))/(2*a);
	ret[1] = (-b-Math.sqrt(Math.pow(b,2)-4*a*c))/(2*a);
	return ret;
}

//Solve in the calculator
function calcSolve() {
	let solveFor, exclude;
	solveFor = Util.getId('calcSolveFor').value;
	exclude = Util.getId('calcExclude').value;
	if(solveFor == exclude) {
		Util.setCalc("You can't solve for the variable which you are excluding!");
		return;
	}

	//Set variables
	let a = parseFloat(Util.getId('calcInput-a').value);
	let vi = parseFloat(Util.getId('calcInput-vi').value);
	let vf = parseFloat(Util.getId('calcInput-vf').value);
	let d = parseFloat(Util.getId('calcInput-d').value);
	let t = parseFloat(Util.getId('calcInput-t').value);
	
	solveFor = Util.longToShort(solveFor);
	if(solveFor === null) {
		Util.setCalc("Invalid input for Solve For field.");
		return;
	}
	exclude = Util.longToShort(exclude);
	if(exclude === null) {
		Util.setCalc("Invalid input for Exclude field.");
		return;
	}

	//Select arguments and equations
	let arg1 = [null, ""];
	let arg2 = [null, ""];
	let arg3 = [null, ""];
	let args = ["a", "vi", "vf", "d", "t"];

	args.forEach(arg => {if(eval(arg + " == ''")) Util.getId('calcInput-'+arg).value = 0; });

	args.forEach(arg => {
		if(arg != solveFor && arg != exclude) {
			if(arg1[0] === null) {
				arg1[0] = eval(arg);
				arg1[1] = arg;
			} else if(arg2[0] === null) {
				arg2[0] = eval(arg);
				arg2[1] = arg;
			} else {
				arg3[0] = eval(arg);
				arg3[1] = arg;
			}
		}
	});

	if(arg1[0] === '' || arg2[0] === '' || arg3[0] === '') {
		Util.setCalc("Invalid inputs in the argument fields.");
		return;
	}

	//Solve
	let answer = solve[solveFor][exclude](arg1[0], arg2[0], arg3[0]);
	let result;
	try {
		if(Number.isNaN(answer)) {
			result = `There is no mathematical answer for ${Util.shortToLong(solveFor)}.`;
		} else {
			if(solveFor == 't') {
				let start = `${Util.shortToLong(solveFor)} is `;
				if(Array.isArray(answer)) {
					let val1 = answer[0];
					let val2 = answer[1];

					//Check for possible invalid values
					if((Number.isNaN(val1) || val1 < 0) && (Number.isNaN(val1) || val2 < 0)) result = start + `${val1.toFixed(DECIMAL_PLACES)} s (invalid) and ${val2.toFixed(DECIMAL_PLACES)} s (invalid).`;
					else if(val1 < 0) result = start + `${val1.toFixed(DECIMAL_PLACES)} s (invalid) and ${val2.toFixed(DECIMAL_PLACES)} s.`;
					else if(val2 < 0) result = start + `${val1.toFixed(DECIMAL_PLACES)} s and ${val2.toFixed(DECIMAL_PLACES)} s (invalid).`;
					else result = start + `${val1.toFixed(DECIMAL_PLACES)} s and ${val2.toFixed(DECIMAL_PLACES)} s.`;
				} else {
					if(answer < 0) result = start + `${answer.toFixed(DECIMAL_PLACES)} s (invalid).`;
					else result = start + `${answer.toFixed(DECIMAL_PLACES)} s.`
				}
			} else {
				result = `${Util.shortToLong(solveFor)} is ${answer.toFixed(DECIMAL_PLACES)} ${Util.getUnits(solveFor)}.`;
			}
		}
	} catch(err) {
		//No error that I know of should cause this, but better to be safe
		alert("Error - please report to program creator");
		console.log(err);
	}
	let string = `With <b>${Util.shortToLong(arg1[1])} = ${(arg1[0])} ${Util.getUnits(arg1[1])}</b>, 
		<b>${Util.shortToLong(arg2[1])} = ${(arg2[0])} ${Util.getUnits(arg2[1])}</b>, 
		and <b>${Util.shortToLong(arg3[1])} = ${(arg3[0])} ${Util.getUnits(arg3[1])}</b> 
		excluding <b>${Util.shortToLong(exclude)}</b><br><br>
		${result}`;
	Util.setCalc(string);
}

//Deal with updating a single value of all the inputs in the simulator
function updateValues(item) {
	let index = item.id.substring(item.id.indexOf("-")+1);
	if(!item.value.isNumber() && item.value != "") {
		alert("Please input a valid number value or leave this field entirely blank.");
		item.value = "";
		return;
	} else {
		vals[index] = parseFloat(item.value);
		if(Number.isNaN(parseFloat(item.value))) return;
		
		//Deal with some logic
		if((index=="va" || index=="vm") && !Number.isNaN(vals["va"]) && !Number.isNaN(vals["vm"])) {
			vals["vx"] = vals["vm"]*Math.cos(vals["va"]*DEG_TO_RAD);
			vals["vi"] = vals["vm"]*Math.sin(vals["va"]*DEG_TO_RAD);
			Util.getId('simInput-vx').value = vals["vx"];
			Util.getId('simInput-vi').value = vals["vi"];
		} else if((index=="vx" || index=="vi") && !Number.isNaN(vals["vx"]) && !Number.isNaN(vals["vi"])) {
			vals["vm"] = Math.sqrt(Math.pow(vals["vx"],2) + Math.pow(vals["vi"],2))
			vals["va"] = Math.atan(vals["vi"]/vals["vx"])/DEG_TO_RAD;
			Util.getId('simInput-vm').value = vals["vm"];
			Util.getId('simInput-va').value = vals["va"];
		}
	}
}

//Simulation Solve Function
function simSolve() {
	let temp = ["t", "a", "dy", "vf", "vi"];
	temp.forEach(val => updateValues(Util.getId("simInput-"+val)));

	let vCount = 0;
	if(!Number.isNaN(vals["a"])) vCount++;
	if(!Number.isNaN(vals["vi"])) vCount++;
	if(!Number.isNaN(vals["vf"])) vCount++;
	if(!Number.isNaN(vals["dy"])) vCount++;
	if(!Number.isNaN(vals["t"])) vCount++;

	//Eliminate potential variables that don't dictate the initial state - in case the user defines an impossible current state
	if(vCount > 3) {
		Util.getId('simInput-t').value="";
		updateValues(Util.getId('simInput-t'));
	}
	if(vCount > 4){
		Util.getId('simInput-vf').value="";
		updateValues(Util.getId('simInput-vf'));
	}

	if(vCount >= 3) {
		//Manually check what can be calculated
		if(Number.isNaN(vals["a"])) {
			if(Number.isNaN(vals["vi"])) vals["a"] = manualSolve("a", "vi");
			else if(Number.isNaN(vals["vf"])) vals["a"] = manualSolve("a", "vf");
			else if(Number.isNaN(vals["dy"])) vals["a"] = manualSolve("a", "dy");
			else if(Number.isNaN(vals["t"])) vals["a"] = manualSolve("a", "t");
			else vals["a"] = manualSolve("a","vi"); //Pick any case - this should never be called
		}
		if(Number.isNaN(vals["vi"])) {
			//If a was missing it has been solved
			if(Number.isNaN(vals["vf"])) vals["vi"] = manualSolve("vi", "vf");
			else if(Number.isNaN(vals["dy"])) vals["vi"] = manualSolve("vi", "dy");
			else if(Number.isNaN(vals["t"])) vals["vi"] = manualSolve("vi", "t");
			else vals["vi"] = manualSolve("vi","a"); //In case a had been missing but was solved
		}
		if(Number.isNaN(vals["vf"])) {
			//If a or vi was missing they have been solved
			if(Number.isNaN(vals["dy"])) vals["vf"] = manualSolve("vf", "dy");
			else if(Number.isNaN(vals["t"])) vals["vf"] = manualSolve("vf", "t");
			else vals["vf"] = manualSolve("vf","a"); //In case a had been missing but was solved
		}
		if(Number.isNaN(vals["dy"])) {
			//If a or vi or vf was missing they have been solved
			if(Number.isNaN(vals["t"])) vals["dy"] = manualSolve("dy", "t");
			else vals["dy"] = manualSolve("dy", "a"); //In case a had been missing but was solved
		}
		if(Number.isNaN(vals["t"])) {
			//Every other possible missing variable is solved
			vals["t"] = manualSolve("t", "a"); //In case a had been missing but was solved
		}

		if(Number.isNaN(vals["a"]) || Number.isNaN(vals["vi"]) || Number.isNaN(vals["vf"]) || Number.isNaN(vals["dy"]) || Number.isNaN(vals["t"])) {
			alert("One or more of your inputted values result in NaN calculations - please revise and try again.");
			return false;
		}
	} else {
		alert("Not enough variables have been inputted to solve the y-component of this problem.");
		return false;
	}

	//HORIZONTAL -- time is 100% known at this point
	let hCount = 0;
	if(!Number.isNaN(vals["vx"])) hCount++;
	if(!Number.isNaN(vals["dx"])) hCount++;

	if(hCount > 1) vals["dx"] = NaN;

	if(hCount > 0) {
		if(Number.isNaN(vals["dx"])) vals["dx"] = vals["vx"] * vals["t"];
		else vals["vx"] = vals["dx"] / vals["t"];
		if(Number.isNaN(vals["dx"]) || Number.isNaN(vals["vx"]) || Number.isNaN(vals["t"])) {
			alert("One or more of your inputted values result in NaN calculations - please revise and try again.");
			return false;
		}
	} else {
		alert("Not enough variables have been inputted to solve the x-component of this problem.");
		return false;
	}

	//Represent new values
	Util.getId('simInput-a').value = vals["a"];
	Util.getId('simInput-vi').value = vals["vi"];
	Util.getId('simInput-vf').value = vals["vf"];
	Util.getId('simInput-dy').value = vals["dy"];
	Util.getId('simInput-t').value = vals["t"];
	Util.getId('simInput-vx').value = vals["vx"];
	Util.getId('simInput-dx').value = vals["dx"];

	Util.getId('canvasStep').style.display = "flex";
	Util.getId('simSolve').style.display = "none";
	ball.move();
	return true;
}

//Define simple function for use in solving variablesi n the simulation
function manualSolve(solveFor, exclude) {
	let arg1 = [null, ""];
	let arg2 = [null, ""];
	let arg3 = [null, ""];
	let args = ["a", "vi", "vf", "dy", "t"];

	args.forEach(arg => {
		if(arg != solveFor && arg != exclude) {
			if(arg1[0] === null) {
				arg1[0] = eval("vals['"+arg+"']");
				arg1[1] = arg;
			} else if(arg2[0] === null) {
				arg2[0] = eval("vals['"+arg+"']");
				arg2[1] = arg;
			} else {
				arg3[0] = eval("vals['"+arg+"']");
				arg3[1] = arg;
			}
		}
	});

	//Solve and change variable names to fit
	if(solveFor == "dy") solveFor = "d";
	if(exclude == "dy") exclude = "d";
	let answer = solve[solveFor][exclude](arg1[0], arg2[0], arg3[0]);
	return answer;
}


//Define the ball class
class Ball {
	constructor(x,y) {
		this.x = x;
		this.y = y;
		this.xstart = x;
		this.ystart = y;
		this.colour = "blue";
	}

	move() {
		this.x = this.xstart + vals["dx"];
		this.y = this.ystart - vals["dy"]; //In canvas space, negative is up, so we invert that
	}
}


//Step Functions
function stepBack() { 
	let int = parseFloat(Util.getId('stepInterval').value);
	if(Number.isNaN(int) || int=='') {
		alert("Please input a valid step increment value.");
		return false;
	}

	//Do initial solve to determine base state
	Util.getId('simInput-dy').value = "";
	Util.getId('simInput-dx').value = "";
	Util.getId('simInput-vf').value = "";
	if(!simSolve()) return false;


	//Clear out changing values
	Util.getId('simInput-t').value = vals["t"]-int;
	Util.getId('simInput-dy').value = "";
	Util.getId('simInput-dx').value = "";
	Util.getId('simInput-vf').value = "";

	simSolve();
}

function stepForward() { 
	let int = parseFloat(Util.getId('stepInterval').value);
	if(Number.isNaN(int) || int=='') {
		alert("Please input a valid step increment value.");
		return false;
	}

	//Do initial solve  to determine base state
	Util.getId('simInput-dy').value = "";
	Util.getId('simInput-dx').value = "";
	Util.getId('simInput-vf').value = "";
	if(!simSolve()) return false;


	//Clear out changing values
	Util.getId('simInput-t').value = vals["t"]+int;
	Util.getId('simInput-dy').value = "";
	Util.getId('simInput-dx').value = "";
	Util.getId('simInput-vf').value = "";

	simSolve();
}