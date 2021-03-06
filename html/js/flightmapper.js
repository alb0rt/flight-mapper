var colors = {
	"jetBlue" : "#368FFF",
	"United" : "blue",
	"Delta" : "#fd923d",
	"American" : "red",
	"Alaska" : "green"
}

var pathCenter = function(coordinates) {
	return [(coordinates[0][0] + coordinates[1][0]) / 2, 
			(coordinates[0][1] + coordinates[1][1]) / 2];
}

// Setup SVG canvas

var width = 1200,
	height = 625;

var projection = d3.geo.albersUsa()
			.scale(1200)
			.translate([width / 2, height / 2]);

var path = d3.geo.path()
	.projection(projection);

var svg = d3.select("body").append("svg")
//var svg = d3.select(".map").append("svg")
	.attr("width", width)
	.attr("height", height)
	.style("margin-right", "auto")
	.style("margin-left", "auto");

var stateGroup = svg.append("g");
var pathGroup = svg.append("g");

// Draw map
d3.json("us.json", function(error, us) {
	if (error)
		return console.error(error);	
	
    // Draw land units
	stateGroup.selectAll(".state")
		.data(topojson.feature(us, us.objects.states).features)
		.enter()
		.append("path")
		.attr("class", function(d) {
			return "state " + d.id;
		})
		.attr("d", path);
	
    // Draw state boundaries
	stateGroup.insert("path")
		.datum(topojson.mesh(us, us.objects.states, function(a, b) {
			return a !== b;
		}))
		.attr("d", path)
		.attr("class", "state-boundary internal");
        
	stateGroup.insert("path")
		.datum(topojson.mesh(us, us.objects.states, function(a, b) {
			return a === b;
		}))
		.attr("d", path)
		.attr("class", "state-boundary external");

    // Draw state labels
	stateGroup.selectAll(".state-label")
		.data(topojson.feature(us, us.objects.states).features)
		.enter()
		.append("text")
		.attr("class", function(d) {
			return "state-label " + d.id;
		})
		.attr("transform", function(d) {
			return "translate(" + path.centroid(d) + ")";
		})
		.attr("dy", ".35em")
		.text(function(d) {
			return d.properties.postal;
		});
});

// Draw flight deal overlay
d3.json("flights.json", function(error, us) {
	if(error)
		console.error(error);

	// Create group for flight deal paths
	var arcGroup = pathGroup.selectAll(".flights")
        .data(us.arcs.features)
        .enter()
        .append("g")
        .attr("class", "flights");
    
    // Draw visible flight deal path
	var arc = arcGroup.append("path")
        .attr("class", "arc")
        .attr("d", path)
        .style("stroke", function(d) {
        	if(colors[d.properties.airline])
        		return colors[d.properties.airline];
        	else
        		return "black";
        });

    // Create wider hidden path to make hovering easier
	var arcHidden = arcGroup.append("path")
        .attr("class", "arc-hidden")
        .attr("d", path);

    // Create hover tooltip
	var tooltip = d3.select("body")
        .data(us.arcs.features)
        .append("div")
        .attr("class", "arc-label-container")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");

    // Create tooltip label with filler text
	tooltip.append("div")
        .attr("class", "arc-label")
        .text(function (d) {
            return d.properties.airline + " " + d.properties.price + ": " + d.properties.from + " - " + d.properties.to;
        });

    // Define mouse hover behavior
    arcHidden
        .on("mouseover", function (d) {
            tooltip.style("visibility", "visible")
            	.style("border", function() {
            		var style = "1px solid ";
            		if(colors[d.properties.airline])
            			return style + colors[d.properties.airline];
            		else
            			return style + "black";
            	});
            
            all_arcs
                .transition()
                .duration(500)
                .style("stroke-width", function(d2) {
                	if(d.properties.url === d2.properties.url) {
                		return "5px";
                	} else {
                		return "1px";
                	}
                });

            d3.select(".arc-label")
            	.data(us.arcs.features)
            	.text(function () {
            		return d.properties.airline + " " + d.properties.price + ": " + d.properties.from + " - " + d.properties.to;
            	});
	    })
        .on("mousemove", function () {
            return tooltip.style("top", (d3.event.pageY - 60) + "px").style("left", (d3.event.pageX) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
            all_arcs
                .transition()
                .duration(250)
                .style("stroke-width", "2px");
        })
        .on("click", function(d) {
            location.href = d.properties.url;
        });

    var all_arcs = d3.selectAll(".arc");

	var label = pathGroup.selectAll("text")
		.data(us.arcs.features)
		.enter()
		.append("text");

	// Draw path endpoints
	svg.insert("path")
		.datum(us.places)
		.attr("d", path)
		.attr("class", "place");

	// Draw path endpoint labels
	pathGroup.selectAll(".place-label")
		.data(us.places.geometries)
		.enter()
		.append("text")
		.attr("class", "place-label")
		.attr("transform", function(d) {
			return "translate(" + projection(d.coordinates) + ")";
		})
		.attr("dy", ".35em")
		.text(function(d) {
			return d.properties.name;
		})

	// Horizontal allign the labels based on whether they are on left or right of map
	pathGroup.selectAll(".place-label")
		.attr("x", function(d) {
			return d.coordinates[0] > -98 ? 6 : -6
		})
		.style("text-anchor", function(d) {
			return d.coordinates[0] > -98 ? "start" : "end"
		});

});