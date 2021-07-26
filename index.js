var userInput = {
	areaId: 'all',
	areaTitle: 'Bezirk Pankow',
};

var layers = {
    bounds: null,
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
        } else if (layer && layer.feature && layer.feature.properties && layer.feature.properties.Gemeinde_name && (layer.feature.properties.Gemeinde_name === 'Pankow')) {
            layers.bounds = layer;
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
                layer.options.color = '#000';
                layerSelected = layer;
            } else {
                layer.options.fill = true;
                layer.options.fillColor = 'white';
                layer.options.stroke = false;
            }
            map.addLayer(layer);
        }
    }

    if (layerSelected) {
        map.fitBounds(layerSelected.getBounds());
    } else {
        var bounds = layers.areas[0].getBounds();
        for (var l = 1; l < layers.areas.length; ++l) {
            bounds = bounds.extend(layers.areas[l].getBounds());
        }
        map.fitBounds(bounds);
    }

    for (var l = 0; l < layers.lines.length; ++l) {
        var layer = layers.lines[l];
        if (userInput.areaId === 'all') {
            map.removeLayer(layer);
            layer.options.weight = '4';
            map.addLayer(layer);
        } else {
            map.removeLayer(layer);
            layer.options.weight = '4';

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
        .val(userInput.areaId)
        .change(function() {
            userInput.areaTitle = $('#select-area option:selected').text();
            userInput.areaId = $('#select-area option:selected').val();

            ddj.url.push({area: userInput.areaId});

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

ddj.autostart.onInitURL(function(obj) {
    var area = obj.area || 'all';
    userInput.areaId = area;
});

ddj.autostart.onKeyValueLinkClicked(function(key, value) {
    console.log(key, value);
});
