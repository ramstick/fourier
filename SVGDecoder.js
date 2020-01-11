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
            for (var i = 0; i < paths.length; i++) {
                var path_string = paths[i].split("\"")[1];
                console.log(path_string);
                var lol = pathFromSVG(path_string);
                console.log(lol);
                for (var j = 0; j < lol.length; j++) {
                    commands.push(lol[j]);
                }
            }
            console.log(commands);
            //compute(commands);
        }

    }


    var blob = current_file.slice(0, current_file.size);

    reader.readAsBinaryString(blob);






}



function pathFromSVG(path_string) {

    var a = path_string.split(/(?=[A-Za-z])/);

    for (var i = 0; i < a.length; i++) {
        a[i] = a[i].trim().split(" ");
        a[i].params = a[i].split(/[\s,]/);
        a[i].params.filter(a => a.length != 0);
    }

    var start = { x: 0, y: 0 };
    var last = { x: 0, y: 0 };

    var commands = [];

    for (var i = 0; i < a.length; i++) {
        switch (a[i][0]) {
            case "M":
                last = { x: a[i][1][0], y: a[i][1][1] };
                start = { x: a[i][1][0], y: a[i][1][1] };
                break;
            case "C":
                commands.push(new svg_bezier(last.x, last.y, a[i][1][0], a[i][1][1], a[i][2][0], a[i][2][1], a[i][3][0], a[i][3][1]));
                last.x = a[i][3][0];
                last.y = a[i][3][1];
                break;
            case "L":
                commands.push(new svg_line(last.x, last.y, a[i][1][0], a[i][1][1]));
                last.x = a[i][1][0];
                last.y = a[i][1][1];
                break;
        }
    }


    c = commands;


    console.log(a);
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
    for (var i = 1; i < 100; i++) {
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