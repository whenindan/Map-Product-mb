

CREATE TABLE IF NOT EXISTS water_quality_data (
    date DATE,
    time TIME,
    location VARCHAR(255),
    
    -- Measurements
    nhiet_do_nuoc FLOAT,              -- Vietnamese for temperature
    temperature FLOAT,
    do_man FLOAT,                     -- Vietnamese for salinity
    salinity FLOAT,
    ph FLOAT,
    kiem FLOAT,                       -- Vietnamese for alkalinity
    alkalinity FLOAT,
    do_trong FLOAT,                   -- Vietnamese for transparency
    transparency FLOAT,
    dissolved_oxygen FLOAT,
    do_hoa_tan FLOAT,                 -- Vietnamese for dissolved oxygen
    do_man_so_voi_nam_truoc FLOAT,    -- Vietnamese for salinity comparison
    salinity_comparison_previous_year FLOAT
);
