mapboxgl.accessToken = 'pk.eyJ1Ijoibmd0cmRhdCIsImEiOiJjbHlkeHN4MmQwOXdkMnFvOW94Y2o4c29vIn0.b1vqUVEDdkEU0IYEYACoWw';

const map = new mapboxgl.Map({
  container: 'map', // HTML container id
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: [108, 14], // starting position as [lng, lat]
  zoom: 6
});

const infoDiv = document.getElementById('marker-info');


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
                    displayInfo(item);
                });
            }

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
    
    if (mapMarkers[item.location].province == 'Soc Trang'){
        infoContent += `<button id="show-graph-button" onclick="showGraph('${item.location}')">Show Graph</button>`;
    }
    
    infoContent += `</div>`;
    infoDiv.innerHTML = infoContent;
}


let currentMeasurementIndex = 0; // To keep track of the current measurement type

function showGraph(location) {
    const historicalDataPath = `../data/Sensory Measurements/Soc Trang/JSON_proc/compiled_historical_data_st.json`;

    fetch(historicalDataPath)
        .then(response => response.json())
        .then(data => {
            const locationData = data.find(entry => entry.location === location);    
            if (locationData) {
                console.log(`Found location: ${locationData.location}`);

                // Create a dropdown for measurement types
                const measurementSelect = document.getElementById('measurement-select');
                measurementSelect.innerHTML = ''; // Clear existing options
                
                locationData.measurements.forEach((measurement, index) => {
                    const option = document.createElement('option');
                    option.value = index; // Use the index to identify measurement type
                    option.textContent = measurement.type; // Display measurement type in the dropdown
                    measurementSelect.appendChild(option);
                });

                // Render initial chart
                renderChart(locationData, currentMeasurementIndex);

                // Change measurement type when dropdown selection changes
                measurementSelect.addEventListener('change', (event) => {
                    currentMeasurementIndex = parseInt(event.target.value);
                    renderChart(locationData, currentMeasurementIndex);
                    backButton.style.display = 'inline'; // Show back button
                });

                // Handle back button click to go back to the previous measurement
                backButton.addEventListener('click', () => {
                    if (currentMeasurementIndex > 0) {
                        currentMeasurementIndex--;
                        measurementSelect.value = currentMeasurementIndex; // Update dropdown
                        renderChart(locationData, currentMeasurementIndex);
                    }
                    // Hide back button if at the first measurement
                    backButton.style.display = currentMeasurementIndex > 0 ? 'inline' : 'none';
                });
            } else {
                console.log("Location not found.");
            }
        })
        .catch(error => console.error('Error loading data:', error));
}

// Function to render the chart based on selected measurement type
function renderChart(locationData, index) {
    const selectedMeasurement = locationData.measurements[index];
    
    // Sort data points by date
    const sortedData = selectedMeasurement.data.sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA - dateB;
    });

    const dates = sortedData.map(dataPoint => dataPoint.date);
    const values = sortedData.map(dataPoint => parseFloat(dataPoint.value));

    const ctx = document.getElementById('graph-canvas').getContext('2d');
    // Clear any existing chart instances
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: selectedMeasurement.type,
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
    });
}



markerFromData('../data/Sensory Measurements/Tra Vinh/JSON_proc/travinh-locations.json', 'Tra Vinh');

markerFromData('../data/Sensory Measurements/Soc Trang/JSON_proc/soctrang-locations.json', 'Soc Trang');





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



// Function to show markers from the selected province or all markers
function searchProvince() {
    const query = searchBox.value;

    if (query === 'Show all') {
        // Make all markers visible
        makeVisibleProvince('Soc Trang');
        makeVisibleProvince('Tra Vinh');
    } else if (query === 'Soc Trang' || query === 'Tra Vinh') {
        // Make markers from the selected province visible and hide others
        makeVisibleProvince(query);
        if (query === 'Soc Trang') {
            makeHiddenProvince('Tra Vinh');
        } else {
            makeHiddenProvince('Soc Trang');
        }
    }
}

const suggestionsBox = document.getElementById('suggestions');
let activeMarker = null;

function searchLocations(query) {
    const matchedLocations = Object.keys(mapMarkers).filter(location => 
        location.toLowerCase().includes(query.toLowerCase())
    );

    suggestionsBox.innerHTML = '';
    matchedLocations.forEach(location => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = location;
        suggestionItem.addEventListener('click', () => {
            highlightMarker(location);
            searchBox.value = location;
            suggestionsBox.style.display = 'none';
        });
        suggestionsBox.appendChild(suggestionItem);
    });
    suggestionsBox.style.display = matchedLocations.length ? 'block' : 'none';
}

function highlightMarker(location) {
    // Remove any previous active marker class if one is already active


    // Set the active marker to the one specified by location
    activeMarker = mapMarkers[location];


    // Center the map on the active marker and zoom in
    map.flyTo({ center: activeMarker.getLngLat(), zoom: 13 });
}


searchBox.addEventListener('input', (event) => {
    const query = event.target.value.trim();
    if (query) {
        searchLocations(query);
    } else {
        suggestionsBox.style.display = 'none';
    }
});

// Event listener for the search button
searchButton.addEventListener('click', searchProvince);

// Event listener for pressing "Enter" in the search box
searchBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {    
        event.preventDefault();
        searchProvince();
    }
});

