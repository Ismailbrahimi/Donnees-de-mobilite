// Import the Browser module separately
// import { Browser } from "leaflet";
import { Map, tileLayer, control } from "leaflet";



export class PathTracker {


  constructor(L) {
    this.L = L;
    this.info = null;
    this.legend = null;
    this.line = null;
    this.marker = null;// the marker of the destinitation point
    this.routeLines = []; // Array to store route lines
    this.routeMarkers = []; // Array to store route markers
    this.geoJSON = null;
    this.regions = null;

    this.animationStopped = false;

    //binde style to class
    this.style = this.style.bind(this);
  }

  generateMap() {
    this.map = this.L.map("map").setView([51.505, -0.09], 4);
    return this.map;
  }

  setTilePlayer(urlTemplate, options) {
    const osm = this.L.tileLayer(urlTemplate, options);
    osm.addTo(this.map);
    return osm;
  }

  setIcon(iconPath, iconShadowUrl = '') {
    this.customMarkerIcon = L.icon({
      iconUrl: iconPath,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: iconShadowUrl,
      shadowSize: [41, 41],
      shadowAnchor: [12, 41]
    });
    return this.customMarkerIcon;
  }

   hideMarkers() {
    for (const marker of this.routeMarkers) {
      this.map.removeLayer(marker);
    }
  }

  animateMarkerAlongRoute() {
    this.animationStopped = false; // Reset the animationStopped flag
    if (this.routeLines.length > 0 && this.routeMarkers.length > 0) {
      const destinations = this.routeLines.map((route) => route.city);
      const routeCoordinates = this.routeLines.map((route) => route.line.getLatLngs());
      const markerCount = this.routeMarkers.length;
      const coordinateCounts = routeCoordinates.map((coords) => coords.length);

      const markerStatus = Array(markerCount).fill(false);
      let markersReachedDestination = 0;

      let i = 0;

      const animateMarker = () => {
        let j = 0;

        const moveMarker = () => {
          if (this.animationStopped) {
            return; // Exit the function if animation is stopped
          }
          // console.log("--------------------------");
          // console.log("i : ", i);
          // console.log("current desttination: ", j);
          // console.log(" max coord count : ", Math.max(...coordinateCounts) - 1);
          //  console.log("markersReachedDestination: ", markersReachedDestination);
          //  console.log("markerCount: ", markerCount);
          // console.log("--------------------------");

          if (j < markerCount) {
            if (!markerStatus[j]) {
              const coordinateIndex = Math.min(i, coordinateCounts[j] - 1);
              const coordinate = routeCoordinates[j][coordinateIndex];
              const marker = this.routeMarkers[j];
              marker.setLatLng(coordinate);

             // console.log("current coord pair; ",j, " object: ", this.routeLines[j]);

              if (coordinateIndex === coordinateCounts[j] - 1) {
                markerStatus[j] = true;
                //console.log("am destination ", destinations[j]);
                markersReachedDestination++;

                this.regions.features.forEach(feature => {
                  if (feature.properties.nom === destinations[j]) {
                    feature.properties.density += 100; // Update the density value to your desired value
                    this.geoJSON.setStyle(this.style);

                  }
                });
              }
            }
            j++;
          }

          if (i < Math.max(...coordinateCounts) - 1 && markersReachedDestination < markerCount) {
            setTimeout(moveMarker, 10); // Adjust the delay to control animation speed
            i++;
          }


          if (markersReachedDestination === markerCount) {
            // All markers have reached their destinations
            console.log("All markers reached their destinations. Animation stopped.");
            this.geoJSON.setStyle(this.style);
          }
        };

        moveMarker();

        if (!this.animationStopped && i < Math.max(...coordinateCounts) - 1 && markersReachedDestination < markerCount) {
          setTimeout(animateMarker, 100); // Adjust the delay to control animation speed
        }
      };

      animateMarker();
    }
  }

  setRoutingControl(waypointsArr) {
    return this.L.Routing.control({
      waypoints: waypointsArr.waypoints,
      // createMarker: (i, waypoint, n) => {
      //   // Create a custom marker with additional information
      //   const marker = this.L.marker(waypoint.latLng, {
      //     icon: this.customMarkerIcon
      //   });
  
      //   return marker;
      // },
      createMarker: (i, waypoint, n) => {
        // Skip creating markers for the starting and destination coordinates
        if (i === 0 || i === n - 1) {
          return null;
        }
  
        // Create a custom marker with additional information and icon size
        const marker = this.L.marker(waypoint.latLng, {
          icon: this.customMarkerIcon,
          iconSize: [2, 2] // Customize the icon size as per your requirement
        });
  
        return marker;
      },
      router: new this.L.Routing.osrmv1({
        //serviceUrl: "https://router.project-osrm.org/route/v1", // public api
        serviceUrl: "http://127.0.0.1:5000/route/v1",
        language: "en",
        routeWhileDragging: true,
      }),
      formatter: new this.L.Routing.Formatter({
        language: "en",
        units: "metric",
        roundLengths: true,
        formatOrder: ["waypoint", "distance"],
        waypointNameFallback: (latLng) => {
          return "Pair: " + latLng.lat.toFixed(6) + ", " + latLng.lng.toFixed(6);
        },
      }),
      lineOptions: {
        // Disable automatic map zooming
        zoomControl: false
      },
      fitSelectedRoutes: false // Disable automatic zooming and fitting the selected route
    })
    .on("routeselected", (e) => {
      const route = e.route;
      // Generate a random color for the path polyline
      const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  
      // Add the route polyline to the map with the random color
      const line = this.L.polyline(route.coordinates, {
        color: randomColor,
      }).addTo(this.map);
  
      this.routeLines.push({ city: waypointsArr.city, line }); // Store the line in the routeLines array
  
      // Add the animated marker to the map
      const marker = this.L.marker(route.coordinates[0], {
        icon: this.customMarkerIcon,
      }).addTo(this.map);
      this.routeMarkers.push(marker); // Store the marker in the routeMarkers array
  
      // Attach button click event to trigger marker animation
      const animateButton = document.getElementById("animateButton");
      animateButton.addEventListener("click", () => {
        this.animateMarkerAlongRoute();
      });
  
      const stopAnimateButton = document.getElementById("stopanimateButton");
      stopAnimateButton.addEventListener("click", () => {
        this.stopAnimation();
        animateButton.textContent = "Restart"; // Change button text to "Restart"
      });

      const hideMarkersButton = document.getElementById("hideMarkersButton");
      hideMarkersButton.addEventListener("click", () => {
        this.hideMarkers();
      });
    })
    .addTo(this.map);
  }
  
  stopAnimation() {
    this.animationStopped = true;
    console.log("Animation stopped.");
  }
  setLayers(baseLayersObj, overlayersObj) {
    this.L.control.layers(baseLayersObj, overlayersObj).addTo(this.map);
  }

  setSearchBtn() {
    this.L.Control.geocoder().addTo(this.map);
  }

  setChoroplethMap(data, options) {
    if (options) {
      return this.L.geoJSON(data, options).addTo(this.map);
    } else {
      return this.L.geoJSON(data).addTo(this.map);
    }
  }

  getColor(d) {
    return d > 1000 ? '#800026' :
      d > 500 ? '#BD0026' :
        d > 200 ? '#E31A1C' :
          d > 100 ? '#FC4E2A' :
            d > 50 ? '#FD8D3C' :
              d > 20 ? '#FEB24C' :
                d > 10 ? '#FED976' :
                  'rgba(255, 255, 255, 0.3)';
  }

  style(feature) {
    return {
      fillColor: this.getColor(feature.properties.density),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 1
    };
  }

  highlightFeature = (e) => {
    const layer = e.target;

    // layer.setStyle({
    //     weight: 5,
    //     color: '#666',
    //     dashArray: '',
    //     fillOpacity: 0.7
    // });
    layer.setStyle(this.style);


    if (!this.L.Browser.ie && !this.L.Browser.opera && !this.L.Browser.edge) {
      layer.bringToFront();
    }
    // console.log(this.info);
    // this.info.update(layer.feature.properties);
  }

  resetHighlight = (e) => {
    //this.geoJSON?.resetStyle(e.target);
    this.geoJSON?.resetStyle(this.style);
    this.info.update();
  }

  zoomToFeature = (e) => {
    this.map.fitBounds(e.target.getBounds());
  }


}