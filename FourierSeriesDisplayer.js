class complexNumber {



    constructor(real, imaginary) {
        this.a = real;
        this.b = imaginary;
    }

    multiplyCompl(c2) {
        var temp = (this.a * c2.a) - (this.b * c2.b);
        this.b = (this.a * c2.b) + (this.b * c2.a);
        this.a = temp;
    }

    multiplyReal(x) {
        this.a *= x;
        this.b *= x;
    }

    multiplyImag(x) {
        this.b = this.a * x;
        this.a = -this.b * x;
    }

    addCompl(c2) {
        this.a += c2.a;
        this.b += c2.b;
    }

    getDist() {

        return sqrt(sq(this.a) + sq(this.b));

    }
}


function generateOrginComplexNumber() {
    return new complexNumber(0, 0);
}

function convert2DArray(twodarray) {
    return new complexNumber(twodarray[0], twodarray[1]);
}

function complexExp(real, imaginary) {

    var output = new complexNumber(cos(imaginary), sin(imaginary));
    //output.multiplyReal(exp(real));

    return output;


}

function drawComplexLine(comp1, comp2) {
    line(halfWidth + comp1.a + shift_x, halfHeight - comp1.b + shift_y, halfWidth + comp2.a + shift_x, halfHeight - comp2.b + shift_y);
}







var freq = new Array(-1, 2, -3, 4, -5, 6, -7, 8, -9, 10);

var coeff = new Array(new complexNumber(0, 2), new complexNumber(0, 1), new complexNumber(1, 0), new complexNumber(0, 2), new complexNumber(0, 1), new complexNumber(1, 0), new complexNumber(0, 2), new complexNumber(0, 1), new complexNumber(1, 0), new complexNumber(0.5, 0.5));

var time = 0;
var s = 50;
var can_width = 800,
    can_height = 800;
var delta_t = 0.001;
var num_seg = 1000;
var circle_stroke_weight = 2;
var line_stroke_weight = 2;
var drawn_curve_stroke_weight = 1;

var complexNumbers;

var shift_x = 0,
    shift_y = 0;

var halfHeight = can_height / 2;
var halfWidth = can_width / 2;

var changeX = 0,
    changeY = 0;




// Colors:

drawnCurveColor = new Array(247, 240, 25, 230);
circleColor = new Array(79, 185, 255, 128);



function setup() {

    createCanvas(can_width, can_height);

    recalculate();

}

function drawGrid() {


    //draw real and imaginary axis
    stroke(50, 80, 255, 200);
    line(0, 400 + shift_y, 800, 400 + shift_y);
    line(400 + shift_x, 0, 400 + shift_x, 800);



}

function recalculate() {
    complexNumbers = new Array();
    for (var i = 0; i < num_seg; i++) {
        var currX = 0,
            currY = 0;
        var temp;
        for (var j = 0; j < freq.length; j++) {
            temp = complexExp(0, TWO_PI * freq[j] * (i / num_seg));

            temp.multiplyCompl(coeff[j]);

            currX += temp.a;
            currY += temp.b;

        }
        print(str(currX) + " " + str(currY));

        complexNumbers.push(new Array(currX, currY));
    }
    console.log(complexNumbers.length);
    console.log(complexNumbers[76]);

}

function draw() {



    background(0);


    var te = int(time * num_seg);

    var r = drawnCurveColor[0],
        g = drawnCurveColor[1],
        b = drawnCurveColor[2];
    var dr = r / (num_seg),
        dg = g / (num_seg),
        db = b / (num_seg);
    r = 0;
    g = 0;
    b = 0;


    for (var i = te; i < complexNumbers.length + te; i++) {

        stroke(r, g, b, drawnCurveColor[4]);
        strokeWeight(2);
        var t1 = convert2DArray(complexNumbers[i % num_seg]),
            t2 = convert2DArray(complexNumbers[(i + 1) % num_seg]);
        t1.multiplyReal(s);
        0
        t2.multiplyReal(s);
        0

        drawComplexLine(t1, t2);
        r += dr;
        g += dg;
        b += db;

    }


    strokeWeight(2);













    strokeWeight(2);
    stroke(255);

    noFill();



    var lastX = 0,
        lastY = 0;

    var temp = new complexNumber(lastX, lastY);

    for (var i = 0; i < freq.length; i++) {

        stroke(circleColor[0], circleColor[1], circleColor[2], circleColor[3]);

        circle(halfWidth + temp.a + shift_x, halfHeight - temp.b + shift_y, coeff[i].getDist() * 2 * s);

        var temp2 = complexExp(0, time * TWO_PI * freq[i]);
        temp2.multiplyReal(s);


        temp2.multiplyCompl(coeff[i]);
        temp2.addCompl(temp);

        stroke(255, 255, 255);

        drawComplexLine(temp, temp2);
        temp = temp2;

    }

    drawGrid();





    time += delta_t;
    if (time >= 1) {
        time = 0;
    }
}


function mouseWheel(event) {



    //move the square according to the vertical scroll amount
    s += event.delta;
    s = max(1, s);
    //uncomment to block page scrolling
    //curveStrokes = new Array();
    return false;
}

var oldLogged = false;
var oldX = 0,
    oldY = 0;

function mouseDragged(event) {
    if (event.button === 0) {
        shift_x += mouseX - pmouseX;
        shift_y += mouseY - pmouseY;
    }
    return false;
}