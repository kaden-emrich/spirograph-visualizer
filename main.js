// Kaden Emrich
// SohCahToa
const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const stickCanvas = document.getElementById("stick-canvas");
const stickCtx = stickCanvas.getContext("2d");
var stickWidth = 5;
stickCtx.lineWidth = stickWidth;

const progressBar = document.getElementById("progress-bar");

const replayCheckbox = document.getElementById("replay-checkbox");
const autoCheckbox = document.getElementById("auto-checkbox");
const rainbowCheckbox = document.getElementById("rainbow-checkbox");

const sliderBoost = document.getElementById("slider-boost");

const sliderF1 = document.getElementById("slider-f1");
const displayF1 = document.getElementById("display-f1");

const sliderF2 = document.getElementById("slider-f2");
const displayF2 = document.getElementById("display-f2");

const sliderF3 = document.getElementById("slider-f3");
const displayF3 = document.getElementById("display-f3");

const size = 500;

var autoDraw = true;

function updateSize() {
    canvas.width = size;
    canvas.height = size;

    stickCanvas.width = size;
    stickCanvas.height = size;

    document.getElementById("canvas-area").style.width = `${size}px`;
    document.getElementById("canvas-area").style.height = `${size}px`;

    document.getElementById("progress-area").style.width = `${size}px`;
}
updateSize();

var mods = [
    [100, 10],
    [40, -9]
];

/*

cool mods:
[
    [100, 40],
    [50, -39]
]

[
    [100, 50],
    [50, -28]
]

[
    [100, 40],
    [50, -39],
    [25, 20]
]

[
    [100, 40],
	[50, -39],
	[25, 13]
]

[
    [50, 13],
    [100, 29]
]

[[125,40],[62.5,-20],[31.25,10]]

[[125,40],[62.5,15],[31.25,-10]]

[[125,40],[62.5,19],[31.25,-12]]

[[125,1],[62.5,50],[31.25,-20]]

[[125,25],[62.5,-50],[31.25,49]] 3weave
[[125,50],[62.5,-25],[31.25,49]]

[[125,15],[62.5,-14],[31.25,15]] logo

*/

var lines = [];

var doRainbow = false;
var penColor = "#ffffff";
// var stickColor = "#ffffff";

var r1 = 100;
var speed1 = 1;

var r2 = 40;
var speed2 = 30;

var boost = 100;

var replay = false;

var points = [];

function gcd(a, b) {
    if(b == 0) {
        return a;
    }
    else {
        return gcd(b, a%b);
    }
}
function lcm(a, b) {
    if(a > b) {
        return (a / gcd(a, b)) * b;
    }
    else {
        return (b / gcd(a, b)) * a;
    }
}
function lcmArr(arr) {
    var last = arr[0];
    for(let i = 1; i < arr.length; i++) {
        last = lcm(arr[i], last);
    }

    return last;
}

function updateVars() {
    // console.log('updating vars...'); // for debugging
    replay = replayCheckbox.checked;
    autoDraw = autoCheckbox.checked;
    doRainbow = rainbowCheckbox.checked;

    boost = parseInt(sliderBoost.value);

    displayF1.innerText = sliderF1.value;
    displayF2.innerText = sliderF2.value;
    displayF3.innerText = sliderF3.value;

    mods = [];

    if(sliderF1.value != 0) {
        mods.push([size * 0.25, parseInt(sliderF1.value)]);
    }
    if(sliderF2.value != 0) {
        mods.push([size * 0.125, parseInt(sliderF2.value)]);
    }
    if(sliderF3.value != 0) {
        mods.push([size * 0.0625, parseInt(sliderF3.value)]);
    }

    if(autoDraw) {
        clearCanvas();
        quickDraw();
    }
}

function calculate() {
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    var items = 360;

    var speeds = [];
    for(let m = 0; m < mods.length; m++) {
        speeds.push(Math.abs(mods[m][1]));
    }

    var items = lcmArr(speeds) * 360;

    lines = [];
    points = [];
    for(let i = 0; i <= items; i++) {
        var lastX = centerX;
        var lastY = centerY;

        var nextLines = [];

        nextLines.push([lastX, lastY]);

        for(let j = 0; j < mods.length; j++) {

            if(mods[j][1] != 0) {
                lastX = lastX + Math.cos((i / mods[j][1]) * (Math.PI / 180)) * mods[j][0];
                lastY = lastY + Math.sin((i / mods[j][1]) * (Math.PI / 180)) * mods[j][0];
            }

            nextLines.push([lastX, lastY]);
        }

        lines.push(nextLines);

        points.push([lastX, lastY]);
    }
}

function stop() {
    clearInterval(drawInterval);
}

function clearCanvas() {
    // console.log('clearing...'); // for debugging
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stickCtx.clearRect(0, 0, stickCanvas.width, stickCanvas.height);
    progressBar.style.width = `0%`;
}

var drawInterval;
function draw() {
    calculate();
    var index = 0;
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    clearInterval(drawInterval);

    var displayedProgress = 0;
    progressBar.style.width = `${displayedProgress}%`;

    drawInterval = setInterval(() => {
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for(let i = index; i < index + boost && i < points.length; i++) {
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            if(doRainbow) {
                ctx.strokeStyle = `hsl(${i / points.length * 360} 100% 50%)`;  
            }
            else {
                ctx.strokeStyle = penColor;
            }

            if(i == 0) {    
                ctx.beginPath();
                ctx.moveTo(points[i][0], points[i][1]);
            }
            else {
                ctx.beginPath();
                ctx.moveTo(points[i - 1][0], points[i - 1][1]);
                ctx.lineTo(points[i][0], points[i][1]);
            }

            ctx.stroke();
        }
        
        index += boost;

        if(index < points.length) {
            stickCtx.clearRect(0, 0, stickCanvas.width, stickCanvas.height);

            stickCtx.beginPath();
            // stickCtx.moveTo(lines[index][0][0], lines[index][0][1]);
            for(let j = 1; j < lines[index].length; j++) {
                stickCtx.strokeStyle = `hsl(${j / lines[index].length * 360} 100% 50%)`;
                stickCtx.lineWidth = stickWidth;
                stickCtx.beginPath();
                stickCtx.moveTo(lines[index][j-1][0], lines[index][j-1][1]);
                stickCtx.lineTo(lines[index][j][0], lines[index][j][1]);

                stickCtx.stroke();
            }
            // stickCtx.strokeStyle = stickColor;
            
        }

        var progress = Math.floor(100 * index / points.length);
        if(progress > displayedProgress) {
            displayedProgress = progress;
            progressBar.style.width = `${displayedProgress}%`;
        }

        if(index >= points.length) {
            stickCtx.clearRect(0, 0, stickCanvas.width, stickCanvas.height);
            clearInterval(drawInterval);

            if(replay) draw();
        }
    }, 1000/60);
}

function quickDraw() {
    calculate();
    var index = 0;
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < points.length; i++) {
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(doRainbow) {
            ctx.strokeStyle = `hsl(${i / points.length * 360} 100% 50%)`;  
        }
        else {
            ctx.strokeStyle = penColor;
        }

        // ctx.lineWidth = 10; // for debugging

        if(i == 0) {    
            ctx.beginPath();
            ctx.moveTo(points[i][0], points[i][1]);
        }
        else {
            ctx.beginPath();
            ctx.moveTo(points[i - 1][0], points[i - 1][1]);
            ctx.lineTo(points[i][0], points[i][1]);
        }

        ctx.stroke();
    }
}

function saveImage() {
    var image = canvas.toDataURL("image/png");
    window.open(image);
}

function printMods() {
    console.log((JSON.stringify(mods)));
}

function init() {
    updateVars();
}

init();