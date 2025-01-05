import json

# Define maintenance thresholds
MAINTENANCE_THRESHOLDS = {
    'E1': 10800,
    'E2': 32500,
    'E3': 65000,
    'E4': 130000,
    'E5': 325000,
    'MinOH': 650000,
    'MajOH': 975000
}

# Define manhour thresholds
MANHOUR_THRESHOLDS = {
    'E1': 10,
    'E2': 18.1,
    'E3': 33.4,
    'E4': 135.2,
    'E5': 250,
    'MinOH': 800,
    'MajOH': 2400
}

WORKDAY_HOURS = 8  # Define daily work hours per track
WORK_START_TIME = 8 # Assuming work starts at 8 AM

# Load existing data
def load_data(file_name):
    try:
        with open(file_name, 'r') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

# Save updated data
def save_data(file_name, data):
    try:
        with open(file_name, 'w') as file:
            json.dump(data, file, indent=4)
        print("Data written successfully to", file_name)
    except Exception as e:
        print(f"Error saving data: {e}")
        
        
"""
  Generate initial train data for num_trains number of trains  
"""
def generate_initial_train_data(num_trains):
    trains = []
    for i in range(1, num_trains + 1):
        train = {
            "trainNo": f"PV{i:02d}",
            "initialMileage": 0,
            "maintenanceTimers": {  # Independent timers for each maintenance type
                "E1": 0,
                "E2": 0,
                "E3": 0,
                "E4": 0,
                "E5": 0,
                "MinOH": 0,
                "MajOH": 0
            },
            "maintenanceSchedules": {
                "E1": [],
                "E2": [],
                "E3": [],
                "E4": [],
                "E5": [],
                "MinOH": [],
                "MajOH": []
            },
            "currentMileage": 0,
            "overallMileage": 0,
            "lastUpdated": "2025-01-01"
        }
        trains.append(train)
    return {"trains": trains}
