import * as L from "leaflet";
import * as geoData from "../../data/france_geojson_densite.json";


var map = L.map("map").setView([51.505, -0.09], 4);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



// control that shows state info on hover
var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create("div", "info");
  this.update();
  return this._div;
};

info.update = function(props) {
  this._div.innerHTML =
    "<h4>US Population Density</h4>" +
    (props
      ? "<b>" +
        props.name +
        "</b><br />" +
        props.density +
        " people / mi<sup>2</sup>"
      : "Hover over a state");
};

info.addTo(map);

// get color depending on population density value
function getColor(d) {
  return d > 1000
    ? "#800026"
    : d > 500
      ? "#BD0026"
      : d > 200
        ? "#E31A1C"
        : d > 100
          ? "#FC4E2A"
          : d > 50
            ? "#FD8D3C"
            : d > 20 ? "#FEB24C" : d > 10 ? "#FED976" : "#FFEDA0";
}

function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.density)
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: "#000",
    dashArray: "",
    fillOpacity: 0.7
  });

    pathTracker.setRoutingControl([
    pathTracker.L.latLng(43.296482, 5.36978), // Marseille
    pathTracker.L.latLng(45.767, 4.833), // Lyon
    ]);

    pathTracker.setRoutingControl([
    pathTracker.L.latLng(44.8378, -0.5792), // Bordeaux
    pathTracker.L.latLng(48.1173, -1.6778), // Rennes
     ]);

