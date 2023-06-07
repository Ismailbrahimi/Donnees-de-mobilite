
import * as L from "leaflet";
import {nepaldataa} from "./nepaldata";
import {pointJSON} from "./point";
import {polygonJSON} from "./polygon";
import {lineJSON} from "./line";
// import {regions} from "./frdepartments";
import { PathTracker } from "./services/PathTracker";
import * as Routing from "leaflet-routing-machine";
import regions from "../data/regions.json";
import coordPairs from "../data/coordPairs.json";


//scss
import "../scss/style.scss";

import "bootstrap";
import 'leaflet-control-geocoder';


// regions.features.forEach(element => {
//     const min = 10;
//     const max = 1000;
//     const randomdensity = Math.floor(Math.random() * (max - min + 1)) + min;
//     element.properties.density = randomdensity;
// });

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

//     oopMap.setRoutingControl([
//         oopMap.L.latLng(44.8378, -0.5792), // Bordeaux
//         oopMap.L.latLng(48.1173, -1.6778), // Rennes
//      ]);

//  coordPairs.forEach(function(pair, index){
//      if(index > 3) return;

//      oopMap.setRoutingControl([
//          oopMap.L.latLng(pair.start.latitude, pair.start.longitude), 
//          oopMap.L.latLng(pair.end.latitude, pair.end.longitude),
//       ]);
//  });
oopMap.setRoutingControl(coordPairs);



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

const baseLayers = {
    "Satellite":googleSat,
    "Google Map":googleStreets,
    "Water Color":Stamen_Watercolor,
    "OpenStreetMap": osm,
};

const overlays = {
    //"Marker": singleMarker,
    // "PointData":pointdata,
    // "LineData":linedata,
    // "PolygonData":polygondata
};

// L.control.layers(baseLayers, overlays).addTo(map);
oopMap.setLayers(baseLayers, overlays)


/*===================================================
                      SEARCH BUTTON               
===================================================*/

// L.Control.geocoder().addTo(map);
oopMap.setSearchBtn();

oopMap.setChoroplethMap(regions);

//the part that colors the regions
// oopMap.setChoroplethMap(regions, {style: oopMap.style});

//show density deg
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
        mouseover: function (e) {
            const layer = e.target;
            // layer.setStyle({
            //     weight: 2,
            //     color: 'white',
            //     dashArray: '',
            //     fillOpacity: 0.7
            // });
            layer.setStyle(oopMap.style);
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
            oopMap.info.update(layer.feature.properties);
        },
        mouseout: function (e) {
            oopMap.geoJSON.resetStyle(oopMap.style);
            oopMap.info.update();
        },
        click: oopMap.zoomToFeature
    });
}


oopMap.geoJSON = oopMap.setChoroplethMap(regions, {
    style: oopMap.style,
    onEachFeature: onEachFeature
});

oopMap.info = oopMap.L.control();

oopMap.info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

oopMap.info.update = function (props) {
    this._div.innerHTML = '<h4>FRANCE Population Density</h4>' + (props ?
        '<b>' + props.nom + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
        : 'Hover over a department');
};

oopMap.info.addTo(map);
// const legend = L.control({position: 'bottomright'});


