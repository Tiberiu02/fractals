var canvas = document.getElementById("mandelbrot");
var ctx = canvas.getContext("2d");

var canvasV = document.getElementById("visible");
var ctxV = canvasV.getContext("2d");

function init(){
	updateCanvasSize();
	canvas.style.display = "none";

	calcMandel();
	ctxV.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  requestAnimationFrame( render );
	setInterval(passiveMandel, 1);
}

var moving = false;

var rectX;
var rectY;
var rectW;
var rectH;
var rectScale;

var pointer = {x: 0, y: 0};

var cameraX = 0;
var cameraY = 0;
var cameraScale = 1 / Math.min(canvas.width, canvas.height);

function toggleMoving() {
	moving = !moving;
}

function updateCanvasSize() { // Is called when the window is resized
	canvas.width = canvasV.width = window.innerWidth;
	canvas.height = canvasV.height = window.innerHeight;
  cameraScale = 2 / Math.min(canvas.width, canvas.height);
  cameraX = -0.75 * canvas.width * cameraScale;
  cameraY = -0.5 * canvas.height * cameraScale;

	calcMandel();
	ctxV.drawImage(canvas, 0, 0, canvas.width, canvas.height);
	passiveMandel.index = undefined;

  ctx.imageSmoothingEnabled = false;
}

function updateMouse(event){
  pointer.x = event.clientX;
  pointer.y = event.clientY;
}

function keyPress(e) {
	if ((event.which || event.keyCode) == 32)
		moving = !moving;
}

// Mouse wheel event
if (canvas.addEventListener) {
  document.getElementsByTagName("BODY")[0].addEventListener("mousewheel", MouseWheelHandler, false); // IE9, Chrome, Safari, Opera
  document.getElementsByTagName("BODY")[0].addEventListener("DOMMouseScroll", MouseWheelHandler, false); // Firefox
} else
  document.getElementsByTagName("BODY")[0].attachEvent("onmousewheel", MouseWheelHandler); // IE 6/7/8

// Mouse wheel hander
function MouseWheelHandler(e) {
	if (!moving)
		return;

  var e = window.event || e;
  var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	var vel = 0.2;
  if (delta == 1) {
		cameraX += canvas.width / 2 * cameraScale;
		cameraY += canvas.height / 2 * cameraScale;
		cameraScale /= (1 + vel);
		cameraX -= canvas.width / 2 * cameraScale;
		cameraY -= canvas.height / 2 * cameraScale;
  } else {
		cameraX += canvas.width / 2 * cameraScale;
		cameraY += canvas.height / 2 * cameraScale;
		cameraScale /= (1 - vel);
		cameraX -= canvas.width / 2 * cameraScale;
		cameraY -= canvas.height / 2 * cameraScale;
	}
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function render(){
	if (moving) {
		cameraX += (pointer.x - canvas.width/2) * cameraScale / 50;
		cameraY += (pointer.y - canvas.height/2) * cameraScale / 50;
	}

	var pixels = ctxV.getImageData(0, 0, canvasV.width, canvasV.height);
	var cache = ctx.getImageData(0, 0, canvas.width, canvas.height);

	var time = Date.now();
	//console.log(Date.now() - time);
	var index = 0;	
	for (var y = 0; y < canvas.height; y ++)
		for (var x = 0; x < canvas.width; x ++) {
			var ca = (x) * cameraScale + cameraX;// - canvas.width / 2 * cameraScale;
			var cb = (y) * cameraScale + cameraY;// - canvas.height / 2 * cameraScale;

			if (ca < rectX || cb < rectY || ca >= rectX + rectW || cb >= rectY + rectH ) {
				pixels.data[index ++] = 100;
				pixels.data[index ++] = 100;
				pixels.data[index ++] = 100;
				pixels.data[index ++] = 255;			
			} else {
				var rx = Math.floor((ca - rectX) / rectScale);
				var ry = Math.floor((cb - rectY) / rectScale);
				//console.log(rx + " " + ry);
				
				pixels.data[index + 0] = cache.data[(ry * Math.floor(rectW / rectScale + 0.01) + rx) * 4 + 0];
				pixels.data[index + 1] = cache.data[(ry * Math.floor(rectW / rectScale + 0.01) + rx) * 4 + 1];
				pixels.data[index + 2] = cache.data[(ry * Math.floor(rectW / rectScale + 0.01) + rx) * 4 + 2];
				pixels.data[index + 3] = cache.data[(ry * Math.floor(rectW / rectScale + 0.01) + rx) * 4 + 3];
				index += 4;
			}
		}

	ctxV.putImageData(pixels, 0, 0);

  requestAnimationFrame(render);
}

function passiveMandel()
{
	if (this.y == canvas.height || this.index == undefined) {
		if (this.y == canvas.height) {
			ctx.putImageData(this.pixels, 0, 0);
			rectX = this.cX;
			rectY = this.cY;
			rectW = canvas.width * this.cScale;
			rectH = canvas.height * this.cScale;
			rectScale = this.cScale;
		}
		this.index = 0;
		this.x = this.y = 0;
		this.pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
		this.cX = cameraX;
		this.cY = cameraY;
		this.cScale = cameraScale;
	}

	var maxIterations = 300;
	for (var i = 0; i < 100000 && this.y < canvas.height; i ++) {
		var ca = this.x * this.cScale + this.cX;
		var cb = this.y * this.cScale + this.cY;

		var q = (ca - 0.25) * (ca - 0.25) + cb * cb;
		if (q * (q + ca - 0.25) < 0.25 * cb * cb || (ca + 1) * (ca + 1) + cb * cb < 0.0625)
			color = [0, 0, 0];
		else {
			var a = ca;
			var b = cb;
			var o = a * a + b * b;
			var n = 0;
			while (a * a + b * b <= 4 && n < maxIterations) {
				o = o * 0.8 + 0.2 * a * a + b * b;
				var aa = a * a - b * b + ca;
				var bb = 2 * a * b + cb;

				if (a == aa && b == bb) {
					n = maxIterations;
					break;
				}
				a = aa;
				b = bb;

				n ++;
			}

			var color;
			if (n == maxIterations)
				color = [0, 0, 0];
			else {
				color = hslToRgb((n + o / 4) / maxIterations, 1, 0.5);
			}
		}

		this.pixels.data[index ++] = color[0];
		this.pixels.data[index ++] = color[1];
		this.pixels.data[index ++] = color[2];
		this.pixels.data[index ++] = 255;

		x ++;
		if (x == canvas.width) {
			x = 0;
			y ++;
		}
	}
}

function calcMandel(){
	var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

	var maxIterations = 300;
	var index = 0;
	for (var y = 0; y < canvas.height; y ++)
		for (var x = 0; x < canvas.width; x ++) {
			var ca = (x) * cameraScale + cameraX;
			var cb = (y) * cameraScale + cameraY;

			var q = (ca - 0.25) * (ca - 0.25) + cb * cb;
			if (q * (q + ca - 0.25) < 0.25 * cb * cb || (ca + 1) * (ca + 1) + cb * cb < 0.0625)
				color = [0, 0, 0];
			else {
				var a = ca;
				var b = cb;
				var o = a * a + b * b;
				var n = 0;
				while (a * a + b * b <= 4 && n < maxIterations) {
					o = o * 0.8 + 0.2 * a * a + b * b;
					var aa = a * a - b * b + ca;
					var bb = 2 * a * b + cb;

					if (a == aa && b == bb) {
						n = maxIterations;
						break;
					}
					a = aa;
					b = bb;

					n ++;
				}

				var color;
				if (n == maxIterations)
					color = [0, 0, 0];
				else {
					color = hslToRgb((n + o / 4) / maxIterations, 1, 0.5);
				}
			}


			pixels.data[index ++] = color[0];
			pixels.data[index ++] = color[1];
			pixels.data[index ++] = color[2];
			pixels.data[index ++] = 255;
		}
		ctx.putImageData(pixels, 0, 0);

		rectX = cameraX;
		rectY = cameraY;
		rectW = canvas.width * cameraScale;
		rectH = canvas.height * cameraScale;
		rectScale = cameraScale;
}
