import random
from datetime import datetime, timedelta
from standard_functions import load_data, save_data

def update_team_details(absent):
    team_details = {"T1": 5, "T2": 5, "T3": 5, "T4": 5, "OH": 20}

    for id in absent:
        absent_id = int(id.split('_')[1])
        if 1 <= absent_id <= 5:
            team_details["T1"] -= 1
        elif 6 <= absent_id <= 10:
            team_details["T2"] -= 1
        elif 11 <= absent_id <= 15:
            team_details["T3"] -= 1
        elif 16 <= absent_id <= 20:
            team_details["T4"] -= 1
        elif 21 <= absent_id <= 40:
            team_details["OH"] -= 1

    return team_details

def predict_manpower_required(start_date, days = 365):
    train_data_forecast = load_data('src/data/train_data_forecast.json')    

    # Generate list of all dates in 2025
    end_date = start_date + timedelta(days)
    all_dates = [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]

    # Generate dummy manpower pool - 20 PM and 20 OH
    total_manpower = [f"id_0{i}" for i in range(1, 10)] + [f"id_{i}" for i in range(10, 41)]

    # Randomly assign leave to some personnel
    absent_manpower = []
    for person in total_manpower:
        if random.random() < 0.5:  # 20% chance a person is on leave
            leave_start = random.choice(all_dates)
            leave_days = random.randint(1, 14)  # 1 to 2 weeks leave
            absent_manpower.extend((person, leave_start + timedelta(days=i)) for i in range(leave_days))

    # Build manpower data for the year
    manpower_data = {}

    for date in all_dates:
        date_str = date.strftime("%Y-%m-%d")
        manpower_data[date_str] = {
            "required": 0,
            "projected_present": [],
            "projected_absent": [],
            "team_details": {}
        }

        # Flags to track if specific maintenance types are scheduled on this day
        e_maintenance_scheduled = False
        oh_maintenance_scheduled = False

        # Check all trains for scheduled maintenance
        for train in train_data_forecast["trains"]:
            for maintenance_type, schedules in train["maintenanceSchedules"].items():
                for schedule in schedules:
                    if schedule["date"] == date_str:
                        if maintenance_type in ["E1", "E2", "E3", "E4", "E5"]:
                            e_maintenance_scheduled = True
                        elif maintenance_type in ["MinOH", "MajOH"]:
                            oh_maintenance_scheduled = True

        # Calculate required manpower based on maintenance type
        if e_maintenance_scheduled and oh_maintenance_scheduled:
            manpower_data[date_str]["required"] = random.randint(30, 41)
        elif e_maintenance_scheduled or oh_maintenance_scheduled:
            manpower_data[date_str]["required"] = random.randint(20, 31)

        # Determine the projected present and absent manpower
        total_required = manpower_data[date_str]["required"]
        if total_required > 0:
            present = list(set(total_manpower) - {p[0] for p in absent_manpower if p[1] == date})
            absent = list({p[0] for p in absent_manpower if p[1] == date})
            if len(present) < total_required:
                total_required = len(present)  # Adjust required manpower to available personnel
            present = sorted(present)
            manpower_data[date_str]["projected_present"] = present #random.sample(present, total_required)
            manpower_data[date_str]["projected_absent"] = absent
            manpower_data[date_str]["team_details"] = update_team_details(absent)

    # Save manpower data to a JSON file
    save_data('src/data/manpower_projected.json', manpower_data)