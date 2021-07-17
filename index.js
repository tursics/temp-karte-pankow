var userInput = {
	areaId: '1100000303',
	areaTitle: 'Bezirk Pankow',
};

function dataUpdated() {
	'use strict';

	if (ddj.getData() === null) {
		return;
	}

    ddj.marker.update();
}

ddj.autostart.onDone(function() {
    $('#select-area')
        .change(function() {
            userInput.areaTitle = $('#select-area option:selected').text();
            userInput.areaId = $('#select-area option:selected').val();
        })
        .trigger('change');
});

ddj.autostart.onAddMarker(function(properties, value) {
/*    if (properties.type === 'regio') {
        properties.borderColor = 'red';
        properties.borderWeight = 4;
    }*/

    console.log('x');
    return true;
});