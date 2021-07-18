var userInput = {
	areaId: 'all',
	areaTitle: 'Bezirk Pankow',
};

var layers = {
    areas: [],
    lines: []
}

function initLayers() {
    var map = ddj.map.get();
    map.eachLayer(function(layer) {
        var lineTypes = ['bus', 'tram', 'ubahn', 'sbahn', 'regio'];
        if (layer && layer.feature && layer.feature.properties && layer.feature.properties.bezeich && (layer.feature.properties.bezeich === 'AX_KommunalesGebiet')) {
            layers.areas.push(layer);
        } else if (layer && layer.feature && layer.feature.properties && layer.feature.properties.type && (-1 !== lineTypes.indexOf(layer.feature.properties.type.trim()))) {
            layers.lines.push(layer);
        }
    });
}

function dataUpdated() {
	'use strict';

	if (ddj.data.get() === null) {
		return;
	}

    var map = ddj.map.get();
    var layerPrefix = '1100000303';
    var layerSelected = null;

    for (var l = 0; l < layers.areas.length; ++l) {
        var layer = layers.areas[l];
        if (userInput.areaId === 'all') {
            map.removeLayer(layer);
        } else {
            map.removeLayer(layer);
            if (layer.feature.properties.sch === (layerPrefix + userInput.areaId)) {
                layer.options.fill = false;
                layer.options.stroke = true;
                layerSelected = layer;

                map.fitBounds(layerSelected.getBounds());
            } else {
                layer.options.fill = true;
                layer.options.stroke = false;
            }
            map.addLayer(layer);
        }
    }

    for (var l = 0; l < layers.lines.length; ++l) {
        var layer = layers.lines[l];
        if (userInput.areaId === 'all') {
            map.removeLayer(layer);
            map.addLayer(layer);
        } else {
            map.removeLayer(layer);

            var intersection = turf.lineIntersect(layer.toGeoJSON(), layerSelected.toGeoJSON());
            if (intersection && intersection.features && (intersection.features.length > 0)) {
                map.addLayer(layer);
            }
        }
    }

//    ddj.marker.update();
}

ddj.autostart.onDone(function() {
    initLayers();

    $('#select-area')
        .change(function() {
            userInput.areaTitle = $('#select-area option:selected').text();
            userInput.areaId = $('#select-area option:selected').val();

            dataUpdated();
        })
        .trigger('change');
});

ddj.autostart.onAddMarker(function(properties, value) {
/*    if (properties.type === 'regio') {
        properties.borderColor = 'red';
        properties.borderWeight = 4;
    }*/

    return true;
});