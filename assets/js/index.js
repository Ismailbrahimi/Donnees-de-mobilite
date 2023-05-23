import * as L from "leaflet";
import * as geoData from "../../data/france_geojson.json";
import * as Routing from "leaflet-routing-machine";
import {PathTracker} from "./services/PathTracker";

const pathTracker = new PathTracker(L);
//gen map
pathTracker.generateMap();
// set tiles player
pathTracker.setTilePlayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
//set icon
pathTracker.setIcon("../marker.png");
// set routing control
pathTracker.setRoutingControl(
     [
     pathTracker.L.latLng(48.573405, 7.752111), // Strasbourg
    pathTracker.L.latLng(48.858222, 2.2945), // Paris
     ]);

    pathTracker.setRoutingControl([
    pathTracker.L.latLng(43.296482, 5.36978), // Marseille
    pathTracker.L.latLng(45.767, 4.833), // Lyon
    ]);

    pathTracker.setRoutingControl([
    pathTracker.L.latLng(44.8378, -0.5792), // Bordeaux
    pathTracker.L.latLng(48.1173, -1.6778), // Rennes
     ]);

