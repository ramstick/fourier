var path = [{ x: 0, y: 0 }, { x: 1000, y: 1000 }];
var b = { x: 0, y: 0 };

var c = [];

var SCALE = 10;

var NUMBER_COMPUTED = 2000;

function multiply(a, b) {
    return { r: a.r * b.r - a.i * b.i, i: a.r * b.i + a.i * b.r };
}

function add(a, b) {
    return { r: a.r + b.r, i: a.i + b.i };
}

function multiplyReal(a, r) {
    return { r: a.r * r, i: a.i * r };
}



/**
 *  returns a new complex number with value
 *  
 *  e ^ (ix)
 * 
 * @param {Number} x its just x lol
 */
function complexExp(x) {
    return { r: Math.cos(x), i: Math.sin(x) };
}


var discs = [{ freq: 2, coeff: { r: 1, i: 0 } }, { freq: 4, coeff: { r: 0, i: 1 } }];

var PATH = [];

function lineTo(a) {
    line(b.x * 5, b.y * 5, a.x * 5, a.y * 5);
    b = a;
}

function lineComplex(a, b) {
    line(SCALE * a.r + 500, 500 + SCALE * a.i, SCALE * b.r + 500, 500 + SCALE * b.i);
}

var t = 0;

function draw() {
    background(0);
    var end = { r: 0, i: 0 };
    var last = { r: 0, i: 0 };
    for (var i = 0; i < discs.length; i++) {
        end = add(end, multiply(discs[i].coeff, complexExp(2 * Math.PI * t * discs[i].freq)));
        stroke(255);
        lineComplex(last, end);
        noFill();
        stroke(100, 100, 255, 200);
        circle(end.r * SCALE + 500, end.i * SCALE + 500, 2 * SCALE * Math.sqrt(discs[i].coeff.r ** 2 + discs[i].coeff.i ** 2));
        last = end;
    }
    var curr = Math.floor(t * NUMBER_COMPUTED);
    var i = curr;
    var r = 230;
    var g = 255;
    var b = 100;
    const dr = r / NUMBER_COMPUTED / 6 * 5;
    const dg = g / NUMBER_COMPUTED / 6 * 5;
    const db = b / NUMBER_COMPUTED / 6 * 5;

    while (i != curr + 1) {
        stroke(r, g, b);
        r -= dr;
        g -= dg;
        b -= db;
        if (i == 0) {
            lineComplex(PATH[0], PATH[NUMBER_COMPUTED - 1]);
        } else {
            lineComplex(PATH[i], PATH[i - 1]);
        }
        i--;
        if (curr == NUMBER_COMPUTED - 1 && i == -1) {
            break;
        }
        if (i == -1) {
            i = NUMBER_COMPUTED - 1;
        }
    }


    t += .05 * deltaTime / 1000;
    if (t >= 1) {
        t = 0;
    }
}

function setup() {
    createCanvas(1000, 1000);
    t = 0;
    calculateCurve();
}

function calculateCurve() {
    PATH = [];
    for (var i = 0; i < 1; i += 1 / NUMBER_COMPUTED) {
        var end = { r: 0, i: 0 };
        for (var d = 0; d < discs.length; d++) {
            if (discs[d].freq == 0) {
                continue;
            }
            //console.log(d);
            //console.log(end);
            //console.log(discs[d].coeff)
            end = add(end, multiply(discs[d].coeff, complexExp(2 * Math.PI * discs[d].freq * i)));

        }
        PATH.push(end);
    }
}