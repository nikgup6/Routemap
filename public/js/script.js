const socket = io();
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};
var pickupMarker, dropMarker, cabMarker, mainRoadMeetingPoint;
const customIcon = L.icon({
    iconUrl: './img/onee.svg',  // Replace with the path to your icon image
    iconSize: [40, 40], // Size of the icon
    iconAnchor: [30, 10], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
});
// Function to calculate distance between two coordinates
// function calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371; // Radius of the Earth in km
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = 
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
//         Math.sin(dLon / 2) * Math.sin(dLon / 2); 
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
//     return R * c; // Distance in km
// }

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map).bindPopup("User Location");
    }
    
    if (Object.keys(markers).length === 2) {
        const userId = Object.keys(markers)[0]; // Assume first marker is user
        const cabId = Object.keys(markers)[1]; // Assume second marker is cab
        markers[userId].setLatLng([markers[userId].getLatLng().lat, markers[userId].getLatLng().lng]); // Update user marker position
        
        // Update cab marker with custom icon
        markers[cabId].setLatLng([latitude, longitude,{icon: "download.jpeg"}]); // Update cab marker position
        markers[cabId].setIcon(customIcon).bindPopup("Cab Location"); // Set custom icon for the cab marker
    } else{

    }
    
});


var userLocation = null;
var dropLocation = null;
map.on('click', function (e) {
    if (!userLocation) {
        // First click is the user's pickup location
        userLocation = e.latlng;
        pickupMarker = L.marker([userLocation.lat, userLocation.lng]).addTo(map).bindPopup("Pickup Location").openPopup();
        alert("Now, please select your drop location.");
    } if (!dropLocation) {
        // Second click is the user's drop location
        dropLocation = e.latlng;
        dropMarker = L.marker([dropLocation.lat, dropLocation.lng]).addTo(map).bindPopup("Drop Location").openPopup();

        // After both locations are selected, show consent popup
        document.getElementById('consentPopup').style.display = 'block';

        // Add routing control after selecting drop location
        L.Routing.control({
            waypoints: [
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(dropLocation.lat, dropLocation.lng)
            ],
            routeWhileDragging: true
        }).addTo(map);
    }
});

       



socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});









// Function to get route and calculate distance
// document.getElementById("getRoute").addEventListener("click", () => {
//     const pickup = document.getElementById("pickup").value;
//     const drop = document.getElementById("drop").value;

//     if (!pickup || !drop) {
//         alert("Please enter both pickup and drop locations.");
//         return;
//     }

//     // For demonstration, use hardcoded coordinates for pickup and drop
//     // In a real scenario, you'd use a geocoding method to convert addresses to coordinates
//     const pickupCoords = { lat: 28.7041, lng: 77.1025 }; // Example coordinates for Delhi
//     const dropCoords = { lat: 28.5355, lng: 77.3910 }; // Example coordinates for Noida

//     // Draw the route
//     const routingControl = L.Routing.control({
//         waypoints: [
//             L.latLng(pickupCoords.lat, pickupCoords.lng),
//             L.latLng(dropCoords.lat, dropCoords.lng)
//         ],
//         routeWhileDragging: true
//     }).addTo(map);

//     // Calculate and show distance
//     const distance = calculateDistance(pickupCoords.lat, pickupCoords.lng, dropCoords.lat, dropCoords.lng);
//     document.getElementById("routeInfo").innerHTML = `Distance: ${distance.toFixed(2)} km`;

//     // Show sustainability prompt
//     alert("If you are interested in contributing to sustainability, you can walk towards the cab which is going through the main road.");
// });
