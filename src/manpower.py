import json
import random
from datetime import datetime, timedelta

# Load train data from JSON file
with open("train_data.json", "r") as file:
    train_data = json.load(file)

# Generate list of all dates in 2025
start_date = datetime(2025, 1, 1)
end_date = datetime(2025, 12, 31)
all_dates = [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]

# Generate dummy manpower pool
total_manpower = [f"id_{i}" for i in range(1, 101)]  # 100 personnel

# Randomly assign leave to some personnel
absent_manpower = []
for person in total_manpower:
    if random.random() < 0.2:  # 20% chance a person is on leave
        leave_start = random.choice(all_dates)
        leave_days = random.randint(7, 14)  # 1 to 2 weeks leave
        absent_manpower.extend((person, leave_start + timedelta(days=i)) for i in range(leave_days))

# Build manpower data for the year
manpower_data = {}

for date in all_dates:
    date_str = date.strftime("%Y-%m-%d")
    manpower_data[date_str] = {
        "required": 0,
        "projected_present": [],
        "projected_absent": []
    }

    # Flags to track if specific maintenance types are scheduled on this day
    e_maintenance_scheduled = False
    oh_maintenance_scheduled = False

    # Check all trains for scheduled maintenance
    for train in train_data["trains"]:
        for maintenance_type, schedules in train["maintenanceSchedules"].items():
            for schedule in schedules:
                if schedule["date"] == date_str:
                    if maintenance_type in ["E1", "E2", "E3", "E4", "E5"]:
                        e_maintenance_scheduled = True
                    elif maintenance_type in ["MinOH", "MajOH"]:
                        oh_maintenance_scheduled = True

    # Calculate required manpower based on maintenance type
    if e_maintenance_scheduled and oh_maintenance_scheduled:
        manpower_data[date_str]["required"] = random.randint(40, 50)
    elif e_maintenance_scheduled or oh_maintenance_scheduled:
        manpower_data[date_str]["required"] = random.randint(20, 25)

    # Determine the projected present and absent manpower
    total_required = manpower_data[date_str]["required"]
    if total_required > 0:
        present = list(set(total_manpower) - {p[0] for p in absent_manpower if p[1] == date})
        absent = [p[0] for p in absent_manpower if p[1] == date]
        if len(present) < total_required:
            total_required = len(present)  # Adjust required manpower to available personnel
        manpower_data[date_str]["projected_present"] = random.sample(present, total_required)
        manpower_data[date_str]["projected_absent"] = absent

# Save manpower data to a JSON file
with open("manpower.json", "w") as file:
    json.dump(manpower_data, file, indent=4)

print("Manpower data successfully generated and saved to manpower.json.")
