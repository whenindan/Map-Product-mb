mapboxgl.accessToken = 'pk.eyJ1Ijoibmd0cmRhdCIsImEiOiJjbHlkeHN4MmQwOXdkMnFvOW94Y2o4c29vIn0.b1vqUVEDdkEU0IYEYACoWw';

const map = new mapboxgl.Map({
  container: 'map', // HTML container id
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: [108, 14], // starting position as [lng, lat]
  zoom: 6
});

const infoDiv = document.getElementById('marker-info');


const popup = new mapboxgl.Popup().setHTML(
  `<h3>Reykjavik Roasters</h3><p>A good coffee shop</p>`
);

function getPos(){
    event.preventDefault();
    let lat = document.getElementById("latitude").value;
    let lon = document.getElementById("longitude").value;
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    if ((lat < -90 || lat > 90) || 
        (lon < -180 || lon > 180) ||
        (isNaN(lat)) ||
        (isNaN(lon))){
      alert("Invalid values.")
    }
    else {
        const marker = new mapboxgl.Marker()
        .setLngLat([lon, lat])
        .addTo(map);
    }
}
let mapMarkers = {}; // Changed to a dictionary to track markers by location

function markerFromData(dirr, province) {
    
    fetch(dirr)
        .then((response) => response.json())
        .then((data) => {
            for (const item of data.data) {
                if (item.coordinates === 'Unknown') {
                    continue;
                }
                const lat = parseFloat(item.coordinates[0]);
                const lon = parseFloat(item.coordinates[1]);

                const marker = new mapboxgl.Marker({
                    className: province // Add province as a class name for styling if needed
                })
                .setLngLat([lon, lat])
                .addTo(map);
                
                // Store marker with a unique identifier or location name
                mapMarkers[item.location] = marker;

                // Add custom properties to the marker
                marker.province = province;
                marker.location = item.location;
                
                marker.getElement().addEventListener('click', () => {
                    try{
                        displayInfo(item);  
                        
                    }
                    catch(error){
                        console.log(item.location);
                    }
                });
            }
            console.log(Object.getOwnPropertyNames(mapMarkers).length);
            console.log(province);
        })
        .catch((error) => {
            console.error('Error fetching JSON:', error);
        });
}

function displayInfo(item) {
    let infoContent = `<div class="marker-details"><h3>${item.location}</h3>`;
    
    for (const key in item) {
        if (item.hasOwnProperty(key) && key !== 'location' && key !== 'time' && key !== 'coordinates') {
            const value = item[key];
            infoContent += `
                <div class="info-item">
                    <strong>${value.name}:</strong> ${value.value} ${value.unit === 'none' ? '' : value.unit}
                </div>
            `;
        }
    }
    infoContent += `<button id="show-graph-button" onclick="showGraph('${item.location}')">Show Graph</button>`;
    infoContent += `</div>`;
    infoDiv.innerHTML = infoContent;
}

function showGraph(location) {
    console.log("SUCCESS");
    const historicalDataPath = `./data/historical_data.json`;
    
    fetch(historicalDataPath)
        .then(response => response.json())
        .then(data => {
            const locationData = data[location];
            if (locationData) {
                const times = Object.keys(locationData);
                const values = Object.values(locationData);

                const labels = times;
                const datasets = [];
                for (let parameter in values[0]) {
                    datasets.push({
                        label: parameter,
                        data: values.map(value => value[parameter]),
                        borderColor: getRandomColor(),
                        fill: false
                    });
                }

                renderGraph(labels, datasets);
            } else {
                alert('No historical data available for this location.');
            }
        })
        .catch(error => {
            console.error('Error fetching historical data:', error);
        });
}

function renderGraph(labels, datasets) {
    const ctx = document.getElementById('graph-canvas').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Historical Data'
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
markerFromData('./data/Sensory Measurements/Tra Vinh/JSON_proc/travinh-locations.json', 'Tra Vinh');

markerFromData('./data/Sensory Measurements/Soc Trang/JSON_proc/soctrang-locations.json', 'Soc Trang');

console.log(Object.getOwnPropertyNames(mapMarkers).length);



const searchBox = document.getElementById('search-box');
const searchButton = document.getElementById('search-button');

function searchUser() {
    const query = searchBox.value;
    console.log('Search query:', query);

    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&access_token=${mapboxgl.accessToken}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                console.log(data.features[0].geometry.coordinates);
            } else {
                console.log('No results found');
            }
        })
        .catch(error => {
            console.error('Error fetching geocoding results:', error);
        });
}


function makeVisibleProvince(province) {
    for (const [location, marker] of Object.entries(mapMarkers)) {
        if (province === marker.province) {
            marker.getElement().classList.remove('hidden-marker');
        }
    }
}

function makeHiddenProvince(province) {
    for (const [location, marker] of Object.entries(mapMarkers)) {
        if (province === marker.province) {
            marker.getElement().classList.add('hidden-marker');
        }
    }
}



function searchProvince() {
    const query = searchBox.value.trim();
    // Hide all markers first
    for (const [location, marker] of Object.entries(mapMarkers)) {
        marker.getElement().classList.add('hidden-marker');
    }

    // Show markers that match the search query
    for (const [location, marker] of Object.entries(mapMarkers)) {
        if (marker.province === query) {
            marker.getElement().classList.remove('hidden-marker');
        }
    }
}

searchButton.addEventListener('click', searchProvince);

searchBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchProvince();
    }
});
