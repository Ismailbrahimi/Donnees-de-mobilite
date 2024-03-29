
import * as L from "leaflet";
import {nepaldataa} from "./nepaldata";
import {pointJSON} from "./point";
import {polygonJSON} from "./polygon";
import {lineJSON} from "./line";
// import {regions} from "./frdepartments";
import { PathTracker } from "./services/PathTracker";
import * as Routing from "leaflet-routing-machine";
import regions from "../data/regions.json";


//scss
import "../scss/style.scss";

import "bootstrap";
import 'leaflet-control-geocoder';


regions.features.forEach(element => {
    const min = 10;
    const max = 1000;
    const randomdensity = Math.floor(Math.random() * (max - min + 1)) + min;
    element.properties.density = randomdensity;
});

var isTracking = false;
    var toggleButton = document.getElementById("toggleButton");

    function toggleButtonClick() {
        isTracking = !isTracking;
        if (isTracking) {
            toggleButton.innerHTML = "Stop";
            // Add your code for tracking functionality here when the button is clicked and tracking is started.
        } else {
            toggleButton.innerHTML = "Start";
            // Add your code for stopping the tracking functionality here when the button is clicked and tracking is stopped.
        }
    }


const oopMap = new PathTracker(L);
const map = oopMap.generateMap();
const osm = oopMap.setTilePlayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


//set icon
oopMap.setIcon("../marker.png");
// set routing control
oopMap.setRoutingControl(
     [
        oopMap.L.latLng(48.573405, 7.752111), // Strasbourg
        oopMap.L.latLng(48.858222, 2.2945), // Paris
     ]);

     oopMap.setRoutingControl([
        oopMap.L.latLng(43.296482, 5.36978), // Marseille
        oopMap.L.latLng(45.767, 4.833), // Lyon
    ]);

    oopMap.setRoutingControl([
        oopMap.L.latLng(44.8378, -0.5792), // Bordeaux
        oopMap.L.latLng(48.1173, -1.6778), // Rennes
     ]);



const CartoDB_DarkMatter = oopMap.setTilePlayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
        maxZoom: 19
    });

// Google Map Layer
const googleStreets  = oopMap.setTilePlayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
 });

 const googleSat  = oopMap.setTilePlayer("http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
  });
 // Satelite Layer
const Stamen_Watercolor  = oopMap.setTilePlayer("https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}", {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
   subdomains: 'abcd',
   minZoom: 1,
   maxZoom: 16,
   ext: 'jpg'
   });



/*===================================================
                      GEOJSON               
===================================================*/

// var linedata = L.geoJSON(lineJSON).addTo(map);
const linedata = oopMap.setChoroplethMap(lineJSON);
// var pointdata = L.geoJSON(pointJSON).addTo(map);
const pointdata = oopMap.setChoroplethMap(pointJSON);

// var polygondata = L.geoJSON(polygonJSON,{
//     onEachFeature: function(feature,layer){
//         layer.bindPopup('<b>This is a </b>' + feature.properties.name)
//     },
//     style:{
//         fillColor: 'red',
//         fillOpacity:1,
//         color: 'green'
//     }
// }).addTo(map);

const polygondata = oopMap.setChoroplethMap(polygonJSON,{
    onEachFeature: function(feature,layer){
        layer.bindPopup('<b>This is a </b>' + feature.properties.name)
    },
    style:{
        fillColor: 'red',
        fillOpacity:1,
        color: 'green'
    }
});

/*===================================================
                      LAYER CONTROL               
===================================================*/

const baseLayers = {
    "Satellite":googleSat,
    "Google Map":googleStreets,
    "Water Color":Stamen_Watercolor,
    "OpenStreetMap": osm,
};

const overlays = {
    //"Marker": singleMarker,
    "PointData":pointdata,
    "LineData":linedata,
    "PolygonData":polygondata
};

// L.control.layers(baseLayers, overlays).addTo(map);
oopMap.setLayers(baseLayers, overlays)


/*===================================================
                      SEARCH BUTTON               
===================================================*/

// L.Control.geocoder().addTo(map);
oopMap.setSearchBtn();

/*===================================================
                      Choropleth Map               
===================================================*/

// L.geoJSON(regions).addTo(map);
oopMap.setChoroplethMap(regions);

// function getColor(d) {
//     return d > 1000 ? '#800026' :
//            d > 500  ? '#BD0026' :
//            d > 200  ? '#E31A1C' :
//            d > 100  ? '#FC4E2A' :
//            d > 50   ? '#FD8D3C' :
//            d > 20   ? '#FEB24C' :
//            d > 10   ? '#FED976' :
//                       '#FFEDA0';
// }

// function style(feature) {
//     return {
//         fillColor: oopMap.getColor(feature.properties.density),
//         weight: 2,
//         opacity: 1,
//         color: 'white',
//         dashArray: '3',
//         fillOpacity: 0.7
//     };
// }

// L.geoJson(regions, {style: style}).addTo(map);
oopMap.setChoroplethMap(regions, {style: oopMap.style});
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// function resetHighlight(e) {
//     geojson.resetStyle(e.target);
//     info.update();
// }

oopMap.legend = oopMap.L.control({position: 'bottomright'});

oopMap.legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + oopMap.getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

oopMap.legend.addTo(map);

//##################

oopMap.geoJSON = oopMap.setChoroplethMap(regions);

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: oopMap.highlightFeature,
        mouseout: oopMap.resetHighlight,
        click: oopMap.zoomToFeature
    });
}

oopMap.geoJSON = oopMap.setChoroplethMap(regions, {
    style: oopMap.style,
    onEachFeature: onEachFeature
});

// const info = oopMap.L.control();
oopMap.info = oopMap.L.control();

oopMap.info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
oopMap.info.update = function (props) {
    this._div.innerHTML = '<h4>FRANCE Population Density</h4>' +  (props ?
        '<b>' + props.nom + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
        : 'Hover over a department');
};

oopMap.info.addTo(map);

// const legend = L.control({position: 'bottomright'});


