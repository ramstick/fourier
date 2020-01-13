class Vector {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    multiply(v2) {
        this.x *= v2.x;
        this.y *= v2.y;
    }

    add(v2) {
        this.x += v2.x;
        this.y += v2.y;
    }

    multiplyConst(x) {
        this.x *= x;
        this.y *= x;
    }

}

class svg_bezier {

    constructor(a1, a2, b1, b2, c1, c2, d1, d2) {
        this.a1 = a1;
        this.b1 = b1;
        this.c1 = c1;
        this.d1 = d1;
        this.a2 = a2;
        this.b2 = b2;
        this.c2 = c2;
        this.d2 = d2;
    }

    /**
     * Get the point at a given time t on a bezier curve
     * 
     * @param {*} t - time parameter
     * @return the point at that time t
     */

    getPointOnParametric(t) {
        const inv_t = 1 - t;

        return { x: this.a1 * inv_t ** 3 + 3 * this.b1 * inv_t ** 2 * t + 3 * this.c1 * inv_t * t ** 2 + this.d1 * t ** 3, y: this.a2 * inv_t ** 3 + 3 * this.b2 * inv_t ** 2 * t + 3 * this.c2 * inv_t * t ** 2 + this.d2 * t ** 3 };


    }

}

class svg_arc {

    constructor(startX, startY, r1, r2, angle, laf, sf, endX, endY) {
        const a = svgArcToCenterParam(startX, startY, r1, r2, angle, laf, sf, endX, endY);
        this.cx = a.cx;
        this.cy = a.cy;
        this.startAngle = a.startAngle;
        this.endAngle = a.endAngle;
        this.dAngle = a.deltaAngle;
        this.r1 = r1;
        this.r2 = r2;
        this.angle = angle;
    }

    getPointOnParametric(t) {
        const a = t * this.dAngle + this.startAngle;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const x = this.r1 * c;
        const y = this.r2 * s;
        return { x: x * Math.cos(this.angle) - y * Math.sin(this.angle), y: x * Math.sin(this.angle) + y * Math.cos(this.angle) };
    }

}

class svg_line {

    constructor(a1, a2, b1, b2) {
        this.a1 = a1;
        this.a2 = a2;
        this.b1 = b1;
        this.b2 = b2;
    }

    getPointOnParametric(t) {

        return { x: (this.a1 * (1 - t)) + this.b1 * t, y: (this.a2 * (1 - t)) + this.b2 * t };
    }

}


var output = "";

var START;
var END;
var started = false;

function calculate_fourier_series() {


    var files = document.getElementById("svg-input").files;

    var current_file = files[0];

    if (!current_file) {
        alert("Please Select a File!");
        return;
    }


    var reader = new FileReader();

    reader.onloadend = function(evt) {

        if (evt.target.readyState == FileReader.DONE) {
            output = evt.target.result;

            const groupTag_REGEX = /<g[\S\s]*?>[\S\s]*?<\/g>/g;
            const pathTag_REGEX = /<path[\S\s]+?\/>/g;
            const pathAttr_REGEX = /\sd *= *"[ -z\n]*?"/g;
            const gTagAttrs_REGEX = /<g[\S\s]*?>/g;
            const transformAttr_REGEX = /transform[\S\s]*?=[\S\s]*?"[\S\s]*?"[\S\s]*?/g;
            /*
            var groups_string = groupTag_REGEX.exec(output);
            var groups = []
            for (var i = 0; i < groups_string.length; i++) {
                var e = {};
                e.transform = transformAttr_REGEX.exec(groups_string[i])[0].split("\"")[1];
                var path_tag_strings = pathTag_REGEX.exec(groups_string[i])[0];

                groups.push(e);
            }
            console.log(groups);
            */
            var commands = [];
            var paths = output.match(pathAttr_REGEX);
            console.log(paths);
            for (var i = 0; i < 1; i++) {
                var path_string = paths[i].split("\"")[1];
                var lol = pathFromSVG(path_string);
                for (var j = 0; j < lol.length; j++) {
                    commands.push(lol[j]);
                }
            }
            commands.push(new svg_line(END.x, END.y, START.x, START.y))
            console.log(commands);
            compute(commands);
            displayCoeff();
        }

    }


    var blob = current_file.slice(0, current_file.size);

    reader.readAsBinaryString(blob);






}



function pathFromSVG(path_string) {

    var a = path_string.split(/(?=[A-Za-z])/);
    var c = [];
    for (var i = 0; i < a.length; i++) {
        var comm = {};
        var thing = a[i].split(/[\s,]/);

        comm.params = [];
        for (var j = 1; j < thing.length; j++) {
            if (thing[j] != 0)
                comm.params.push(parseFloat(thing[j]));
        }
        comm.params_num = comm.params.length;
        comm.command = thing[0];
        comm.string_array = thing;

        c.push(comm);
    }
    console.log(c);

    var start = { x: 0, y: 0 };
    var last = { x: 0, y: 0 };

    var commands = [];

    for (var i = 0; i < c.length; i++) {
        const comm = c[i];
        const params = comm.params;
        switch (comm.command) {
            case "M":
                last = { x: params[0], y: params[1] };
                start = { x: params[0], y: params[1] };

                break;
            case "C":
                if (!started) {
                    START = { x: last.x, y: last.y };
                    started = true;
                }
                while (true) {
                    commands.push(new svg_bezier(last.x, last.y, params[0], params[1], params[2], params[3], params[4], params[5]));
                    last.x = params[4];
                    last.y = params[5];
                    END = { x: last.x, y: last.y };
                    if (params.length < 12) {
                        break;
                    }
                    params = params.slice(6);
                }
                break;
            case "L":
                if (!started) {
                    START = { x: last.x, y: last.y };
                    started = true;
                }
                while (true) {
                    commands.push(new svg_line(last.x, last.y, params[0], params[1]));
                    last.x = params[0];
                    last.y = params[1];
                    END = { x: last.x, y: last.y };
                    if (params.length < 4) {
                        break;
                    }
                    params = params.slice(2);
                }
                break;
        }
    }

    c = commands;


    console.log(last);
    console.log(commands);

    return commands;
}

function getValueAtT(command_list, t) {
    var e = Math.floor(t * command_list.length);
    var para = t * command_list.length - e;
    if (t > 1) {
        return { r: 0, i: 0 };
    }
    if (e >= command_list.length) {
        return { r: 0, i: 0 };
    }
    const gae = command_list[e].getPointOnParametric(para);
    return { r: gae.x, i: gae.y };
}


function compute(command_list) {
    discs = [];
    for (var i = 1; i < 400; i++) {
        var sum = { r: 0, i: 0 };
        for (var j = 0; j < 1; j += 0.00001) {
            sum = add(sum, multiplyReal(multiply(complexExp(-2 * Math.PI * i * j), getValueAtT(command_list, j)), 0.00001));
        }
        discs.push({ freq: i, coeff: sum });

        sum = { r: 0, i: 0 };
        for (var j = 0; j < 1; j += 0.00001) {
            sum = add(sum, multiplyReal(multiply(complexExp(2 * Math.PI * i * j), getValueAtT(command_list, j)), 0.00001));
        }
        discs.push({ freq: -i, coeff: sum });
    }
    calculateCurve();

}

function displayCoeff() {
    var out = "";
    for (var i = 0; i < discs.length; i++) {
        out += "Frequency: " + discs[i].freq + " Coefficient: " + Math.round(discs[i].coeff.r * 100) / 100 + "+" + Math.round(discs[i].coeff.i * 100) / 100 + "i,  ";
    }
    //out = out.slice(0, Math.min(out.length, 100));
    document.getElementById("gae").innerHTML = out;
}





/**
 * 
 * ACTUAL BIG BRAIN CODE
 * 
 * Pretty much just code not written by me
 * 
 */
// svg : [A | a] (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+

function radian(ux, uy, vx, vy) {
    var dot = ux * vx + uy * vy;
    var mod = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
    var rad = Math.acos(dot / mod);
    if (ux * vy - uy * vx < 0.0) {
        rad = -rad;
    }
    return rad;
}
//conversion_from_endpoint_to_center_parameterization
//sample :  svgArcToCenterParam(200,200,50,50,0,1,1,300,200)
// x1 y1 rx ry φ fA fS x2 y2
function svgArcToCenterParam(x1, y1, rx, ry, phi, fA, fS, x2, y2) {
    var cx, cy, startAngle, deltaAngle, endAngle;
    var PIx2 = Math.PI * 2.0;

    if (rx < 0) {
        rx = -rx;
    }
    if (ry < 0) {
        ry = -ry;
    }
    if (rx == 0.0 || ry == 0.0) { // invalid arguments
        throw Error('rx and ry can not be 0');
    }

    var s_phi = Math.sin(phi);
    var c_phi = Math.cos(phi);
    var hd_x = (x1 - x2) / 2.0; // half diff of x
    var hd_y = (y1 - y2) / 2.0; // half diff of y
    var hs_x = (x1 + x2) / 2.0; // half sum of x
    var hs_y = (y1 + y2) / 2.0; // half sum of y

    // F6.5.1
    var x1_ = c_phi * hd_x + s_phi * hd_y;
    var y1_ = c_phi * hd_y - s_phi * hd_x;

    // F.6.6 Correction of out-of-range radii
    //   Step 3: Ensure radii are large enough
    var lambda = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
    if (lambda > 1) {
        rx = rx * Math.sqrt(lambda);
        ry = ry * Math.sqrt(lambda);
    }

    var rxry = rx * ry;
    var rxy1_ = rx * y1_;
    var ryx1_ = ry * x1_;
    var sum_of_sq = rxy1_ * rxy1_ + ryx1_ * ryx1_; // sum of square
    if (!sum_of_sq) {
        throw Error('start point can not be same as end point');
    }
    var coe = Math.sqrt(Math.abs((rxry * rxry - sum_of_sq) / sum_of_sq));
    if (fA == fS) { coe = -coe; }

    // F6.5.2
    var cx_ = coe * rxy1_ / ry;
    var cy_ = -coe * ryx1_ / rx;

    // F6.5.3
    cx = c_phi * cx_ - s_phi * cy_ + hs_x;
    cy = s_phi * cx_ + c_phi * cy_ + hs_y;

    var xcr1 = (x1_ - cx_) / rx;
    var xcr2 = (x1_ + cx_) / rx;
    var ycr1 = (y1_ - cy_) / ry;
    var ycr2 = (y1_ + cy_) / ry;

    // F6.5.5
    startAngle = radian(1.0, 0.0, xcr1, ycr1);

    // F6.5.6
    deltaAngle = radian(xcr1, ycr1, -xcr2, -ycr2);
    while (deltaAngle > PIx2) { deltaAngle -= PIx2; }
    while (deltaAngle < 0.0) { deltaAngle += PIx2; }
    if (fS == false || fS == 0) { deltaAngle -= PIx2; }
    endAngle = startAngle + deltaAngle;
    while (endAngle > PIx2) { endAngle -= PIx2; }
    while (endAngle < 0.0) { endAngle += PIx2; }

    var outputObj = { /* cx, cy, startAngle, deltaAngle */
        cx: cx,
        cy: cy,
        startAngle: startAngle,
        deltaAngle: deltaAngle,
        endAngle: endAngle,
        clockwise: (fS == true || fS == 1)
    }

    return outputObj;
}
