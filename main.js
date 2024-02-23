// Kaden Emrich
// SohCahToa
const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

const stickCanvas = document.getElementById("stick-canvas");
const stickCtx = stickCanvas.getContext("2d");
stickCtx.lineWidth = 3;

const progressBar = document.getElementById("progress-bar");

const replayCheckbox = document.getElementById("replay-checkbox");

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
    [100, 40],
    [50, -39],
    [25, 20]
]

[
    [100, 40],
	[50, -39],
	[25, 13]
]

*/

var lines = [];

var doRainbow = true;
var penColor = "#ffffff";
var stickColor = "#ffffff";

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
}

// function calculate0() {
//     var centerX = canvas.width / 2;
//     var centerY = canvas.height / 2;

//     console.log(360 * speed2); // for debugging
    
//     points = [];
//     for(let i = 0; i <= (360 * speed2); i++) {
//         var x1 = centerX + Math.cos((i / speed1) * (Math.PI / 180)) * r1;
//         var y1 = centerY + Math.sin((i / speed1) * (Math.PI / 180)) * r1;

//         var x2 = x1 + Math.cos((i / speed2) * (Math.PI / 180)) * r2;
//         var y2 = y1 + Math.sin((i / speed2) * (Math.PI / 180)) * r2;

//         // console.log(`(${x2}, ${y2})`); // for debugging

//         points.push([x2, y2]);
//     }
// }

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
            lastX = lastX + Math.cos((i / mods[j][1]) * (Math.PI / 180)) * mods[j][0];
            lastY = lastY + Math.sin((i / mods[j][1]) * (Math.PI / 180)) * mods[j][0];

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
            stickCtx.moveTo(lines[index][0][0], lines[index][0][1]);
            for(let j = 1; j < lines[index].length; j++) {
                stickCtx.lineTo(lines[index][j][0], lines[index][j][1]);
            }
            stickCtx.strokeStyle = stickColor;
            stickCtx.stroke();
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
