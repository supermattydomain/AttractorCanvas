function compileExpr(text) {
	return eval(
		'(' + text + ')'
	);
}

(function($) {
	$(function() {
		var $canvas = $('#canvas');
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
			renderProgress = $('#renderProgress');
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
				option.text(JSON.stringify(parameterSet));
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
			parameterSetDetails.val(JSON.stringify(attractor.getParameterSet(), null, ''));
			selectColourMode.val(attractor.getColourModeIndex());
			iterFuncDetails.val(attractor.getIterationFunction().toString());
		}
		function update() {
			updateControls();
			attractor.update();
			displayLyapunovExponent.text(attractor.getLyapunovExponent());
		}
		$canvas.on('mousemove', function(event) {
			displayMouseX.text(attractor.colToX(event.pageX - $canvas.position().left));
			displayMouseY.text(attractor.rowToY(event.pageY - $canvas.position().top));
		}).on('click', function(event) {
			attractor.setCentre(attractor.colToX(event.pageX - $canvas.position().left), attractor.rowToY(event.pageY - $canvas.position().top));
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
				func = compileExpr(code);
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
		// resizable.resizable({ handles: "all", animate: false, ghost: true, autohide: false });
		renderProgress.progressbar({value: 0, max: 100});
		resizable.on('resizestop', function(event, ui) {
			$canvas.css({ width: '100%', height: '100%' });
			canvas.width = $canvas.width();
			canvas.height = $canvas.height();
			update();
		});
		$canvas.on(AttractorCanvas.eventNames.renderStart, function(event) {
			renderProgress.progressbar('option', 'value', 0);
			buttonStop.removeAttr('disabled');
		}).on(AttractorCanvas.eventNames.renderStop, function(event) {
			renderProgress.progressbar('option', 'value', 100);
			buttonStop.attr('disabled', 'disabled');
		}).on(AttractorCanvas.eventNames.renderProgress, function(event, proportionDone) {
			renderProgress.progressbar('option', 'value', proportionDone * 100);
		});
		populateSystems();
		populateParameterSets(0);
		populateColourModes();
		update();
	});
})(jQuery);
