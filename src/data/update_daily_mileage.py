import csv
import random

from standard_functions import MAINTENANCE_THRESHOLDS 
      
"""
  Function to generate random data for real time mileage recorded from trains
"""
def generate_train_mileage_values():    
    timers = {}
    previous_value = random.randint(600, MAINTENANCE_THRESHOLDS['E1'])  # Start with E1
    timers['E1'] = previous_value

    for timer in ['E2', 'E3', 'E4', 'E5', 'MinOH', 'MajOH']:
        max_increment = MAINTENANCE_THRESHOLDS[timer] - previous_value
        increment = random.randint(1, min(20000, max_increment))  # Random increment capped at 20,000
        previous_value += increment
        timers[timer] = previous_value
        
    overall_mileage = timers['MajOH']

    return overall_mileage, timers

"""
  Function to create a csv file with random mileage records
"""  
def generate_train_csv(csv_file_path): 
    train_data = []
    for i in range(1, 93):
        train_no = f"PV{i:02d}"  # Format train number to have leading zeroes
        overall_mileage, timers = generate_train_mileage_values()
        train_data.append([train_no, overall_mileage] + list(timers.values()))
    
    headers = ["train_no", "overall_mileage", "E1", "E2", "E3", "E4", "E5", "MinOH", "MajOH"]

    # Write the data to CSV
    with open(csv_file_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(headers)  # Write the headers
        writer.writerows(train_data)  # Write the train data rows
        
"""
  Convert a csv file to json format
"""
def convert_csv_to_json(csv_file_path):
    trains_data = []
    with open(csv_file_path, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            train = {
                "trainNo": row["train_no"],
                "maintenanceTimers": {
                    "E1": int(row["E1"]),
                    "E2": int(row["E2"]),
                    "E3": int(row["E3"]),
                    "E4": int(row["E4"]),
                    "E5": int(row["E5"]),
                    "MinOH": int(row["MinOH"]),
                    "MajOH": int(row["MajOH"]),
                },
                "currentMileage": int(row["overall_mileage"]),
                "overallMileage": int(row["overall_mileage"]),
            }
            trains_data.append(train)

    return {"trains": trains_data}
  
"""
  Update mileage for each train with real mileage value obtained after every day
"""
def update_one_day_train_data(trains, current_date, mileage):
    mileage_dict = {entry['trainNo']: entry for entry in mileage}
    for train in trains:
        train_no = train['trainNo']
        real_mileage = mileage_dict.get(train_no)  # Default mileage to 0 if not provided

        # Ensure mileage is valid
        if not real_mileage:
            raise ValueError(f"Mileage for train {train_no} is not in correct format")

        train['overallMileage'] = real_mileage['overallMileage']
        train['currentMileage'] = real_mileage['currentMileage']
        for track in MAINTENANCE_THRESHOLDS.keys():
            train['maintenanceTimers'][track] = real_mileage['maintenanceTimers'][track]

        # Update the last updated date
        train['lastUpdated'] = current_date.strftime("%Y-%m-%d")
        
    return {"trains": trains}