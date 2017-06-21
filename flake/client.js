var flakeCanvas = document.getElementById("flake");
var flakeCtx = flakeCanvas.getContext("2d");

function init() {
    updateCanvasSize();
    flakeCtx.setVortex(0.5, 0.5);

    requestAnimationFrame(render);
}

var angle = 0;
var pointer = {
    x: 0,
    y: 0
};
var flake = {
    x: 0,
    y: 0
};
var radius = 0;

function updateCanvasSize() { // Is called when the window is resized
    flakeCanvas.width = window.innerWidth;
    flakeCanvas.height = window.innerHeight;

    flakeCtx.setVortex(0.5, 0.5);

    flakeCtx.imageSmoothingEnabled = false;
    flakeCtx.rotate(angle);

    radius = Math.min(flakeCanvas.height, flakeCanvas.width) * 0.49;
}

function updateMouse(event) {
    pointer.x = event.clientX - flakeCanvas.width / 2;
    pointer.y = event.clientY - flakeCanvas.height / 2;
}

// Mouse wheel event
if (flakeCanvas.addEventListener) {
    flakeCanvas.addEventListener("mousewheel", MouseWheelHandler, false); // IE9, Chrome, Safari, Opera
    flakeCanvas.addEventListener("DOMMouseScroll", MouseWheelHandler, false); // Firefox
} else
    flakeCanvas.attachEvent("onmousewheel", MouseWheelHandler); // IE 6/7/8

// Mouse wheel hander
function MouseWheelHandler(e) {
    var e = window.event || e;
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    if (delta == 1) {
        var vel = 0.01;
        for (var i = 0; i < 10; i++) {
            setTimeout(function() {
                flake.x = (flake.x - pointer.x * vel) * (1 + vel);
                flake.y = (flake.y - pointer.y * vel) * (1 + vel);
                radius *= (1 + vel);
                vel *= 0.9;
            }.bind(this), i * 50);
        }
    } else {
        var vel = 0.01;
        for (var i = 0; i < 10; i++) {
            setTimeout(function() {
                flake.x = (flake.x + pointer.x * vel) / (1 + vel);
                flake.y = (flake.y + pointer.y * vel) / (1 + vel);
                radius /= (1 + vel);
                vel *= 0.9;
            }.bind(this), i * 50);
        }
    }
}

function render() {
    flakeCtx.drawFlake(flake.x, flake.y, radius, 5, angle);

    requestAnimationFrame(render);
}
