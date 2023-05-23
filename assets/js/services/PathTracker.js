

export class PathTracker{
    
    constructor(L){
        this.L = L;
        this.line = null;
        this.marker = null;// the marker of the destinitation point
        this.routeLines = []; // Array to store route lines
        this.routeMarkers = []; // Array to store route markers
    }

    generateMap(){
        this.map = this.L.map("map").setView([51.505, -0.09], 4);
        return this.map;
    }

    setTilePlayer(urlTemplate, options){
        this.L.tileLayer(urlTemplate, options).addTo(this.map);
    }

    setIcon(iconPath, iconShadowUrl = ''){
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

    moveMarker(i, j, routeCoordinates, markerCount, coordinateCounts, markerStatus, markersReachedDestination){
      
      if (j < markerCount) {
        if (!markerStatus[j]) {
          const coordinateIndex = Math.min(i, coordinateCounts[j] - 1);
          const coordinate = routeCoordinates[j][coordinateIndex];
          const marker = this.routeMarkers[j];
          marker.setLatLng(coordinate);

          if (coordinateIndex === coordinateCounts[j] - 1) {
            markerStatus[j] = true;
            markersReachedDestination++;
          }
        }
        j++;
      }

      if (i <= Math.max(...coordinateCounts) - 1 && markersReachedDestination < markerCount) {
        setTimeout(this.moveMarker.bind(this), 100, i, j, routeCoordinates, markerCount, coordinateCounts, markerStatus, markersReachedDestination);
        i++;
      } else {
        i = 0;
      }

      if (markersReachedDestination === markerCount) {
        // All markers have reached their destinations
        console.log("All markers reached their destinations. Animation stopped.");
        return; // Stop the animation
      }
    }

    animateMarkerAlongRoute() {
      if (this.routeLines.length > 0 && this.routeMarkers.length > 0) {
        const routeCoordinates = this.routeLines.map((route) => route.getLatLngs());
        const markerCount = this.routeMarkers.length;
        const coordinateCounts = routeCoordinates.map((coords) => coords.length);
    
        const markerStatus = Array(markerCount).fill(false);
        let markersReachedDestination = 0;
    
        let i = 0;
        const animateMarker = () => {
          let j = 0;
  
          this.moveMarker(i, j, routeCoordinates, markerCount, coordinateCounts, markerStatus, markersReachedDestination);
          if (i <= Math.max(...coordinateCounts) - 1 && markersReachedDestination < markerCount) {
            setTimeout(animateMarker, 100); // Adjust the delay to control animation speed
          }
        };
    
        animateMarker();
      }
    }
    
    
    
    setRoutingControl(waypointsArr) {
      return this.L.Routing.control({
        waypoints: waypointsArr,
        createMarker: (i, waypoint, n) => {
          return this.L.marker(waypoint.latLng, {
            draggable: true,
            icon: this.customMarkerIcon,
          });
        },
        router: new this.L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
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
      })
        .on("routeselected", (e) => {
          const route = e.route;
    
          // Generate a random color for the path polyline
          const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    
          // Add the route polyline to the map with the random color
          const line = this.L.polyline(route.coordinates, {
            color: randomColor,
          }).addTo(this.map);
          this.routeLines.push(line); // Store the line in the routeLines array
    
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
        })
        .addTo(this.map);
    }
    
      
}