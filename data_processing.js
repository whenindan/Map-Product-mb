const fs = require('fs').promises; // Use the promises API for fs
const path = require('path');


// Asynchronous function to fetch JSON data from a file
async function fetchJSON(dirr) {
    const filePath = path.join(__dirname, dirr);
    try {
        const data = await fs.readFile(filePath, 'utf8'); // Await the file reading operation
        const json = JSON.parse(data); // Parse the JSON data
        return json; // Return the parsed JSON data
    } catch (err) {
        console.error('Error reading or parsing JSON file:', err);
        throw err; // Re-throw the error to handle it in the calling function
    }
}

// Asynchronous function to perform a search using the Mapbox API
// async function performSearch(query) {
//     //const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&access_token=pk.eyJ1Ijoibmd0cmRhdCIsImEiOiJjbHlkeHN4MmQwOXdkMnFvOW94Y2o4c29vIn0.b1vqUVEDdkEU0IYEYACoWw`;
//     const url2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=AIzaSyD6LG6WlS6rxBNyTQe85CaBpejmo6ow1B4`;
//     try {
//         const response = await fetch(url2); // Await the network request
//         const data = await response.json(); // Await and parse the response JSON
//         if (data.features && data.features.length > 0) {
//             for (const item of data.features) {
//                 if (item.properties.context.country.country_code === 'VN') {
//                     return item.geometry.coordinates; // Return the coordinates if country code matches
//                 }
//             }
//         }
//         console.log(`No results found for ${query}`);
//     } catch (error) {
//         console.error('Error fetching geocoding results:', error);
//     }
//     return null; // Return null if no results found
// }



async function performSearch(query) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=AIzaSyD6LG6WlS6rxBNyTQe85CaBpejmo6ow1B4`;

    try {
        const response = await fetch(url); // Await the network request
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json(); // Await and parse the response JSON
        console.log(data); // Print the response data for debugging
        
        if (data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return [location.lat, location.lng]; // Return the coordinates
        } else {
            console.log(`No results found for ${query}`);
        }
    } catch (error) {
        console.error('Error fetching geocoding results:', error);
    }
    return null; // Return null if no results found
}

// Test the performSearch function


// Asynchronous function to iterate over data and fetch coordinates
async function iterData(dirr) {
    console.log("YES");
    try {
        const json = await fetchJSON(dirr); // Await the result of fetchJSON
        console.log(json); // Log the fetched JSON data

        if (json && json.data) { // Check if data exists in the JSON
            for (const item of json.data) {
                const coordinates = await performSearch(item.location); // Await the result of performSearch
                if (coordinates) {
                    console.log(`Location: ${item.location}, Coordinates: ${coordinates}`);
                }
            }
        }
    } catch (err) {
        console.error('Error processing data:', err);
    }
}

// Call the function to fetch and process the JSON data
iterData('./data/Sensory Measurements/Soc Trang/JSON/soctrang-2023_12_05.json');
