import json
from collections import defaultdict

# Load train data
def load_train_data():
    try:
        with open('train_data.json', 'r') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading train data: {e}")
        return None

# Count the total number of maintenance schedules and the clashes on each track
def count_total_maintenance_schedules_and_clashes():
    # Load the train data
    train_data = load_train_data()
    if not train_data:
        return

    total_schedules = 0
    maintenance_dates_by_track = defaultdict(lambda: defaultdict(list))  # Track maintenance dates by track

    # Loop through each train and its maintenance schedules
    for train in train_data['trains']:
        for track, schedules in train['maintenanceSchedules'].items():
            total_schedules += len(schedules)  # Count the number of maintenance schedules for each track
            
            # Record the maintenance dates for clash checking on the specific track
            for schedule in schedules:
                maintenance_dates_by_track[track][schedule["date"]].append(train["trainNo"])

    # Count the number of maintenance clashes for each track
    clashes_by_track = defaultdict(int)
    for track, dates in maintenance_dates_by_track.items():
        for date, trains in dates.items():
            if len(trains) > 1:  # If multiple trains are scheduled on the same date
                clashes_by_track[track] += 1

    # Output the results
    print(f"Total number of maintenance schedules: {total_schedules}")
    for track, clashes in clashes_by_track.items():
        print(f"Clashes on track {track}: {clashes}")

# Run the script
if __name__ == "__main__":
    count_total_maintenance_schedules_and_clashes()
