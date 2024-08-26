import os
import json
from collections import defaultdict

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

# Assign directory
directory_st = 'data/Sensory Measurements/Soc Trang/JSON'
directory_tv = 'data/Sensory Measurements/Tra Vinh/JSON'

# Dictionary to hold all records


# Iterate over files in the directory
def data_comp(directory):
    global all_records
    all_records = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
    for filename in os.scandir(directory):
        if filename.is_file() and filename.name.endswith('.json'):
            filepath = os.path.join(directory, filename.name)
            file_records = extract_data_from_file(filepath)
            for location, measurements in file_records.items():
                for measurement, data in measurements.items():
                    all_records[location][measurement]['date_created'].extend(data['date_created'])
                    all_records[location][measurement]['value'].extend(data['value'])

# Save the compiled data to a new JSON file
output_filepath_tv = 'data/Sensory Measurements/Tra Vinh/JSON_proc/compiled_historical_data_tv.json'
output_filepath_st = 'data/Sensory Measurements/Soc Trang/JSON_proc/compiled_historical_data_st.json'

data_comp(directory_st)
with open(output_filepath_st, 'w', encoding='utf-8') as outfile:
    json.dump(all_records, outfile, ensure_ascii=False, indent=4)
data_comp(directory_tv)
with open(output_filepath_tv, 'w', encoding='utf-8') as outfile:
    json.dump(all_records, outfile, ensure_ascii=False, indent=4)  