import os
import json
import csv
from collections import defaultdict
from datetime import datetime

# Function to read and extract data from a single JSON file
def extract_data_from_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    date_created = data['date_created']
    records = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
    
    for entry in data['data']:
        location = entry['location']
        for key, value in entry.items():
            if key not in ['location', 'time']:
                records[location][key]['date_created'].append(date_created)
                records[location][key]['value'].append(value['value'])
    
    return records

# Function to extract the date from the file name (assuming date is in YYYY-MM-DD format in file names)
def extract_date_from_filename(filename):
    try:
        date_str = filename.split('.')[0]  # Assuming file name structure: YYYY-MM-DD.json
        return datetime.strptime(date_str, '%Y-%m-%d')
    except ValueError:
        return None

# Flatten the data and write to CSV
def write_csv_files(directory, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Get list of all files and sort them by date
    file_list = sorted([f for f in os.scandir(directory) if f.is_file() and f.name.endswith('.json')],
                       key=lambda x: extract_date_from_filename(x.name) or datetime.min)

    # Prepare data structures for CSV
    date_created_set = set()
    data_entries = []

    for file_entry in file_list:
        filepath = os.path.join(directory, file_entry.name)
        file_records = extract_data_from_file(filepath)
        
        for location, measurements in file_records.items():
            for measurement, data in measurements.items():
                for i in range(len(data['date_created'])):
                    date_created = data['date_created'][i]
                    value = data['value'][i]
                    data_entries.append([date_created, location, measurement, value])
                    date_created_set.add(date_created)

    # Write to CSV file
    with open(os.path.join(output_dir, 'compiled_data.csv'), 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['date_created', 'location', 'measurement', 'value'])
        csv_writer.writerows(data_entries)

# Assign directories and file paths
directory_st = 'data/Sensory Measurements/Soc Trang/JSON'
directory_tv = 'data/Sensory Measurements/Tra Vinh/JSON'
output_dir_st = 'data/Sensory Measurements/Soc Trang/CSV'
output_dir_tv = 'data/Sensory Measurements/Tra Vinh/CSV'

# Run the compilation and save the outputs
write_csv_files(directory_st, output_dir_st)
write_csv_files(directory_tv, output_dir_tv)
