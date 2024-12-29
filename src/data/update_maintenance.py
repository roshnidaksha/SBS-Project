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
            "overallMileage": 0,  # This tracks the overall mileage
            "lastUpdated": "2025-01-01"  # Starting from January 1st, 2025
        }
        trains.append(train)
    return {"trains": trains}

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
  Distribute available people across track types
"""
def initialize_people_allocation(available_people, track_types):
    return {
        "E1-E5": (available_people // 11) * 7,
        "MinOH-MajOH": (available_people // 11) * 4
    }

"""
Forecast_schedule for the next 2 weeks
"""
def schedule_maintenance(trains, existing_schedule, current_date, manpower_schedule):
    pending_tasks = [] # To store the tasks that couldn't be scheduled on the current day

    HOURS_PER_TRACK = {track: WORKDAY_HOURS for track in range(1, 8)}  # Tracks E1-E5
    OVERHAUL_TRACKS = {track: WORKDAY_HOURS for track in range(1, 5)}  # Tracks MinOH-MajOH
    
    current_date_str = current_date.strftime("%Y-%m-%d")
    daily_schedule = {"date": current_date_str, "tasks": []}

    track_types = ["E1-E5", "MinOH-MajOH"]

    # Get available manpower for the day
    manpower = len(manpower_schedule.get(current_date_str, {}).get("projected_present", []))
    if manpower <= 0:
      return []

    available_people_by_track = initialize_people_allocation(manpower, track_types)
    remaining_people = manpower
    
    # Check existing tasks for the day
    existing_tasks = next((day['tasks'] for day in existing_schedule if day['date'] == current_date_str), [])

    # Preserve valid tasks from the existing schedule
    for task in existing_tasks:
        train = next(train for train in trains if train['trainNo'] == task['trainNo'])
        maintenance_type = task['maintenanceType']

        # Check if the task is still required
        if train['maintenanceTimers'][maintenance_type] >= MAINTENANCE_THRESHOLDS[maintenance_type]:
            # Preserve the task
            daily_schedule["tasks"].append(task)

            # Reset the maintenance timer for the train
            train['maintenanceTimers'][maintenance_type] = 0
            
            track_id = int(task["track"].split("_")[1])
            if task["track"].startswith("E1-E5"):
                HOURS_PER_TRACK[track_id] -= task["timeRequired"]
                available_people_by_track["E1-E5"] -= task["peopleRequired"]
            else:
                OVERHAUL_TRACKS[track_id] -= task["timeRequired"]
                available_people_by_track["MinOH-MajOH"] -= task["peopleRequired"]
            remaining_people -= task["peopleRequired"]
        else:
            # Maintenance is no longer required; do not retain the task
            pass

    # Add new tasks to fill the gaps
    for train in trains:
        for maintenance_type, threshold in MAINTENANCE_THRESHOLDS.items():
            if train['maintenanceTimers'][maintenance_type] >= threshold:
                # Ensure this train is not already scheduled today
                if not any(task['trainNo'] == train['trainNo'] and task['maintenanceType'] == maintenance_type for task in daily_schedule['tasks']):
                    task = {
                        "trainNo": train['trainNo'],
                        "maintenanceType": maintenance_type,
                        "track": None,
                        "baseTimeRequired": MANHOUR_THRESHOLDS[maintenance_type],
                        "maxPeople": 5,
                        "timeRequired": None,
                        "startTime": None,
                        "endTime": None,
                        "peopleRequired": None
                    }
                    
                    assigned, remaining_people = assign_tracks_with_people(
                        task, HOURS_PER_TRACK, OVERHAUL_TRACKS, available_people_by_track, remaining_people
                    )

                    # If no track is available, add to pending tasks
                    if not assigned:
                        pending_tasks.append(task)
                    else:
                        # Reset the maintenance timer for the train
                        train['maintenanceSchedules'][maintenance_type].append({
                            "date": current_date.strftime("%Y-%m-%d"),
                            "mileage": train['currentMileage']
                        })
                        train['maintenanceTimers'][maintenance_type] = 0
                        daily_schedule["tasks"].append(task)
                        
    redistribute_remaining_people(daily_schedule["tasks"], remaining_people)
    return daily_schedule

"""
  Round minutes to the nearest 15-minute interval.
"""
def round_to_nearest_15(minutes):
    return 15 * round(minutes / 15)
  
"""
  Round minutes up to the nearest 15-minute interval.
"""
def round_up_to_nearest_15(minutes):
    return 15 * ((minutes + 14) // 15)

"""
  Redistribute leftover people to tasks for additional support
"""
def redistribute_remaining_people(tasks, remaining_people):
    for task in tasks:
        if remaining_people <= 0:
            break
        task["peopleRequired"] += 1
        remaining_people -= 1

"""
  Try to assign a track to a maintenance task. Return True if a track is assigned, False otherwise.
"""
def assign_tracks_with_people(task, hours_per_track, overhaul_tracks, available_people_by_track, remaining_people):
    track_type = "E1-E5" if task["maintenanceType"] in ["E1", "E2", "E3", "E4", "E5"] else "MinOH-MajOH"
    available_tracks = hours_per_track if track_type == "E1-E5" else overhaul_tracks
    people_pool = available_people_by_track[track_type]
    
    for track_id, remaining_hours in available_tracks.items():
        max_people_for_task = min(task["maxPeople"], people_pool, remaining_people)
        if max_people_for_task <= 0:
            continue
            
        time_required = task["baseTimeRequired"] / max_people_for_task
        if remaining_hours >= time_required:
            task["track"] = f"{track_type}_{track_id + 1}"
            
            start_time = WORK_START_TIME + (WORKDAY_HOURS - remaining_hours)
            start_time_minutes = round_to_nearest_15(start_time * 60)
            task["startTime"] = start_time_minutes / 60
            
            raw_end_time = task["startTime"] + time_required
            end_time_minutes = round_up_to_nearest_15(raw_end_time * 60)
            task["endTime"] = end_time_minutes / 60
            
            # Update task details
            task["timeRequired"] = time_required
            task["peopleRequired"] = max_people_for_task

            available_people_by_track[track_type] -= max_people_for_task
            remaining_people -= max_people_for_task
            
            used_time = task["endTime"] - task["startTime"]
            available_tracks[track_id] -= used_time
            return True, remaining_people  # Track assigned successfully
    return False, remaining_people  # No track available

"""
  Update mileage for each train with real mileage value obtained after every day
"""
def update_one_day_train_data(trains, current_date, mileage):
    for train in trains:
        train_no = train['trainNo']
        real_mileage = mileage.get(train_no, 0)  # Default mileage to 0 if not provided

        # Ensure mileage is valid
        if real_mileage < 0:
            raise ValueError(f"Mileage for train {train_no} cannot be negative")

        # Define the standard mileage per day
        STANDARD_MILEAGE = 660

        # Calculate the difference
        mileage_difference = STANDARD_MILEAGE - real_mileage

        train['overallMileage'] -= mileage_difference
        train['currentMileage'] -= mileage_difference
        for track in MAINTENANCE_THRESHOLDS.keys():
            train['maintenanceTimers'][track] -= mileage_difference

        # Update the last updated date
        train['lastUpdated'] = current_date.strftime("%Y-%m-%d")

    return trains
  
"""
  Update mileage for each train for 1 day with default value (simulate the daily travel)
"""
def update_mileage_one_day(trains, current_date):
    for train in trains:
        train['overallMileage'] += 660  # Increment overall mileage (660 km per day)
        train['currentMileage'] += 660  # Increment current mileage for specific checks
            
        # Increment the timers for each maintenance track based on the current mileage
        for track in MAINTENANCE_THRESHOLDS.keys():
            train['maintenanceTimers'][track] += 660  # Increment each track's maintenance timer
            
        train['lastUpdated'] = current_date.strftime("%Y-%m-%d")
    return trains

"""
  Main function to simulate daily maintenance updates
"""
def weekly_forecast(start_date):
    # Load the existing train data or generate initial data if not found
    train_data = load_data('train_data.json')
    if not train_data:
        train_data = generate_initial_train_data(92)  # Generate initial data for 92 trains
        
    # Load the existing schedule or use empty list if not found
    existing_schedule = load_data('maintenance_schedule.json') or []
        
    # Load the existing schedule or use empty list if not found
    manpower_schedule = load_data('manpower.json') or {}
    
    # Starting date for simulation (Jan 1st, 2025)
    # start_date = datetime(2025, 1, 1)
    
    # Simulate daily updates for 16 days
    new_schedule = []
    # Update mileage for all trains
    last_update = datetime.strptime(train_data['trains'][0]['lastUpdated'], '%Y-%m-%d')
    if start_date == last_update + timedelta(days=7) or train_data['trains'][0]['overallMileage'] == 0:
        for day in range(365):
          current_date = start_date + timedelta(days=day)
          train_data['trains'] = update_mileage_one_day(train_data['trains'], current_date)
        
          # Schedule maintenance based on mileage thresholds
          s = schedule_maintenance(train_data['trains'], existing_schedule, current_date, manpower_schedule)
          if s:
            new_schedule.append(s)
        
    # Save the updated train data back to the file after each day's update
    save_data('train_data.json', train_data)
    save_data('maintenance_schedule.json', new_schedule)

# Run the function
if __name__ == "__main__":
    start_date = datetime(2025, 1, 1)
    weekly_forecast(start_date)