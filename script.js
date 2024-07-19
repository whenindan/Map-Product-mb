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

const marker = new mapboxgl.Marker()
  .setLngLat([-21.92661562, 64.14356426])
  .setPopup(popup)
  .addTo(map);

function getPos(){
    event.preventDefault();
    let lat = document.getElementById("latitude").value;
    let lon = document.getElementById("longitude").value;
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    if ((lat<-90 || lat>90) || 
        (lon<-180 || lon>180) ||
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

function markerFromData(dirr) {
    fetch(dirr)
        .then((response) => response.json())
        .then((data) => {
            for (const item of data.data) {
                if (item.coordinates === 'Unknown') {
                    continue;
                }
                const lat = parseFloat(item.coordinates[0]);
                const lon = parseFloat(item.coordinates[1]);

                const marker = new mapboxgl.Marker()
                    .setLngLat([lon, lat])
                    .addTo(map);

                marker.getElement().addEventListener('click', () => {
                    try{
                        displayInfo(item);  
                    }
                    catch(error){
                        console.log(item.location);
                    }
                    
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching JSON:', error);
        });
}

function displayInfo(item) {
    let infoContent = `<h3>${item.location}</h3>`;
    
    for (const key in item) {
        if (item.hasOwnProperty(key) && key !== 'location' && key !== 'time' && key !== 'coordinates') {
            const value = item[key];
            infoContent += `<p>${value.name}: ${value.value} ${value.unit === 'none' ? '' : value.unit}</p>`;
        }
    }
    
    infoDiv.innerHTML = infoContent;
}

// function markerFromData(dirr) {
//     fetch(dirr)
//         .then((response) => response.json())
//         .then((data) => {
//             for (const item of data.data){
//                 if (item.coordinates=='Unknown'){
//                     continue;
//                 }  
//                 const popup = new mapboxgl.Popup().setHTML(
//                     `<h3>${item.location}</p>`
//                   );
//                 let lat = parseFloat(item.coordinates[0]);
//                 let lon = parseFloat(item.coordinates[1]);
//                 const marker = new mapboxgl.Marker()
//                 try{
//                     marker.setLngLat([lon,lat])
//                     marker.setPopup(popup)
//                     marker.addTo(map);                    
//                 } catch(error){
//                     console.log(item.location);
//                 }

                
//             }
      
//         })
//         .catch((error) => {
//             console.error('Error fetching JSON:', error);
//         });
// }

//function markerFromData(dirr) {
//     fetch(dirr)
//         .then((response) => response.json())
//         .then((data) => {
//             for (const item of data.data) {
//                 if (item.coordinates === 'Unknown') {
//                     continue;
//                 }
                
//                 const lat = parseFloat(item.coordinates[0]);
//                 const lon = parseFloat(item.coordinates[1]);

//                 const popupContent = `
//                     <h3>${item.location}</h3>
//                     <p>Time: ${item.time}</p>
//                     <p>Temperature: ${item["Nhiệt độ nước"].value} ${item["Nhiệt độ nước"].unit}</p>
//                     <p>Salinity: ${item["Độ mặn"].value} ${item["Độ mặn"].unit}</p>
//                     <p>pH: ${item.pH.value} ${item.pH.unit}</p>
//                     <p>Alkalinity: ${item.Kiềm.value} ${item.Kiềm.unit}</p>
//                     <p>Transparency: ${item["Độ trong"].value} ${item["Độ trong"].unit}</p>
//                     <p>Oxygen: ${item["Dissolved Oxygen (DO)"].value} ${item["Dissolved Oxygen (DO)"].unit}</p>
//                     <p>Salinity Comparison to Previous Year: ${item["Độ mặn so với năm trước"].value} ${item["Độ mặn so với năm trước"].unit}</p>
//                 `;

//                 const popup = new mapboxgl.Popup().setHTML(popupContent);

//                 const marker = new mapboxgl.Marker()
//                     .setLngLat([lon, lat])
//                     .setPopup(popup)
//                     .addTo(map);
//             }
//         })
//         .catch((error) => {
//             console.error('Error fetching JSON:', error);
//         });
// }
markerFromData('./data/Sensory Measurements/Tra Vinh/JSON_proc/travinh-locations.json');
markerFromData('./data/Sensory Measurements/Soc Trang/JSON_proc/soctrang-locations.json');

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

// Event listener for the search button
searchButton.addEventListener('click', searchUser);

// Event listener for the "space" key press in the search box
searchBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default space action (adding a space)
        searchUser();
    }
});


