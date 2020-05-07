var earthquakes_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var tectonic_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Create the tile layer that will be the background of our map
var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: "pk.eyJ1IjoiZGFuaWVsbGVobyIsImEiOiJjazlweGpyZTAwZjVvM3BycmM1OTM2MHk0In0.219ncmTIvxFW-tKUB_kDsg"
});

var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: "pk.eyJ1IjoiZGFuaWVsbGVobyIsImEiOiJjazlweGpyZTAwZjVvM3BycmM1OTM2MHk0In0.219ncmTIvxFW-tKUB_kDsg"
});

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: "pk.eyJ1IjoiZGFuaWVsbGVobyIsImEiOiJjazlweGpyZTAwZjVvM3BycmM1OTM2MHk0In0.219ncmTIvxFW-tKUB_kDsg"
});

var layers = {
    Faultlines: new L.LayerGroup(),
    Earthquakes: new L.LayerGroup()
};


// Create a map object
var myMap = L.map("map", {
    center: [ 37.09, -95.71],
    zoom: 5,
    layers: [
        grayscale,
        outdoors,
        satellite,
        layers.Faultlines,
        layers.Earthquakes
    ]
 });


var baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};

var overlayMaps = {
    "Fault Lines": layers.Faultlines,
    "Earthquakes": layers.Earthquakes
};

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

function getColor(d) {
    return d > 5 ? '#e62e00' :
           d > 4  ? '#e69900' :
           d > 3  ? '#ffb31a' :
           d > 2  ? '#ffd11a' :
           d > 1   ? '#99cc00' :
                      '#99e600';}

// Create a legend to display information about our map
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    // When the layer control is added, insert a div with the class of "legend"
    var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 2, 3, 4, 5]; 
    
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += '<i style= "background:' + getColor(grades[i] + 1) + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
        };

// Add the legend to the map       
legend.addTo(myMap);
 
// Perform a request to the query tectonic url to get boundaries information.
d3.json(tectonic_url, function (line_response){

    // Creating a geoJSON layer with the retrieved data, add to Faultline layer
    L.geoJson(line_response, {
        color: "orange",
        weight: 2
    }).addTo(layers.Faultlines);
})

// Perform a request to the query earthquakes url to get earthquake information.
d3.json(earthquakes_url, function(response){

    // Pull the "features" property off of response.data
    var features = response.features;

    // Initialize an array to hold magnitude markers
    var magMarkers = [];

    //Loop through the features array
    for (var index = 0; index < features.length; index++) {
        var feature = features[index];

        var lon = feature.geometry.coordinates[0]
        var lat = feature.geometry.coordinates[1]

        // For each earthquake, create a marker and bind a popup describing the place, time and magnitude of the earthquake
        var magMarker = L.circle([lat, lon], {
            fillOpacity: 0.9,
            color: "black",
            weight: 1,
            fillColor: getColor(feature.properties.mag),
            radius : feature.properties.mag * 23000
        }).bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"+
        "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");

        // Add the marker to the magnitude markers array
        magMarkers.push(magMarker);

       
        // Add magMarker to the Earthquakes layer
        magMarker.addTo(layers.Earthquakes);
    }   
    
});








