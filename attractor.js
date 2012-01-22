/**
 * Attractors in Javascript using an HTML5 Canvas.
 * Based on equations and ideas from, or simply inspired by, the following:
 * 
 * Paul Bourke's random attractors gallery:
 * http://paulbourke.net/fractals/lyapunov/
 * 
 * Jared Tarbell's renderings using Processing.js:
 * http://complexification.net/gallery/machines/peterdejong/
 * 
 * Peter de Jong's nonlinear system:
 * x(n+1) = sin(ay(n)) - cos(bx(n)),
 * y(n+1) = sin(cx(n)) - cos(dy(n)),
 * where {a,b,c,d} in R.
 * 
 */

function setPixel(imageData, x, y, r, g, b, a) {
	var i = (y * imageData.width * 4) + (x * 4);
	imageData.data[i + 0] = r;
	imageData.data[i + 1] = g;
	imageData.data[i + 2] = b;
	imageData.data[i + 3] = a;
}

function Attractor(canvas, params) {
	this.canvas = canvas;
	this.params = params;
	this.context = this.canvas[0].getContext("2d");
	this.imageData = this.context.getImageData(0, 0, this.canvas.width(), this.canvas.height());
	this.centreX = 0;
	this.centreY = 0;
	this.iterations = 10000;
	this.zoom = Math.min(this.imageData.width, this.imageData.height) / 4;
}

(function($) {
	$.extend(Attractor.prototype, {
		// Some interesting values given by Jared on his site
		parameterSets: [
			{ a: -1.97378990, b: -0.29585147, c: -2.3156738, d:  0.040812516 },
			{ a: -0.89567065, b:  1.59095860, c:  1.8515863, d:  2.197430600 },
			{ a:  2.03372000, b: -0.78980076, c: -0.5964787, d: -1.758290150 },
			{ a: -2.09892100, b: -0.30945826, c:  1.4205422, d:  0.232973580 },
			{ a: -1.21448970, b: -0.59580576, c: -2.2561285, d:  0.960403900 },
			{ a:  1.41914030, b: -2.28415230, c:  2.4275403, d: -2.177196000 }
		],
		stop: function() {
			clearTimeout(this.updateTimeout);
			this.updateTimeout = null;
		},
		getCentre: function() {
			return [ this.centreX, this.centreY ];
		},
		setCentre: function(rl, im) {
			this.centreX = rl;
			this.centreY = im;
		},
		getZoom: function() {
			return this.zoom;
		},
		setZoom: function(newZoom) {
			this.zoom = newZoom;
			return this.zoom;
		},
		zoomBy: function(factor) {
			this.zoom *= factor;
			return this.zoom;
		},
		zoomOutBy: function(factor) {
			return this.zoomBy(1 / factor);
		},
		getIterations: function() {
			return this.iterations;
		},
		setIterations: function(newIterations) {
			this.iterations = newIterations;
		},
		toParamSetName: function(params) {
			return JSON.stringify(params);
		},
		fromParamSetName: function(params) {
			return JSON.parse(params);
		},
		getParameterSet: function() {
			return this.toParamSetName(this.params);
		},
		setParameterSet: function(newParamsName) {
			this.params = this.fromParamSetName(newParamsName);
			return this.params;
		},
		// Iterate the de Jong map.
		iterateDeJong: function(x, y, a, b, c, d) {
			return {
				x: Math.sin(a * y) - Math.cos(b * x),
				y: Math.sin(c * x) - Math.cos(d * y)
			};
		},
		colToX: function(c) {
			return (c - this.imageData.width  / 2) /  this.zoom + this.centreX;
		},
		rowToY: function(r) {
			// Inversion due to the canvas' inverted-Y co-ordinate system.
			return (r - this.imageData.height / 2) / -this.zoom + this.centreY;
		},
		xToCol: function(x) {
			return Math.round((x - this.centreX) *  this.zoom + this.imageData.width  / 2);
		},
		yToRow: function(y) {
			return Math.round((y - this.centreY) * -this.zoom + this.imageData.height / 2);
		},
		update: function() {
			this.stop();
			function updateFunc(myUpdateTimeout) {
				this.context.clearRect(0, 0, this.canvas.width(), this.canvas.height());
				this.imageData = this.context.getImageData(0, 0, this.canvas.width(), this.canvas.height());
				var x = 1, y = 1, i, xmax = Math.pow(2, 32), xmin = -xmax, ymax = xmax, ymin = xmin, eta = Math.pow(10, -5),
					left = this.colToX(0),
					right = this.colToX(this.canvas.width()),
					// These two are again inverted because of the Canvas' inverted Y co-ordinates
					top = this.rowToY(this.canvas.height()),
					bottom = this.rowToY(0);
				for (i = 0; i < this.iterations; i++) {
					if (this.updateTimeout != myUpdateTimeout) {
						return; // Abort - no longer the current render thread
					}
					if (x >= left && x < right && y >= top && y < bottom) {
						var r = this.yToRow(y), c = this.xToCol(x);
						setPixel(this.imageData, c, r, 0, 0, 0, 255);
					}
					// Detect infinite attractors
					if (x < xmin || x > xmax || y < ymin || y > ymax) {
						debug('Infinite attractor');
						break;
					}
					var next = this.iterateDeJong(x, y, this.params.a, this.params.b, this.params.c, this.params.d);
					var dx = Math.abs(x - next.x), dy = Math.abs(y - next.y);
					// Detect point attractors
					if (dx < eta && dy < eta) {
						debug('Point attractor');
						break;
					}
					x = next.x, y = next.y;
				}
				this.context.putImageData(this.imageData, 0, 0);
			}
			var that = this;
			this.updateTimeout = setTimeout(function() {
				updateFunc.call(that, that.updateTimeout);
			});
		}
	});
	Attractor.prototype.zoomInBy = Attractor.prototype.zoomBy;
})(jQuery);

$(function() {
	var canvas = $('#canvas');
	var displayMouseX = $('#mousex');
	var displayMouseY = $('#mousey');
	var displayCentreX = $('#centrex');
	var displayCentreY = $('#centrey');
	var displayZoom = $('#zoom');
	var displayIterations = $('#iterations');
	var displayParameterSet = $('#parameterset');
	var attractor = new Attractor(canvas, Attractor.prototype.parameterSets[1]);
	$(Attractor.prototype.parameterSets).each(function(i, parameterSet) {
		var option = $(document.createElement('option'));
		option.text(Attractor.prototype.toParamSetName(parameterSet));
		displayParameterSet.append(option);
	});
	function updateControls() {
		displayCentreX.val(attractor.getCentre()[0]);
		displayCentreY.val(attractor.getCentre()[1]);
		displayZoom.val(attractor.getZoom());
		displayIterations.val(attractor.getIterations());
		displayParameterSet.val(attractor.getParameterSet());
	}
	function update() {
		updateControls();
		attractor.update();
	}
	canvas.on('mousemove', function(event) {
		displayMouseX.val(attractor.colToX(event.pageX - canvas.position().left));
		displayMouseY.val(attractor.rowToY(event.pageY - canvas.position().top));
	}).on('click', function(event) {
		attractor.setCentre(attractor.colToX(event.pageX - canvas.position().left), attractor.rowToY(event.pageY - canvas.position().top));
		attractor.zoomInBy(2);
		update();
	});
	displayCentreX.on('change', function() {
		attractor.setCentre(parseFloat($(this).val()), attractor.getCentre()[1]);
		update();
	});
	displayCentreY.on('change', function() {
		attractor.setCentre(attractor.getCentre()[0], parseFloat($(this).val()));
		update();
	});
	displayZoom.on('change', function() {
		attractor.setZoom(parseFloat($(this).val()));
		update();
	});
	displayIterations.on('change', function() {
		attractor.setIterations(parseInt($(this).val(), 10));
		update();
	});
	displayParameterSet.change(function() {
		attractor.setParameterSet($(this).val());
		update();
	});
	$('#zoomin').on('click', function() {
		attractor.zoomInBy(2);
		update();
	});
	$('#zoomout').on('click', function() {
		attractor.zoomOutBy(2);
		update();
	});
	update();
});
