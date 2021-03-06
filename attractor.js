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

if (typeof(AttractorCanvas) === "undefined") {
	AttractorCanvas = {};
}

/**
 * An HTML5 Canvas that displays a strange attractor.
 * @param canvas jQuery wrapper around the HTML5 Canvas to draw into.
 * @returns {AttractorCanvas.Attractor} The new instance
 */
AttractorCanvas.Attractor = function(canvas) {
	this.$canvas = canvas;
	this.canvas = canvas[0];
	this.context = this.canvas.getContext("2d");
	this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
	this.centreX = 0;
	this.centreY = 0;
	this.iterations = 50000;
	this.zoom = Math.min(this.imageData.width, this.imageData.height) / 4;
	this.currentSystem = 0;
	this.currentParameterSet = 0;
	this.colourModeIndex = 0;
	// Append a custom parameter set to each system, initially identical to the last existing one
	$(this.systems).each(function(i, system) {
		var clone = $.extend(true, {}, system.parameterSets[system.parameterSets.length - 1]);
		system.parameterSets.push(clone);
	});
};
$.extend(AttractorCanvas.Attractor.prototype, {
	/**
	 * Methods of colouring the points.
	 */
	colourModes: [
		{
			name: 'Prev X co-ord',
			getColour: function(i, r, c, previousX) {
				return hsv2rgb(previousX, 1, 1);
			}
		},
		{
			name: 'Black',
			getColour: function(i, r, c, previousX) {
				return [ 0, 0, 0 ];
			}
		},
		/**
		 * This one is included mostly to show that it doesn't work well!
		 * There is no simple relationship between iteration count
		 * and location of point for a chaotic attractor.
		 */
		{
			name: 'Alternating',
			getColour: function(i, r, c, previousX) {
				return (i % 2) ? [ 255, 0, 0 ] : [ 0, 0, 255 ];
			}
		}
	],
	systems: [
		/**
		 * Attractor due to Peter de Jong.
		 * Non-linear Cartesian mapping, Lyapunov exponent > 0 (chaotic).
		 */
		{
			name: 'Peter de Jong',
			initialValues: { x: 1, y: 1 },
			initialZoom: 100,
			iterate: function(x, y, params) {
				return {
					x: Math.sin(params.a * y) - Math.cos(params.b * x),
					y: Math.sin(params.c * x) - Math.cos(params.d * y)
				};
			},
			parameterSets: [
				// Some interesting values given by Jared Tarbell on his site
				{ a: -0.89567065, b:  1.59095860, c:  1.8515863, d:  2.197430600 },
				{ a: -1.97378990, b: -0.29585147, c: -2.3156738, d:  0.040812516 },
				{ a:  2.03372000, b: -0.78980076, c: -0.5964787, d: -1.758290150 },
				{ a: -2.09892100, b: -0.30945826, c:  1.4205422, d:  0.232973580 },
				{ a: -1.21448970, b: -0.59580576, c: -2.2561285, d:  0.960403900 },
				{ a:  1.41914030, b: -2.28415230, c:  2.4275403, d: -2.177196000 },
				// Futher parameters found at:
				// http://www.a-matters.info/Geometry/Complex-System/peter-de-jong-attractor.html
				{ a: -0.5206013, b: -2.083939, c: 0.7189889, d: -2.40354 },
				{ a: -2.830518, b: 1.967394, c: 1.700244, d: 1.746933 }
			]
		},
		{
			name: 'Duffing',
			initialValues: { x: 1, y: 1 },
			initialZoom: 100,
			iterate: function(x, y, params) {
				return {
					x: y,
					y: -params.b * x + params.a * y - (y * y * y)
				};
			},
			parameterSets: [
				{ a: 2.75, b: 0.2 }
			]
		},
		{
			name: 'Hénon',
			initialValues: { x: 0, y: 0 },
			initialZoom: 30,
			iterate: function(x, y, params) {
				return {
					x: 1 - params.a * x * x + y,
					y: params.b * x
				};
			},
			parameterSets: [
				{ a: 0.2, b: 0.9991 },
				{ a: 1.4, b: 0.3 },
				{ a: 0.2, b: 1.01 },
				{ a: 0.2, b: -0.99999 }
			]
		},
		{
			name: 'Gingerbread man',
			initialValues: { x: -0.1, y: 0 },
			initialZoom: 30,
			iterate: function(x, y, params) {
				return {
					x: 1 - y + Math.abs(x),
					y: x
				};
			},
			parameterSets: [
				{},
			]
		},
		{
			name: 'Tinkerbell map',
			initialValues: { x: -0.72, y: -0.64 },
			initialZoom: 120,
			iterate: function(x, y, params) {
				return {
					x: x * x - y * y + params.a * x + params.b * y,
					y: 2 * x * y + params.c * x + params.d * y
				};
			},
			parameterSets: [
				{ a: 0.9, b: -0.6013, c: 2, d: 0.50 }
				/**
				 * FIXME: Boring parameters.
				 * This Wikipedia entry:
				 * http://en.wikipedia.org/wiki/Tinkerbell_map
				 * lists the following parameters, but they just generate
				 * an infinite attractor, so are pretty boring.
				 */
				// { a: 0.3, b:  0.6000, c: 2, d: 0.27 }
			]
		},
		/**
		 * For a detailed discussion of dynamic structure see:
		 * http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.54.9701&rep=rep1&type=pdf
		 * For some numerical investigations of attractors see:
		 * http://faculty.uaeu.ac.ae/hakca/papers/djellit-i.pdf
		 */
		{
			name: 'Bogdanov map',
			initialValues: { x: 0.1, y: 0.1 },
			initialZoom: 100,
			iterate: function(x, y, params) {
				var nexty = (1 + params.eta) * y + params.h * x * (x - 1) + params.mu * x * y;
				return {
					x: x + nexty,
					y: nexty
				};
			},
			parameterSets: [
				{ eta: 0.15, mu: -1.7, h: 0.3 },
				{ eta: 0, mu: 2, h: 1.44 },
				{ eta: 0.001, mu: -0.1, h: 1.44 }
			]
		},
		/**
		 * x' = a1 + a2 x + a3 x^2 +  a4 xy +  a5 y +  a6 y^2
		 * y' = a7 + a8 x + a9 x^2 + a10 xy + a11 y + a12 y^2
		 */
		{
			name: 'Quadratic map',
			initialValues: { x: 0.1, y: 0.1 },
			initialZoom: 100,
			iterate: function(x, y, params) {
				return {
					x: params.a1 + params.a2 * x + params.a3 * x * x + params.a4 * x * y + params.a5 * y + params.a6 * y * y,
					y: params.a7 + params.a8 * x + params.a9 * x * x + params.a10 * x * y + params.a11 * y + params.a12 * y * y
				};
			},
			parameterSets: [
				// Following parameters from Wolfram Mathworld:
				// http://mathworld.wolfram.com/StrangeAttractor.html
				{ a1: -1.2, a2: 0, a3: 0.7, a4: 0, a5: 0.1, a6: 0.4, a7: 0.4, a8: 1.1, a9: 0.8, a10: 1.2, a11: -0.6, a12: -1.2 },
				{ a1: -1, a2: 0.9, a3: 0.4, a4: -0.2, a5: -0.6, a6: -0.5, a7: 0.4, a8: 0.7, a9: 0.3, a10: -0.5, a11: 0.7, a12: -0.8 },
				{ a1: -0.7, a2: -0.4, a3: 0.5, a4: -1, a5: -0.9, a6: -0.8, a7: 0.5, a8: 0.5, a9: 0.3, a10: 0.9, a11: -0.1, a12: -0.9 },
				{ a1: -0.6, a2: -0.4, a3: -0.4, a4: -0.8, a5: 0.7, a6: 0.3, a7: -0.4, a8: 0.4, a9: 0.5, a10: 0.5, a11: 0.8, a12: -0.1 },
				{ a1: -0.6, a2: -0.1, a3: 1.1, a4: 0.2, a5: -0.8, a6: 0.6, a7: -0.7, a8: 0.7, a9: 0.7, a10: 0.3, a11: 0.6, a12: 0.9 },
				{ a1: -0.6, a2: 1.1, a3: 0.4, a4: 0.6, a5: 0.1, a6: 0.6, a7: -0.2, a8: -0.8, a9: -0.8, a10: -1, a11: 0.7, a12: 1.1 },
				{ a1: -0.5, a2: -0.6, a3: 0.8, a4: -0.5, a5: -0.9, a6: 0.3, a7: -0.5, a8: 0.1, a9: 0.6, a10: -0.6, a11: 0.2, a12: -0.5 },
				{ a1: -0.4, a2: -0.1, a3: -0.4, a4: -1.1, a5: 0.9, a6: 0.3, a7: -0.2, a8: -0.3, a9: 1, a10: -0.6, a11: 0.5, a12: 0.5 },
				{ a1: -0.1, a2: 0.8, a3: -0.7, a4: -1.1, a5: -1.1, a6: -0.7, a7: -0.4, a8: 0.6, a9: -0.6, a10: -0.3, a11: 1.2, a12: 0.6 },
				{ a1: 0, a2: -1, a3: 0.5, a4: -1.1, a5: -0.4, a6: 0.3, a7: 0.2, a8: 0.3, a9: -0.5, a10: 0.7, a11: -1.1, a12: 0.1 },
				{ a1: 0, a2: -0.9, a3: 0.9, a4: -1.2, a5: -0.4, a6: -0.9, a7: 0.2, a8: 1.2, a9: -0.5, a10: 1.2, a11: -0.8, a12: -1.2 },
				{ a1: 0.2, a2: -0.9, a3: -0.6, a4: 0.4, a5: -1, a6: 0.1, a7: 1.1, a8: 0.2, a9: -0.9, a10: 0.1, a11: 1.2, a12: -1.2 },
				{ a1: 0.4, a2: -0.7, a3: -0.7, a4: 0.9, a5: 0.6, a6: -0.1, a7: 0, a8: -0.3, a9: -0.3, a10: -0.6, a11: -1, a12: 0.5 },
				{ a1: 0.8, a2: 1, a3: -1.2, a4: -1, a5: 1.1, a6: -0.9, a7: 0.4, a8: -0.4, a9: -0.6, a10: -0.2, a11: -0.5, a12: -0.7 },
				{ a1: 0.9, a2: -1.1, a3: 1, a4: 0.1, a5: -1.1, a6: -0.9, a7: -0.8, a8: -0.1, a9: 1.2, a10: -0.5, a11: 0.8, a12: -0.1 },
				{ a1: 1, a2: 0.1, a3: -1, a4: 0.6, a5: -0.1, a6: -0.7, a7: -0.1, a8: -0.6, a9: -0.4, a10: -0.5, a11: -0.6, a12: -0.1 }
			]
		},
		{
			name: 'Custom',
			initialValues: { x: 0, y: 0 },
			initialZoom: 30,
			iterate: function(x, y, params) {
				return {
					x: y,
					y: x
				};
			},
			parameterSets: [
				// TODO: Custom parameter set
				{},
			]
		}
	],
	stop: function() {
		this.running = false;
		return this;
	},
	getCentre: function() {
		return [ this.centreX, this.centreY ];
	},
	setCentre: function(rl, im) {
		this.centreX = rl;
		this.centreY = im;
		return this;
	},
	getZoom: function() {
		return this.zoom;
	},
	setZoom: function(newZoom) {
		this.zoom = newZoom;
		return this;
	},
	zoomBy: function(factor) {
		this.zoom *= factor;
		return this;
	},
	zoomOutBy: function(factor) {
		this.zoomBy(1 / factor);
		return this;
	},
	getIterations: function() {
		return this.iterations;
	},
	setIterations: function(newIterations) {
		this.iterations = newIterations;
		return this;
	},
	getSystemIndex: function() {
		return this.currentSystem;
	},
	setSystemIndex: function(newSystemIdx) {
		this.currentSystem = newSystemIdx;
		this.zoom = this.systems[this.currentSystem].initialZoom;
		return this;
	},
	getParameterSetIndex: function() {
		return this.currentParameterSet;
	},
	setParameterSetIndex: function(newParamSetIdx) {
		this.currentParameterSet = newParamSetIdx;
		return this;
	},
	getSystem: function() {
		return this.systems[this.currentSystem];
	},
	getParameterSet: function() {
		return this.systems[this.currentSystem].parameterSets[this.currentParameterSet];
	},
	getIterationFunction: function() {
		return this.systems[this.currentSystem].iterate;
	},
	/**
	 * Select the Custom system, select the first of its parameter sets,
	 * and set the system's iteration function to the function given.
	 * @param func The iteration function to be used.
	 */
	setCustomIterationFunction: function(func) {
		// Custom iteration function is always the last entry
		this.systems[this.systems.length - 1].iterate = func;
	},
	setCustomParameterSet: function(parameterSet) {
		// Custom parameter set is always the last entry
		var system = this.systems[this.currentSystem];
		system.parameterSets[system.parameterSets.length - 1] = parameterSet;
	},
	colToX: function(c) {
		return (c + 0.5 - this.imageData.width  / 2) /  this.zoom + this.centreX;
	},
	rowToY: function(r) {
		// Inversion due to the canvas' inverted-Y co-ordinate system.
		return (r - 0.5 - this.imageData.height / 2) / -this.zoom + this.centreY;
	},
	xToCol: function(x) {
		return Math.round((x - this.centreX) *  this.zoom + this.imageData.width  / 2);
	},
	yToRow: function(y) {
		return Math.round((y - this.centreY) * -this.zoom + this.imageData.height / 2);
	},
	getColourFunc: function() {
		return this.colourModes[this.colourModeIndex].getColour;
	},
	getColourModeIndex: function() {
		return this.colourModeIndex;
	},
	setColourModeIndex: function(newColourModeIndex) {
		this.colourModeIndex = newColourModeIndex;
		return this;
	},
	// TODO: Use web worker if available, fall back to below approach if not
	update: function() {
		// NOTE: Eclipse incorrectly warns: "The local variable [foo] is never read"
		var i = 0, that = this,
			minIterations = 50,
			sys = this.getSystem(),
			params = this.getParameterSet(),
			colourFunc = this.getColourFunc(),
			// Initial co-ordinates of main point
			x = sys.initialValues.x, y = sys.initialValues.y,
			// A small value
			eta = Math.pow(10, -12),
			// Partner point, initially close to main point
			xe = x + eta, ye = y + eta,
			// Initial distance between main point and partner point
			d0 = Math.SQRT2 * eta,
			// Number of steps included in calculation of largest Lyapunov exponent
			lyapunovNumIter = 0,
			// If the point exceeds these bounds, it is assumed to escape to infinity
			xmax = Math.pow(2, 32), xmin = -xmax, ymax = xmax, ymin = xmin,
			// Boundaries of drawing area in logical (x,y) co-ordinates
			left = this.colToX(0),
			right = this.colToX(this.canvas.width),
			// These two are again inverted because of the Canvas' inverted Y co-ordinates
			top = this.rowToY(this.canvas.height),
			bottom = this.rowToY(0),
			// Previous X co-ordinate, for colouring
			previousX = 0
		;
		// Running total of Lyapunov exponent
		this.lyapunov = 0;
		this.stop();
		// The following is wrapped in a setImmediate to give the preceding stop() a chance to take effect.
		// If this is not done, multiple updates can run in pseudo-parallel, yielding corrupt drawing.
		// This occurs despite the fact that current Javascript interpreters are single-threaded.
		setImmediate(function() {
			that.running = true;
			that.context.clearRect(0, 0, that.canvas.width, that.canvas.height);
			that.imageData = that.context.getImageData(0, 0, that.canvas.width, that.canvas.height);
			setImmediate(function() {
				that.$canvas.trigger(AttractorCanvas.eventNames.renderStart);
				updateFunc.call(that);
			});
		});
		function updateFunc() {
			var next, nextd, r, rgb, dx, nexte, end = i + Math.min(this.iterations, 1000);
			for (/* NOP */;
				i < end;
				i++, previousX = x, x = next.x, y = next.y
			) {
				if (!this.running) {
					$().toastmessage('showNoticeToast', 'Stopped');
					this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
					return; // Aborted
				}
				// Draw the corresponding pixel if it's visible onscreen
				if (x >= left && x < right && y >= top && y < bottom) {
					r = this.yToRow(y), c = this.xToCol(x);
					if (false) {
						rgb = getPixel(this.imageData, c, r);
						if (rgb[3]) {
							/**
							 * TODO: Detect cycles and halt rendering.
							 * Need somehow to distinguish between (x, y) true cycles and
							 * (row, column) pseudo-cycles.
							 * 
							 * We've aready drawn this pixel in some non-transparent colour.
							 * These attractors do have cycles, but we have not necessarily found one of them now.
							 * It's possible that loss of numeric precision and/or the consequent
							 * cumulative error when iterating have caused two close but distinct points
							 * on the Argand plane to be mapped to the same pixel location on the canvas.
							 */
							this.running = false;
							this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
							return; // Cycle detected
						}
					}
					if (previousX < 0) {
						previousX += that.canvas.width;
					}
					rgb = colourFunc(i, r, c, this.xToCol(previousX) / that.canvas.width);
					setPixel(this.imageData, c, r, rgb[0], rgb[1], rgb[2], 255);
				}
				// Detect infinite attractors
				if (x < xmin || x > xmax || y < ymin || y > ymax) {
					$().toastmessage('showNoticeToast', 'Infinite attractor detected after ' + i + ' iterations');
					this.running = false;
					this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
					return;
				}
				// Iterate the point
				try {
					next = sys.iterate(x, y, params);
				} catch (e) {
					this.running = false;
					this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
					this.$canvas.trigger(AttractorCanvas.eventNames.iterFuncRuntimeError, {x: x, y: y, exception: e});
					return;
				}
				if (isNaN(next.x) || isNaN(next.y)) {
					this.running = false;
					this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
					this.$canvas.trigger(AttractorCanvas.eventNames.iterFuncRuntimeError, {x: x, y: y, exception: null});
					return;
				}
				dx = Math.abs(x - next.x), dy = Math.abs(y - next.y);
				// Detect point attractors
				if (dx < eta && dy < eta && i > minIterations) {
					$().toastmessage('showNoticeToast', 'Point attractor detected after ' + i + ' iterations');
					this.running = false;
					this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
					return;
				}
				// Iterate the partner, originally 'close' point
				nexte = sys.iterate.call(sys, xe, ye, params);
				// Update running approximation of Lyapunov exponent if some way into iteration.
				// Values at start are discarded so as to give time to reach an attractor.
				// FIXME: I doubt that the following calculations are correct.
				// Need to test this software with a known attractor with known Lyapunov exponent.
				if (i > 1000) {
					// Calculate current distance between main point and partner point
					nextdx = next.x - nexte.x;
					nextdy = next.y - nexte.y;
					nextd = Math.sqrt(nextdx * nextdx + nextdy * nextdy);
					if (isNaN(this.lyapunov)) {
						this.running = false;
						this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
						throw "NaN lyapunov exponent 1";
					}
					this.lyapunov += Math.log(nextd / d0);
					if (isNaN(this.lyapunov)) {
						$().toastmessage('showErrorToast', this.lyapunov + ' ' + nextd + ' ' + d0);
						this.running = false;
						this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
						throw "NaN lyapunov exponent 2";
					}
					lyapunovNumIter++;
					// Re-adjust partner point to be closer to main point
					xe = next.x + d0 * nextdx / nextd;
					ye = next.y + d0 * nextdy / nextd;
				}
			}
			if (lyapunovNumIter) {
				// Divide sum by number of counted values to get average,
				// which should be approximately equal to the greatest Lyapunov exponent.
				this.lyapunov /= lyapunovNumIter;
				if (isNaN(this.lyapunov)) {
					this.running = false;
					this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
					throw "NaN lyapunov exponent 3";
				}
			}
			this.context.putImageData(this.imageData, 0, 0);
			if (this.running && i < this.iterations) {
				this.$canvas.trigger(AttractorCanvas.eventNames.renderProgress, i / this.iterations);
				setImmediate(function() {
					updateFunc.call(that);
				});
			} else {
				this.running = false;
				this.$canvas.trigger(AttractorCanvas.eventNames.renderStop);
			}
		}
	},
	getLyapunovExponent: function() {
		return this.lyapunov;
	}
});
AttractorCanvas.Attractor.prototype.zoomInBy = AttractorCanvas.Attractor.prototype.zoomBy;

$.extend(AttractorCanvas, {
	eventNames: {
		renderStart: 'Attractor.renderStart',
		renderStop:  'Attractor.renderStop',
		renderProgress: 'Attractor.renderProgress',
		iterFuncRuntimeError: 'Attractor.iterFuncRuntimeError'
	}
});

(function($) {
	$(function() {
		var $canvas = $('#canvas'),
			canvas = $canvas[0],
			displayLyapunovExponent = $('#lyapunovExponent'),
			displayMouseX = $('#mousex'),
			displayMouseY = $('#mousey'),
			editCentreX = $('#centrex'),
			editCentreY = $('#centrey'),
			editZoomLevel = $('#zoomFactor'),
			editMaxIterations = $('#iterationsMax'),
			selectSystem = $('#system'),
			selectParameterSet = $('#selectParameterSet'),
			parameterSetDetails = $('#parameterSetDetails'),
			selectColourMode = $('#selectColourMode'),
			iterFuncDetails = $('#iterFuncDetails'),
			buttonZoomIn = $('#zoomIn'),
			buttonZoomOut = $('#zoomOut'),
			buttonStop = $('#stop'),
			attractor = new AttractorCanvas.Attractor($canvas),
			resizable = $('#resizable'),
			renderProgress = $('#renderProgress'),
			renderProgressText = $('#renderProgressText'),
			errMsgBadIterFunc = $('#errMsgBadIterFunc'),
			errDetailsIterFunc = $('#errDetailsIterFunc'),
			errMsgBadIterFuncRuntime = $('#errMsgBadIterFuncRuntime'),
			errDetailsIterFuncRuntime = $('#errDetailsIterFuncRuntime'),
			errMsgBadParamSet = $('#errMsgBadParamSet'),
			errDetailsParamSet = $('#errDetailsParamSet'),
			menuZoomIn = $('#menuZoomIn'),
			menuZoomOut = $('#menuZoomOut'),
			errorDialogOpts
		;
		// This forces expression context, and also seems to help the JIT.
		function compileExpr(text) {
			return eval(
				'(' + text + ')'
			);
		}
		// Enable jQuery UI buttons
		$("button").button();
		// Enable jQuery UI spinners (but not on input[type="number"] due to a jQuery UI conflict with native spinners)
		$('textfield.numeric, input.numeric').spinner();
		// Enable jQuery UI menus for selects
		$('select').menu();
		function populateSystems() {
			$(AttractorCanvas.Attractor.prototype.systems).each(function(i, system) {
				var option = $(document.createElement('option'));
				option.text(system.name);
				option.val(i);
				selectSystem.append(option);
			});
		}
		function populateParameterSets(systemIndex) {
			selectParameterSet.empty();
			$(AttractorCanvas.Attractor.prototype.systems[systemIndex].parameterSets).each(function(i, parameterSet) {
				var option = $(document.createElement('option'));
				option.text(JSON.stringify(parameterSet, null, ' '));
				option.val(i);
				selectParameterSet.append(option);
			});
			// The last entry is the editable custom one; label it so.
			selectParameterSet.find('option:last-child').text('Custom');
		}
		function populateColourModes() {
			$(AttractorCanvas.Attractor.prototype.colourModes).each(function(i, colourMode) {
				var option = $(document.createElement('option'));
				option.text(colourMode.name);
				option.val(i);
				selectColourMode.append(option);
			});
		}
		function updateControls() {
			editCentreX.val(attractor.getCentre()[0]);
			editCentreY.val(attractor.getCentre()[1]);
			editZoomLevel.val(attractor.getZoom());
			editMaxIterations.val(attractor.getIterations());
			selectSystem.val(attractor.getSystemIndex());
			selectParameterSet.val(attractor.getParameterSetIndex());
			parameterSetDetails.val(JSON.stringify(attractor.getParameterSet(), null, ' '));
			selectColourMode.val(attractor.getColourModeIndex());
			iterFuncDetails.val(attractor.getIterationFunction().toString());
		}
		function update() {
			updateControls();
			attractor.update();
			displayLyapunovExponent.text(attractor.getLyapunovExponent());
		}
		$canvas.on('mousemove', function(event) {
			displayMouseX.text(attractor.colToX(event.pageX - $canvas.offset().left));
			displayMouseY.text(attractor.rowToY(event.pageY - $canvas.offset().top));
		}).on('click', function(event) {
			attractor.setCentre(attractor.colToX(event.pageX - $canvas.offset().left), attractor.rowToY(event.pageY - $canvas.offset().top));
			attractor.zoomInBy(2);
			update();
		});
		editCentreX.on('spinchange', function() {
			attractor.setCentre(parseFloat($(this).val()), attractor.getCentre()[1]);
			update();
		});
		editCentreY.on('spinchange', function() {
			attractor.setCentre(attractor.getCentre()[0], parseFloat($(this).val()));
			update();
		});
		editZoomLevel.on('spinchange', function() {
			attractor.setZoom(parseFloat($(this).val()));
			update();
		});
		editMaxIterations.on('spinchange', function() {
			attractor.setIterations(parseInt($(this).val(), 10));
			update();
		});
		selectSystem.on('change', function() {
			var systemIndex = +$(this).val();
			if (systemIndex === $(this).children().length - 1) {
				// Custom system is always last entry
				iterFuncDetails.removeAttr('readonly');
			} else {
				iterFuncDetails.attr('readonly', 'readonly');
			}
			attractor.setSystemIndex(systemIndex);
			populateParameterSets(systemIndex);
			// Select the first of the new system's parameter sets
			attractor.setParameterSetIndex(0);
			update();
		});
		selectParameterSet.on('change', function() {
			var parameterSetIndex = +$(this).val();
			if (parameterSetIndex === $(this).children().length - 1) {
				// Custom parameter set is always last entry
				parameterSetDetails.removeAttr('readonly');
			} else {
				parameterSetDetails.attr('readonly', 'readonly');
			}
			attractor.setParameterSetIndex(parameterSetIndex);
			update();
		});
		errorDialogOpts = {
			modal: true,
			minWidth: 200,
			buttons: [
				{
					text: "Dismiss",
					click: function() {
						$(this).dialog("close");
					}
				}
			]
		};
		iterFuncDetails.on('change', function() {
			var func;
			try {
				func = compileExpr($(this).val());
				attractor.setCustomIterationFunction(func);
				update();
			} catch (e) {
				errDetailsIterFunc.text('' + e);
				errMsgBadIterFunc.dialog(errorDialogOpts);
			}
		});
		parameterSetDetails.on('change', function() {
			var val;
			try {
				val = compileExpr($(this).val());
				attractor.setCustomParameterSet(val);
				update();
			} catch (e) {
				errDetailsParamSet.text('' + e);
				errMsgBadParamSet.dialog(errorDialogOpts);
			}
		});
		selectColourMode.on('change', function() {
			attractor.setColourModeIndex($(this).val());
			update();
		});
		buttonZoomIn.add(menuZoomIn).on('click', function() {
			attractor.zoomInBy(2);
			update();
		});
		buttonZoomOut.add(menuZoomOut).on('click', function() {
			attractor.zoomOutBy(2);
			update();
		});
		buttonStop.on('click', function() {
			attractor.stop();
		});
		resizable.resizable({ handles: "all", animate: false, ghost: true, autohide: false });
		renderProgress.progressbar({value: 0, max: 100});
		resizable.on('resizestop', function(event, ui) {
			$canvas.css({ width: '100%', height: '100%' });
			canvas.width = $canvas.width();
			canvas.height = $canvas.height();
			update();
		});
		$canvas.on(AttractorCanvas.eventNames.renderStart, function(event) {
			buttonStop.button('option', 'disabled', false);
			$canvas.trigger(AttractorCanvas.eventNames.renderProgress, 0);
			renderProgress.progressbar('enable');
		}).on(AttractorCanvas.eventNames.renderStop, function(event) {
			buttonStop.button('option', 'disabled', true);
			$canvas.trigger(AttractorCanvas.eventNames.renderProgress, 1);
			renderProgress.progressbar('disable');
		}).on(AttractorCanvas.eventNames.renderProgress, function(event, proportionDone) {
			renderProgress.progressbar('option', 'value', proportionDone * 100);
			renderProgressText.text((1 === proportionDone) ? 'Finished' : (Math.floor(proportionDone * 100) + '% complete'));
		}).on(AttractorCanvas.eventNames.iterFuncRuntimeError, function(event, data) {
			var msg = 'x: ' + data.x + ', y: ' + data.y;
			if (data.exception !== null) {
				msg = msg + ', error: ' + data.exception;
			}
			errDetailsIterFuncRuntime.text(msg);
			errMsgBadIterFuncRuntime.dialog(errorDialogOpts);
		});
		populateSystems();
		populateParameterSets(0);
		populateColourModes();
		update();
	});
})(jQuery);
