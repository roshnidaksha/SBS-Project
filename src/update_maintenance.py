import json
from datetime import datetime, timedelta

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

# Generate initial train data
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
            "overallMileage": 0,  # This tracks the overall mileage
            "lastUpdated": "2025-01-01"  # Starting from January 1st, 2025
        }
        trains.append(train)
    return {"trains": trains}

# Load existing data
def load_train_data():
    try:
        with open('train_data.json', 'r') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

# Save updated data
def save_train_data(data):
    try:
        with open('train_data.json', 'w') as file:
            json.dump(data, file, indent=4)
        print("Data written successfully to train_data.json")
    except Exception as e:
        print(f"Error saving data: {e}")

# Calculate the next maintenance day and schedule it
def schedule_maintenance(trains, current_date):
    for train in trains:
        for track, threshold in MAINTENANCE_THRESHOLDS.items():
            # Check if the maintenance timer for this track has exceeded the threshold
            if train['maintenanceTimers'][track] >= threshold:
                # Schedule maintenance for the day
                train['maintenanceSchedules'][track].append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "mileage": train['currentMileage']
                })
                # Reset the specific timer for this track
                train['maintenanceTimers'][track] = 0  # Reset the timer for this track

    return trains

# Update mileage for each train (simulate the daily travel)
def update_mileage(trains, current_date):
    for train in trains:
        train['overallMileage'] += 660  # Increment overall mileage (660 km per day)
        train['currentMileage'] += 660  # Increment current mileage for specific checks
        
        # Increment the timers for each maintenance track based on the current mileage
        for track in MAINTENANCE_THRESHOLDS.keys():
            train['maintenanceTimers'][track] += 660  # Increment each track's maintenance timer
        
        train['lastUpdated'] = current_date.strftime("%Y-%m-%d")
    return trains

# Main function to simulate daily maintenance updates
def update_daily_maintenance():
    # Load the existing train data or generate initial data if not found
    train_data = load_train_data()
    if not train_data:
        train_data = generate_initial_train_data(92)  # Generate initial data for 92 trains
    
    # Starting date for simulation (Jan 1st, 2025)
    start_date = datetime(2025, 1, 1)
    
    # Simulate daily updates for 365 days
    for day in range(365):
        current_date = start_date + timedelta(days=day)
        
        # Update mileage for all trains
        train_data['trains'] = update_mileage(train_data['trains'], current_date)
        
        # Schedule maintenance based on mileage thresholds
        train_data['trains'] = schedule_maintenance(train_data['trains'], current_date)
        
        # Save the updated train data back to the file after each day's update
        save_train_data(train_data)

# Run the function
if __name__ == "__main__":
    update_daily_maintenance()
