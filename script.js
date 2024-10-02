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

function showGraphTest(location){
    console.log(location);
    
    const ctx = document.getElementById('graph-canvas');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],   
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  
}

let currentMeasurementIndex = 0; // To keep track of the current measurement type

function showGraph(location) {
    const historicalDataPath = `./data/Sensory Measurements/Soc Trang/JSON_proc/compiled_historical_data_st.json`;

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



                // Function to render the chart based on selected measurement type
                function renderChart(index) {
                    const selectedMeasurement = locationData.measurements[index];
                    const dates = selectedMeasurement.data.map(dataPoint => dataPoint.date);
                    const values = selectedMeasurement.data.map(dataPoint => parseFloat(dataPoint.value));

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

                // Render initial chart
                renderChart(currentMeasurementIndex);

                // Change measurement type when dropdown selection changes
                measurementSelect.addEventListener('change', (event) => {
                    currentMeasurementIndex = parseInt(event.target.value);
                    renderChart(currentMeasurementIndex);
                    backButton.style.display = 'inline'; // Show back button
                });

                // Handle back button click to go back to the previous measurement
                backButton.addEventListener('click', () => {
                    if (currentMeasurementIndex > 0) {
                        currentMeasurementIndex--;
                        measurementSelect.value = currentMeasurementIndex; // Update dropdown
                        renderChart(currentMeasurementIndex);
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

// Event listener for the search button
searchButton.addEventListener('click', searchProvince);

// Event listener for pressing "Enter" in the search box
searchBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {    
        event.preventDefault();
        searchProvince();
    }
});