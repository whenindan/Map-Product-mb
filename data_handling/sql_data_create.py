import os
import json
import sqlite3
from datetime import datetime

# Directories
directory = '../data/Sensory Measurements/Soc Trang/JSON'
sql_directory = '../data/sqldata'
database_file = os.path.join(sql_directory, 'water_quality_data.db')
compiled_sql_file = os.path.join(sql_directory, 'compiled_data.sql')

# Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect(database_file)
cursor = conn.cursor()

# Execute the compiled_data.sql file to create the table structure
with open(compiled_sql_file, 'r') as sql_file:
    compiled_sql = sql_file.read()
    cursor.executescript(compiled_sql)

# Loop through each JSON file in the directory
for filename in os.listdir(directory):
    file_path = os.path.join(directory, filename)
    
    # Check if it's a file
    if os.path.isfile(file_path):
        # Open and load the JSON file
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Extract date (assuming format is "dd/mm/yyyy" in the JSON file)
        date_str = data["date_created"]
        date_obj = datetime.strptime(date_str, "%d/%m/%Y")
        date = date_obj.date()  # Format to SQL DATE type
        
        # Insert each data point (location data)
        for entry in data["data"]:
            # Prepare SQL data fields with default to None if missing
            location = entry.get("location")
            time = entry.get("time")
            nhiet_do_nuoc = entry.get("Nhiệt độ nước", {}).get("value")
            temperature = nhiet_do_nuoc  # same as nhiet_do_nuoc for simplicity
            do_man = entry.get("Độ mặn", {}).get("value")
            salinity = do_man  # same as do_man for simplicity
            ph = entry.get("pH", {}).get("value")
            kiem = entry.get("Kiềm", {}).get("value")
            alkalinity = kiem  # same as kiem for simplicity
            do_trong = entry.get("Độ trong", {}).get("value")
            transparency = do_trong  # same as do_trong for simplicity
            dissolved_oxygen = entry.get("Dissolved Oxygen (DO)", {}).get("value")
            do_hoa_tan = dissolved_oxygen  # same as dissolved_oxygen for simplicity
            do_man_so_voi_nam_truoc = entry.get("Độ mặn so với năm trước", {}).get("value")
            salinity_comparison_previous_year = do_man_so_voi_nam_truoc  # same as do_man_so_voi_nam_truoc
            
            # Insert data into SQL table
            insert_query = '''
            INSERT INTO water_quality_data (
                date, time, location,
                nhiet_do_nuoc, temperature,
                do_man, salinity,
                ph,
                kiem, alkalinity,
                do_trong, transparency,
                dissolved_oxygen, do_hoa_tan,
                do_man_so_voi_nam_truoc, salinity_comparison_previous_year
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            '''
            cursor.execute(insert_query, (
                date, time, location,
                nhiet_do_nuoc, temperature,
                do_man, salinity,
                ph,
                kiem, alkalinity,
                do_trong, transparency,
                dissolved_oxygen, do_hoa_tan,
                do_man_so_voi_nam_truoc, salinity_comparison_previous_year
            ))

# Commit all inserts and close the connection
conn.commit()
conn.close()

print("Data has been successfully inserted into the database.")
