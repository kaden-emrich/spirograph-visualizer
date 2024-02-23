// Kaden Emrich
// SohCahToa
const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

var r1 = 100;
var speed1 = 1;

var r2 = 50;
var speed2 = 20;

var boost = 5;

var points = [[]];

function calculate() {
    points = [[]];
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    for(let i = 0; i <= (360 * speed2); i++) {
        var x1 = centerX + Math.cos((i / speed1) * (Math.PI / 180)) * r1;
        var y1 = centerY + Math.sin((i / speed1) * (Math.PI / 180)) * r1;

        var x2 = x1 + Math.cos((i / speed2) * (Math.PI / 180)) * r2;
        var y2 = y1 + Math.sin((i / speed2) * (Math.PI / 180)) * r2;

        // console.log(`(${x2}, ${y2})`); // for debugging

        points.push([x2, y2]);
    }

    ctx.stroke();
}

function draw() {
    calculate();
    var index = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var drawInterval = setInterval(() => {
        for(let i = 0; i < boost && index < points.length; i++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if(index == 0) {
                ctx.moveTo(points[index][0], points[index][1]);
            }
            else {
                ctx.lineTo(points[index][0], points[index][1]);
            }

            ctx.stroke();

            index++;

            if(index == points.length) {
                clearInterval(drawInterval);
            }
        }
    }, 1);
}