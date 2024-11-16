const fs = require('fs').promises;
const path = require('path');


// Function to fetch JSON data from a file
async function fetchJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading or parsing JSON file:', err);
        throw err;
    }
}

    
// Function to perform a search using the Google Geocoding API
async function performSearch(query) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=AIzaSyD6LG6WlS6rxBNyTQe85CaBpejmo6ow1B4`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return [location.lat, location.lng];
        } else {
            console.log(`No results found for ${query}`);
        }
    } catch (error) {
        console.error('Error fetching geocoding results:', error);
    }
    return "Unknown"; // Return "Unknown" if no results found
}

// Function to iterate over data and fetch coordinates
async function iterData(inputFilePath, outputFilePath) {
    try {
        const json = await fetchJSON(inputFilePath);
        const newData = {
            date_created: json.date_created,
            datetime_format: json.datetime_format,
            data: []
        };
        
        if (json && json.data) {
            for (const item of json.data) {
                const coordinates = await performSearch(item.location);
                const newItem = {
                    ...item,
                    coordinates: coordinates
                };
                newData.data.push(newItem);
            }
        }

        // Write the new JSON data to a file
        await fs.writeFile(outputFilePath, JSON.stringify(newData, null, 2));
        console.log('New JSON file created:', outputFilePath);
    } catch (err) {
        console.error('Error processing data:', err);
    }
}

const inputFilePathst = path.join(__dirname, './data/Sensory Measurements/Soc Trang/JSON/soctrang-2023_12_05.json');
const outputFilePathst = path.join(__dirname, './data/Sensory Measurements/Soc Trang/JSON_proc/soctrang-locations.json');

const inputFilePathtv = path.join(__dirname, './data/Sensory Measurements/Tra Vinh/JSON/travinh-2023_08_11.json');
const outputFilePathtv = path.join(__dirname, './data/Sensory Measurements/Tra Vinh/JSON_proc/travinh-locations.json');



iterData(inputFilePathtv, outputFilePathtv);
