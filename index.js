var userInput = {
	areaId: '',
    highlightLine: null,
    highlightLayer: null,
    highlightLayerBorder: null,
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

function showLineDetails(lines) {
    var html = '';

    for (var l = 0; l < lines.length; ++l) {
        var line = lines[l];
        var color = line.linecolor;
        var type = line.type;
        var title = line.title;
        var uuid = line.uuid;

        if (uuid === userInput.highlightLine) {
            html += '<span style="background:#f5fa2a;margin-left:-.5rem;padding:0 .5rem;font-weight:700"><span class="type-' + type + '"></span>' + title + '</span><br>';
        } else {
            html += '<span class="type-' + type + '"></span><a href="#" data-key="line" data-value="' + uuid + '">' + title + '</a><br>';
        }
    }

    $('#line-list').html(html);
}

function dataUpdated(fitBounds) {
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
        } else if (userInput.areaId === '') {
            map.removeLayer(layer);
            layer.options.fill = true;
            layer.options.fillColor = '#5bba47';
            layer.options.stroke = true;
            layer.options.color = '#fff';
            map.addLayer(layer);
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

    if (fitBounds) {
        if (layerSelected) {
            map.fitBounds(layerSelected.getBounds());
        } else {
            var bounds = layers.areas[0].getBounds();
            for (var l = 1; l < layers.areas.length; ++l) {
                bounds = bounds.extend(layers.areas[l].getBounds());
            }
            map.fitBounds(bounds);
        }
    }

    if (userInput.highlightLayer) {
        map.removeLayer(userInput.highlightLayer);
        userInput.highlightLayer = null;
    }
    if (userInput.highlightLayerBorder) {
        map.removeLayer(userInput.highlightLayerBorder);
        userInput.highlightLayerBorder = null;
    }

    var lines = [];
    for (var l = 0; l < layers.lines.length; ++l) {
        var layer = layers.lines[l];
        if (userInput.areaId === 'all') {
            map.removeLayer(layer);
            layer.options.weight = '4';
            map.addLayer(layer);
            lines.push(layer.feature.properties);
        } else {
            map.removeLayer(layer);
            layer.options.weight = '4';

            if (userInput.highlightLine === layer.feature.properties.uuid) {
                userInput.highlightLayer = L.geoJson(layer.toGeoJSON());
                var key = Object.keys(userInput.highlightLayer._layers)[0];
                userInput.highlightLayer = userInput.highlightLayer._layers[key];

                userInput.highlightLayer.options.color = layer.options.color;
                userInput.highlightLayer.options.weight = layer.options.weight;

                userInput.highlightLayerBorder = L.geoJson(layer.toGeoJSON());
                key = Object.keys(userInput.highlightLayerBorder._layers)[0];
                userInput.highlightLayerBorder = userInput.highlightLayerBorder._layers[key];

                userInput.highlightLayerBorder.options.color = '#f5fa2a';
                userInput.highlightLayerBorder.options.weight = parseInt(layer.options.weight, 10) + 10;
            }

            if (layerSelected) {
                var intersection = turf.lineIntersect(layer.toGeoJSON(), layerSelected.toGeoJSON());
                if (intersection && intersection.features && (intersection.features.length > 0)) {
                    map.addLayer(layer);
                    lines.push(layer.feature.properties);
                }
            }
        }
    }

    if (userInput.highlightLayerBorder) {
        map.addLayer(userInput.highlightLayerBorder);
    }
    if (userInput.highlightLayer) {
        map.addLayer(userInput.highlightLayer);
    }

    if (userInput.areaId === '') {
        $('#sign-line-headline').text('');
        $('#sign-select-area').show();
        $('#sign-select-line').hide();
    } else {
        var hash = '';
        $('#sign-line-headline').text('');
        $("#select-area option").each(function() {
            if ($(this).val() === userInput.areaId) {
                $('#sign-line-headline').text($(this).text());
                hash = $(this).data('hashtag');
            }
        });

        $('#link-to-story').attr('href', 'https://gruenepankow.de/themen/verkehrswende/oeffis-vor-unser-plan-fuer-pankow/' + hash);
        $('#sign-select-area').hide();
        $('#sign-select-line').show();
    }

    showLineDetails(lines);
//    ddj.marker.update();
}

ddj.autostart.onDone(function() {
    initLayers();

    $('#select-area')
        .val(userInput.areaId)
        .change(function() {
            userInput.areaId = $('#select-area option:selected').val();
            $('#select-area').val('');

            ddj.url.push({area: userInput.areaId});

            var shareURI = 'https://tursics.de/story/oepnv-pankow/index.html?area=' + userInput.areaId;
            document.querySelector('meta[name="ddj:shareURI"]').setAttribute('content', shareURI);

            dataUpdated(true);
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
    var area = obj.area || '';
    userInput.areaId = area;
});

ddj.autostart.onKeyValueLinkClicked(function(key, value) {
    if (key === 'line') {
        userInput.highlightLine = parseInt(value, 10);

        dataUpdated(false);
    } else if (key === 'area') {
        userInput.areaId = '';
        userInput.highlightLine = null;

        ddj.url.push({area: userInput.areaId});

        var shareURI = 'https://tursics.de/story/oepnv-pankow/index.html?area=' + userInput.areaId;
        document.querySelector('meta[name="ddj:shareURI"]').setAttribute('content', shareURI);

        dataUpdated(true);
    }
});

ddj.autostart.onSelected(function(selectedItem) {
    var fitBounds = false;
    userInput.highlightLine = parseInt(selectedItem.properties.uuid, 10);

    if (/*(userInput.areaId === '') &&*/ (selectedItem.properties.sch)) {
        fitBounds = (userInput.areaId === '');

        var area = selectedItem.properties.sch.substr(-2);
        userInput.areaId = area;

        ddj.url.push({area: userInput.areaId});

        var shareURI = 'https://tursics.de/story/oepnv-pankow/index.html?area=' + userInput.areaId;
        document.querySelector('meta[name="ddj:shareURI"]').setAttribute('content', shareURI);
    }

    dataUpdated(fitBounds);
});
