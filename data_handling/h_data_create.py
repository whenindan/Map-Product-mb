import os
import json
from collections import defaultdict

# Function to read and extract data from a single JSON file
def extract_data_from_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    records = defaultdict(lambda: defaultdict(list))
    
    for entry in data['data']:
        location = entry['location']
        date_created = data['date_created']
        for key, value in entry.items():
            if key not in ['location', 'time']:
                records[location][key].append({
                    'date': date_created,
                    'value': value['value']
                })

    return records

# Function to format the data into the desired structure

def format_data(records):
    formatted_data = []
    for location, measurements in records.items():
        location_data = {
            'location': location,
            'measurements': []
        }
        for measurement, data_points in measurements.items():
            
            measurement_data = {
                'type': measurement,
                'data': sorted(data_points, key=lambda x: x['date'])
            }
            location_data['measurements'].append(measurement_data)
        formatted_data.append(location_data)
    return formatted_data

# Function to iterate over files and compile data
def compile_data(directory):
    all_records = defaultdict(lambda: defaultdict(list))
    for filename in os.scandir(directory):
        if filename.is_file() and filename.name.endswith('.json'):
            filepath = os.path.join(directory, filename.name)
            file_records = extract_data_from_file(filepath)
            for location, measurements in file_records.items():
                for measurement, data_points in measurements.items():
                    all_records[location][measurement].extend(data_points)
    return format_data(all_records)

# Save the compiled and formatted data to a new JSON file
def save_to_file(directory, output_filepath):
    formatted_data = compile_data(directory)
    with open(output_filepath, 'w', encoding='utf-8') as outfile:
        json.dump(formatted_data, outfile, ensure_ascii=False, indent=4)

# Assign directory and output file path
directory = 'data/Sensory Measurements/Soc Trang/JSON'
output_filepath = 'data/Sensory Measurements/Soc Trang/JSON_proc/compiled_historical_data_st.json'

# Run the compilation and save the output
save_to_file(directory, output_filepath)
