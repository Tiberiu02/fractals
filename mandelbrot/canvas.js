function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

CanvasRenderingContext2D.prototype.getPixels = function()
{
	var imageData = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
	var data = imageData.data;

	var pixels = [];
	for (var i = 0; i < data.length; i += 4)
		pixels.push([data[i], data[i + 1], data[i + 2]]);

	return pixels;
}

CanvasRenderingContext2D.prototype.setPixels = function(pixels)
{
	var data = [];
	for (var i = 0; i < pixels.length; i ++) {
		data.push(pixels[i][0], pixels[i][1], pixels[i][2], 255);
	}

	var imageData = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
	for (var i = 0; i < data.length; i ++)
		imageData.data[i] = data[i];

	this.putImageData(imageData, 0, 0);
}
