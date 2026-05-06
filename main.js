// Kaden Emrich

const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const stickCanvas = document.getElementById("stick-canvas");
const stickCtx = stickCanvas.getContext("2d");
var stickWidth = 5;
stickCtx.lineWidth = stickWidth;

const backgroundCanvas = document.getElementById("background-canvas");
const backgroundCtx = backgroundCanvas.getContext('2d');

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

const overrideArea = document.getElementById("override-area");

var size = 1000;

var autoDraw = true;

function updateSize() {
    canvas.width = size;
    canvas.height = size;

    stickCanvas.width = size;
    stickCanvas.height = size;

    backgroundCanvas.width = size;
    backgroundCanvas.height = size;

    ctx.lineWidth = size / 200;

    // document.getElementById("canvas-area").style.width = `${size}px`;
    // document.getElementById("canvas-area").style.height = `${size}px`;

    // document.getElementById("progress-area").style.width = `${size}px`;
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

function updateVars(values,rb) {
    // console.log('updating vars...'); // for debugging
    replay = replayCheckbox.checked;
    autoDraw = autoCheckbox.checked;
    doRainbow = rainbowCheckbox.checked || rb;

    boost = parseInt(sliderBoost.value);

    displayF1.innerText = sliderF1.value;
    displayF2.innerText = sliderF2.value;
    displayF3.innerText = sliderF3.value;

    mods = [];

    if(values) {
        overrideArea.innerText = "Values overridden with: " + values.toString();
        for(let i = 0; i < values.length; i++) {
            if(values[i] == 0) {
                continue;
            }
            let sizeModifier = (0.5 ** (i+2));
            mods.push([size * sizeModifier, values[i]]);
        }
    }
    else {
        overrideArea.innerText = "";

        if(sliderF1.value != 0) {
            mods.push([size * 0.25, parseInt(sliderF1.value)]);
        }
        if(sliderF2.value != 0) {
            mods.push([size * 0.125, parseInt(sliderF2.value)]);
        }
        if(sliderF3.value != 0) {
            mods.push([size * 0.0625, parseInt(sliderF3.value)]);
        }
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

var normalizeAnimationTime = false;
var maxAnimationTime = 10000; // ms
var frameTime = 1000/30;
var drawInterval;
function draw(callback) {
    frameTime = 1000/30;

    // console.time("animation calculation");
    calculate();
    // console.timeEnd("animation calculation");

    var index = 0;

    // if(points.length * frameTime > maxAnimationTime) {
    //     frameTime = 60000 / points.length;
    //     console.log(`Animation too long, Frame time updated to: ${frameTime}ms`); // for debugging
    // }

    if(normalizeAnimationTime) {
        boost = 1;
        frameTime = maxAnimationTime / points.length;

        while(frameTime < 20) {
            boost++;
            frameTime = maxAnimationTime / (points.length / boost);
        }

        while(frameTime * points.length / boost < maxAnimationTime) {
            frameTime ++;
        }

        var calulatedAnimationTime = (points.length / boost) * frameTime;

        // console.log(`----------------------------------\nNormalizing animation time to ${maxAnimationTime}ms, \nFrame time updated to: ${frameTime}ms, \nDraws per frame: ${boost}, \nCalulated animation time: ${calulatedAnimationTime}ms`); // for debugging
        // console.log(`frame count: ${points.length}`); // for debugging
    }
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    clearInterval(drawInterval);

    var displayedProgress = 0;
    progressBar.style.width = `${displayedProgress}%`;

    let drawFunc = () => {
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
        progress = progress > 100 ? 100 : progress;
        // console.log(progress); // for debugging
        if(progress > displayedProgress) {
            displayedProgress = progress;
            progressBar.style.width = `${displayedProgress}%`;
        }

        if(index >= points.length && drawInterval) {
            clearInterval(drawInterval);
            drawInterval = undefined;
            stickCtx.clearRect(0, 0, stickCanvas.width, stickCanvas.height);

            // console.timeEnd("animation-time"); // for debugging
            
            if(callback) callback();

            if(replay) draw();
        }
    }

    // console.time("animation-time"); // for debugging;
    drawInterval = setInterval(() => {
        drawFunc();
    }, frameTime);
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

var buryTransparency = 0.75;
function bury() {
    ctx.fillStyle = `rgba(0,0,0,${buryTransparency})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

let animatedBuryFrameRate = 1000/30;
function animatedBury(time = 1000, trans = 0.75) {
    let frameCount = time / animatedBuryFrameRate;
    let a = 1 - (1-trans) ** (1 / frameCount);

    // console.log(a); // for debugging

    for(let i = 0.0; i < time; i += animatedBuryFrameRate) {
        setTimeout(() => {
            ctx.fillStyle = `rgba(0,0,0,${a})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }, i);
    }

    // setTimeout(() => {
    //     console.log("animated bury done");
    // }, time); // for debugging
}

let maxRandomTime = 20;
function drawRandom(callback, count = 3, rb = true) {
    stop();
    let times = [];

    for(let i = 0; i < count; i++) {
        let nextTime = Math.floor(Math.random() * (maxRandomTime * 2 + 1) - maxRandomTime);
        times.push(nextTime);
    }

    updateVars(times, rb);
    // console.log(mods.toString()); // for debugging
    draw(callback);
}

var autoplayDelay = 1000;
var continueAutoplay = true;
function startAutoplay() {
    continueAutoplay = true;
    normalizeAnimationTime = true;
    autoplay();
}
function autoplay() {
    let buryTime = 1000;

    if(!continueAutoplay) return;

    drawRandom(() => { 
        setTimeout(() => {
            animatedBury(buryTime);
            setTimeout(() => {
                autoplay();
            }, buryTime + 1000);
        }, autoplayDelay); 
    });
    
}


function init() {
    updateVars();

    setInterval(() => {
        backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

        backgroundCtx.drawImage(canvas, 0, 0);
    }, 1000 / 60);

    if(backgroundMode) {
        startAutoplay();
    };
}

init();