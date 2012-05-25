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

function compileFunc(code) {
	return eval(
		'(' + code + ')'
	);
}

function compileExpr(text) {
	return eval(
		'(' + text + ')'
	);
}

(function($) {
	function setPixel(imageData, x, y, r, g, b, a) {
		var i = (y * imageData.width * 4) + (x * 4);
		imageData.data[i + 0] = r;
		imageData.data[i + 1] = g;
		imageData.data[i + 2] = b;
		imageData.data[i + 3] = a;
	}
	function Attractor(canvas) {
		this.canvas = canvas;
		this.context = this.canvas[0].getContext("2d");
		this.imageData = this.context.getImageData(0, 0, this.canvas.width(), this.canvas.height());
		this.centreX = 0;
		this.centreY = 0;
		this.iterations = 100000;
		this.zoom = Math.min(this.imageData.width, this.imageData.height) / 4;
		this.currentSystem = 0;
		this.currentParameterSet = 0;
		this.colourModeIndex = 0;
		// Append a custom parameter set to each system, initially identical to the last existing one
		$(this.systems).each(function(i, system) {
			var clone = jQuery.extend(true, {}, system.parameterSets[system.parameterSets.length - 1]);
			system.parameterSets.push(clone);
		});
	}
	$.extend(Attractor.prototype, {
		/**
		 * Methods of colouring the points.
		 */
		colourModes: [
		              {
		               	  name: 'sine',
		               	  getColour: function(i, r, c) {
		               		  var r = Math.sin(i), g = Math.cos(i), b = -Math.sin(i);
		               		  return [ 127 * (r + 1), 127 * (g + 1), 127 * (b + 1) ];
		               	  }
		              },
		              {
		               	  name: 'alternating',
		               	  getColour: function(i, r, c) {
		               		  return (i % 2) ? [ 255, 0, 0 ] : [ 0, 0, 255 ];
		               	  }
		              },
		              {
		            	  name: 'black',
		            	  getColour: function(i, r, c) {
		            		  return [ 0, 0, 0 ];
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
			/**
			 * x' = a0 + a1 x + a2 x^2 + a3 xy + a4 y^2 + a5 y
			 * y' = a6 + a7 x + a8 x^2 + a9 xy + a10 y^2 + a11 y
			 */
			{
				name: 'Quadratic map',
				initialValues: { x: 1, y: 1 },
				initialZoom: 100,
				iterate: function(x, y, params) {
					return {
						x: params.a0 + params.a1 * x + params.a2 * x * x + params.a3 * x * y + params.a4 * y + params.a5 * y * y,
						y: params.b0 + params.b1 * x + params.b2 * x * x + params.b3 * x * y + params.b4 * y + params.b5 * y * y
					};
				},
				parameterSets: [
				    {
				    	// TODO
				    }
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
					{},
				]
			}
		],
		stop: function() {
			clearTimeout(this.updateTimeout);
			this.updateTimeout = null;
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
		update: function() {
			this.stop();
			function updateFunc(myUpdateTimeout) {
				this.context.clearRect(0, 0, this.canvas.width(), this.canvas.height());
				this.imageData = this.context.getImageData(0, 0, this.canvas.width(), this.canvas.height());
				var i,
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
					// Running total of Lyapunov exponent
					lyapunov = 0,
					// Number of steps included in calculation of largest Lyapunov exponent
					lyapunovNumIter = 0,
					// If the point exceeds these bounds, it is assumed to escape to infinity
					xmax = Math.pow(2, 32), xmin = -xmax, ymax = xmax, ymin = xmin,
					// Boundaries of drawing area in logical (x,y) co-ordinates
					left = this.colToX(0),
					right = this.colToX(this.canvas.width()),
					// These two are again inverted because of the Canvas' inverted Y co-ordinates
					top = this.rowToY(this.canvas.height()),
					bottom = this.rowToY(0);
				if (0 == eta) {
					debug('Eta is 0');
					return;
				}
				for (
					i = 0;
					i < this.iterations;
					i++, x = next.x, y = next.y
				) {
					if (this.updateTimeout != myUpdateTimeout) {
						debug('Stopped');
						break; // No longer the current render thread
					}
					// Draw the corresponding pixel if it's in the imageData
					if (x >= left && x < right && y >= top && y < bottom) {
						var r = this.yToRow(y), c = this.xToCol(x);
						var rgb = colourFunc(i, r, c);
						setPixel(this.imageData, c, r, rgb[0], rgb[1], rgb[2], 255);
					}
					// Detect infinite attractors
					if (x < xmin || x > xmax || y < ymin || y > ymax) {
						debug('Infinite attractor');
						break;
					}
					// Iterate the point
					var next = sys.iterate.call(sys, x, y, params);
					var dx = Math.abs(x - next.x), dy = Math.abs(y - next.y);
					// Detect point attractors
					if (dx < eta && dy < eta) {
						debug('Point attractor');
						break;
					}
					// Iterate the partner, originally 'close' point
					var nexte = sys.iterate.call(sys, xe, ye, params);
					// Update running approximation of Lyapunov exponent if some way into iteration.
					// Values at start are discarded so as to give time to reach an attractor.
					// FIXME: I doubt that the following calculations are correct.
					// Need to test this software with a known attractor with known Lyapunov exponent.
					if (i > 1000) {
						// Calculate current distance between main point and partner point
						nextdx = next.x - nexte.x;
						nextdy = next.y - nexte.y;
						var nextd = Math.sqrt(nextdx * nextdx + nextdy * nextdy);
						if (isNaN(lyapunov)) {
							throw "NaN lyapunov exponent";
						}
						lyapunov += Math.log(nextd / d0);
						if (isNaN(lyapunov)) {
							throw "NaN lyapunov exponent";
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
					lyapunov /= lyapunovNumIter;
					if (isNaN(lyapunov)) {
						throw "NaN lyapunov exponent";
					}
					debug('Lyapunov exponent: ' , lyapunov);
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

	$(function() {
		var canvas = $('#canvas');
		var displayMouseX = $('#mousex');
		var displayMouseY = $('#mousey');
		var editCentreX = $('#centrex');
		var editCentreY = $('#centrey');
		var editZoomLevel = $('#zoomFactor');
		var editMaxIterations = $('#iterationsMax');
		var selectSystem = $('#system');
		var selectParameterSet = $('#selectParameterSet');
		var parameterSetDetails = $('#parameterSetDetails');
		var selectColourMode = $('#selectColourMode');
		var iterFuncDetails = $('#iterFuncDetails');
		var buttonZoomIn = $('#zoomIn');
		var buttonZoomOut = $('#zoomOut');
		var buttonStop = $('#stop');
		var attractor = new Attractor(canvas);
		function populateSystems() {
			$(Attractor.prototype.systems).each(function(i, system) {
				var option = $(document.createElement('option'));
				option.text(system.name);
				option.val(i);
				selectSystem.append(option);
			});
		}
		function populateParameterSets(systemIndex) {
			selectParameterSet.empty();
			$(Attractor.prototype.systems[systemIndex].parameterSets).each(function(i, parameterSet) {
				var option = $(document.createElement('option'));
				option.text(JSON.stringify(parameterSet));
				option.val(i);
				selectParameterSet.append(option);
			});
		}
		function populateColourModes() {
			$(Attractor.prototype.colourModes).each(function(i, colourMode) {
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
			parameterSetDetails.val(JSON.stringify(attractor.getParameterSet(), null, '  '));
			selectColourMode.val(attractor.getColourModeIndex());
			iterFuncDetails.val(attractor.getIterationFunction().toString());
		}
		function update() {
			updateControls();
			attractor.update();
		}
		canvas.on('mousemove', function(event) {
			displayMouseX.text(attractor.colToX(event.pageX - canvas.position().left));
			displayMouseY.text(attractor.rowToY(event.pageY - canvas.position().top));
		}).on('click', function(event) {
			attractor.setCentre(attractor.colToX(event.pageX - canvas.position().left), attractor.rowToY(event.pageY - canvas.position().top));
			attractor.zoomInBy(2);
			update();
		});
		editCentreX.on('change', function() {
			attractor.setCentre(parseFloat($(this).val()), attractor.getCentre()[1]);
			update();
		});
		editCentreY.on('change', function() {
			attractor.setCentre(attractor.getCentre()[0], parseFloat($(this).val()));
			update();
		});
		editZoomLevel.on('change', function() {
			attractor.setZoom(parseFloat($(this).val()));
			update();
		});
		editMaxIterations.on('change', function() {
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
		iterFuncDetails.on('change', function() {
			var code = $(this).val();
			var func;
			try {
				func = compileFunc(code);
			} catch (e) {
				debug('Cannot compile given code: ' + code + ': ' + e);
				return;
			}
			attractor.setCustomIterationFunction(func);
			update();
		});
		parameterSetDetails.on('change', function() {
			var val, text = $(this).val();
			try {
				val = compileExpr(text);
			} catch (e) {
				debug('Cannot evaluate given expression: ' + expr + ': ' + e);
				return;
			}
			attractor.setCustomParameterSet(val);
			update();
		});
		selectColourMode.on('change', function() {
			attractor.setColourModeIndex($(this).val());
			update();
		});
		buttonZoomIn.on('click', function() {
			attractor.zoomInBy(2);
			update();
		});
		buttonZoomOut.on('click', function() {
			attractor.zoomOutBy(2);
			update();
		});
		buttonStop.on('click', function() {
			attractor.stop();
		});
		populateSystems();
		populateParameterSets(0);
		populateColourModes();
		update();
	});
})(jQuery);
