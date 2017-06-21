CanvasRenderingContext2D.prototype.ort = function(a, b, c)
{
	var val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);

	if (val == 0)
		return 0;

	return (val > 0) ? 1 : -1;
}

CanvasRenderingContext2D.prototype.intSegSeg = function(a1, a2, b1, b2)
{
	return (this.ort(a1, a2, b1) != this.ort(a1, a2, b2) && this.ort(b1, b2, a1) != this.ort(b1, b2, a2));
}

CanvasRenderingContext2D.prototype.intPointRect = function(p, r1, r2)
{
	return r1.x <= p.x && p.x <= r2.x && r1.y <= p.y && p.y <= r2.y;
}

CanvasRenderingContext2D.prototype.intSegRect = function(s1, s2, r1, r2)
{
	if (this.intPointRect(s1, r1, r2) || this.intPointRect(s2, r1, r2))
		return true;
	if (this.intSegSeg(s1, s2, r1, {x: r1.x, y: r2.y}) ||
			this.intSegSeg(s1, s2, r2, {x: r1.x, y: r2.y}) ||
			this.intSegSeg(s1, s2, r2, {x: r2.x, y: r1.y}) ||
			this.intSegSeg(s1, s2, r1, {x: r2.x, y: r1.y}))
		return true;
	return false;
}

CanvasRenderingContext2D.prototype.sign = function(p1, p2, p3)
{
	return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

CanvasRenderingContext2D.prototype.pointTri = function(a, b, c, p)
{
	var b1 = this.sign(p, a, b) < 0;
	var b2 = this.sign(p, b, c) < 0;
	var b3 = this.sign(p, c, a) < 0;

	return b1 == b2 && b2 == b3;
}

CanvasRenderingContext2D.prototype.flakeEdge = function(p1, p2, deep)
{
	var dist = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));

	if (dist <= 6) {
		// Color based on the position
		var color = "#00" + (66 + Math.floor(Math.abs(p1.x)) % 44).toString(16) + (66 + Math.abs(Math.floor(p1.y)) % 44).toString(16);

    this.strokeStyle = color;
    this.beginPath();
		this.moveTo(p1.x, p1.y);
		this.lineTo(p2.x, p2.y);
		this.lineWidth = 1;
		this.stroke();
	} else {
	// If deep is bigger than 0 we divide-and-conquer the line
		var m1 = { x: (p1.x * 2 + p2.x) / 3,
							 y: (p1.y * 2 + p2.y) / 3 };
		var m2 = { x: (p1.x + p2.x * 2) / 3,
							 y: (p1.y + p2.y * 2) / 3 };

		var a = Math.atan2(p2.x - p1.x, p2.y - p1.y);
		var l = dist;
		var t = { x: m1.x + Math.sin(a - Math.PI / 3) * l / 3,
							y: m1.y + Math.cos(a - Math.PI / 3) * l / 3 };

		var cx = this.canvas.clientWidth / 2;
		var cy = this.canvas.clientHeight / 2;

		if (this.intSegRect(p1, t, {x: -cx, y: -cy}, {x: cx, y: cy}) ||
				this.intSegRect(p2, t, {x: -cx, y: -cy}, {x: cx, y: cy}) ||
				this.intSegRect(p1, p2, {x: -cx, y: -cy}, {x: cx, y: cy}) ||
				this.pointTri(p1, p2, t, {x: cx, y: cy}) ||
				this.pointTri(p1, p2, t, {x: -cx, y: cy}) ||
				this.pointTri(p1, p2, t, {x: -cx, y: -cy}) ||
				this.pointTri(p1, p2, t, {x: cx, y: -cy})
		) {

			this.flakeEdge(p1, m1, deep - 1);
			this.flakeEdge(m1, t, deep - 1);
			this.flakeEdge(t, m2, deep - 1);
			this.flakeEdge(m2, p2, deep - 1);
		}
	}
}

CanvasRenderingContext2D.prototype.drawFlake = function(x, y, radius, deepness, angle = 0)
{
	this.clear("#0d0d0d");

	var p1 = { x: x + radius * Math.sin(Math.PI * 2 / 3 + angle),
						 y: y + radius * Math.cos(Math.PI * 2 / 3 + angle) };
	var p2 = { x: x + radius * Math.sin(Math.PI * 2 / 3 * 2 + angle),
						 y: y + radius * Math.cos(Math.PI * 2 / 3 * 2 + angle) };
	var p3 = { x: x + radius * Math.sin(Math.PI * 2 / 3 * 3 + angle),
						 y: y + radius * Math.cos(Math.PI * 2 / 3 * 3 + angle) };

	this.flakeEdge(p1, p2, deepness);
	this.flakeEdge(p2, p3, deepness);
	this.flakeEdge(p3, p1, deepness);
}

CanvasRenderingContext2D.prototype.drawModel = function(model, x, y, angle)
{
  this.save();
  this.translate(x, y);
  if (angle !== undefined)
    this.rotate(angle);
  var i, j;
  for (j = 0; j < model.length; j ++) {
    this.beginPath();
    this.moveTo(model[j][1][0], model[j][1][1]);
    for (i = 2; i < model[j].length; i ++)
      this.lineTo(model[j][i][0], model[j][i][1]);
    this.fillStyle = model[j][0];
    this.fill();
    this.closePath();
  }
  this.restore();
}

CanvasRenderingContext2D.prototype.clear = function(color)
{
  this.save();

  this.setTransform(1, 0, 0, 1, 0, 0);

  if (color === undefined)
    this.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  else {
    this.fillStyle = color;
    this.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
  }

  this.restore();
}

CanvasRenderingContext2D.prototype.setVortex = function(x, y)
{
  this.setTransform(1, 0, 0, 1, 0, 0);
  this.translate(x * this.canvas.clientWidth, y * this.canvas.clientHeight);
}

CanvasRenderingContext2D.prototype.get3DPoint = function(x, y, z, angleX, angleY)
{
  var x0, y0, z0;

  x0 = Math.sqrt( x*x + z*z ) * Math.sin( Math.atan2( x, z ) + angleX );
  y0 = Math.sqrt( x0*x0 + y*y ) * Math.cos( Math.atan2( x0, y ) + angleY );
  x0 = Math.sqrt( x0*x0 + y*y ) * Math.sin( Math.atan2( x0, y ) + angleY );
  
  z0 = Math.sqrt( x*x + z*z ) * Math.cos( Math.atan2( x, z ) + angleX );

  var X, Y;
  X = ( Math.atan2( z0, x0 ) ) / Math.PI * 3000;
  Y = ( Math.atan2( y0, x0 ) ) / Math.PI * 3000;
  
  return {x:X, y:Y};
}

CanvasRenderingContext2D.prototype.line3D = function(x1, y1, z1, x2, y2, z2, angleX, angleY, p1, p2)
{
  if (p1 == undefined)  
    p1 = this.get3DPoint(x1, y1, z1, angleX, angleY);
  if (p2 == undefined)  
    p2 = this.get3DPoint(x2, y2, z2, angleX, angleY);

  if (Math.abs(p1.x - p2.x) > 4 || Math.abs(p1.y - p2.y) > 4) {
    var xm = (x1 + x2) / 2;
    var ym = (y1 + y2) / 2;
    var zm = (z1 + z2) / 2;

    var pm = this.get3DPoint(xm, ym, zm, angleX, angleY)

    this.line3D(x1, y1, z1, xm, ym, zm, angleX, angleY, p1, pm);
    this.line3D(xm, ym, zm, x2, y2, z2, angleX, angleY, pm, p2);
  } else {
    this.lineTo(p2.x, p2.y);
  }
}

CanvasRenderingContext2D.prototype.draw3DModel = function(model, x, y, z, angleX, angleY)
{
  if ( angleX == undefined )
    angleX = 0;
  if ( angleY == undefined )
    angleY = 0;

  this.save();

  for (var j = 0; j < model.length; j ++) {
    this.beginPath();

    var p = this.get3DPoint(model[j][1][0] - x, model[j][1][1] - y, model[j][1][2] - z, angleX, angleY);
    this.moveTo(p.x, p.y);

    for (var i = 2; i < model[j].length; i ++) {
      this.line3D(model[j][i - 1][0] - x, model[j][i - 1][1] - y, model[j][i - 1][2] - z, model[j][i][0] - x, model[j][i][1] - y, model[j][i][2] - z, angleX, angleY);
    }

    this.strokeStyle = model[j][0];
    this.stroke();

    this.closePath();
  }
  this.restore();
}

CanvasRenderingContext2D.prototype.drawLoadingBar = function(x, y, sx, sy, status, color, border)
{
  this.save();
  this.setTransform(1, 0, 0, 1, 0, 0);
  if (color === undefined)
    color = "#FFF";
  if (border === undefined)
    border = 4;
  
  this.beginPath();
  this.rect(x + border / 2, y + border / 2, sx - border, sy - border);
  this.lineWidth = border;
  this.strokeStyle = color;
  this.stroke();
  
  this.fillStyle = color;
  this.fillRect(x + border * 1.5, y + border * 1.5, (sx - border * 3) * status, (sy - border * 3));
  
  this.restore();
}

CanvasRenderingContext2D.prototype.drawGrid = function(rx, ry, d, w, color)
{
  rx = Math.floor(rx);
  ry = Math.floor(ry);
  d = Math.floor(d);
  w = Math.floor(w);
  
  this.save();
  this.setTransform(1, 0, 0, 1, 0, 0);

  var width = this.canvas.clientWidth;
  var height = this.canvas.clientHeight;

  rx %= d;
  ry %= d;

  this.beginPath();

  for (var x = rx; x <= width; x += d) {
    this.moveTo(x, 0);
    this.lineTo(x, height);
  }

  for (var y = ry; y <= height; y += d) {
    this.moveTo(0, y);
    this.lineTo(width, y);
  }

  this.strokeStyle = color;
  this.strokeWidth = w;
  this.stroke();

  this.restore();
}
