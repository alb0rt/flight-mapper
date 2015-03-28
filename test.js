var rssParser = require('./rss-parser');
var fs = require ('fs');

rssParser.parseTfdRss();
/*

var us = JSON.parse(fs.readFileSync('./html/places.json'));

function findCoordinates(place) {
	var placeData = us.features;
	var coordinates;


	for(var i = 0; i < placeData.length; i++) {
		if(placeData[i].properties.NAME == place) {
			coordinates = placeData[i].geometry.coordinates;
			console.log(placeData[i].properties.NAME);
		}
	}

	return coordinates;
}

findCoordinates("Seattle");*/