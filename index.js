ddj.autostart.onDone(function() {
//	ddj.map.get().scrollWheelZoom.disable();
});

ddj.autostart.onAddMarker(function(properties, value) {
/*    if (properties.type === 'regio') {
        properties.borderColor = 'red';
        properties.borderWeight = 4;
    }*/

    return true;
});