import heapq
from collections import defaultdict
from datetime import datetime, timedelta

from standard_functions import WORKDAY_HOURS, WORK_START_TIME
from standard_functions import MANHOUR_THRESHOLDS
from standard_functions import load_data, save_data

"""
  Allocate manpower for a day
  tasks_scheduled and manpower_schedule have data for one day only
"""
def allocate_schedule_one_day(tasks_scheduled, manpower_schedule):
    if tasks_scheduled is None or manpower_schedule is None:
        return None
  
    track_availability = defaultdict(list)
    team_availability = defaultdict(list)

    for track in ["E1", "E2", "E3", "E4", "E5", "E6", "E7"]:
        heapq.heappush(track_availability["E"], (0, track))
    for track in ["W1", "W2", "W3", "W4"]:
        heapq.heappush(track_availability["W"], (0, track))

    for team, available_count in manpower_schedule["team_details"].items():
        if available_count > 0:
            if team.startswith("T"):
                heapq.heappush(team_availability["E"], (0, team, available_count))
            else:
                heapq.heappush(team_availability["W"], (0, team, available_count))

    new_schedule = {
        "date": tasks_scheduled["date"],
        "tasks": []
    }

    #for delta in range(0, WORKDAY_HOURS, 30):
    for task in tasks_scheduled["tasks"]:
        maintenance_type = task["maintenanceType"]

        track_type = "E" if maintenance_type in ["E1", "E2", "E3", "E4", "E5"] else "W"

        track_time, track = heapq.heappop(track_availability[track_type])
        team_time, team, people_available = heapq.heappop(team_availability[track_type])
        
        if track_time >= WORKDAY_HOURS or team_time >= WORKDAY_HOURS:
            break

        # Calculate start and end times
        time_required = MANHOUR_THRESHOLDS[maintenance_type] / people_available
        time_required = 0.5 * ((time_required + 0.4) // 0.5)
        start_time = max(track_time, team_time)
        end_time = start_time + time_required
        
        # Calculate actual time
        work_start_time_str = f"{WORK_START_TIME:02}:00"
        initial_time = datetime.strptime(work_start_time_str, "%H:%M")
        actual_start_time = (initial_time + timedelta(hours=start_time)).strftime("%H:%M")
        actual_end_time = (initial_time + timedelta(hours=end_time)).strftime("%H:%M")

        # Update availability
        heapq.heappush(track_availability[track_type], (end_time + 0.5, track))
        heapq.heappush(team_availability[track_type], (end_time, team, people_available))

        # Append to new schedule
        new_schedule["tasks"].append({
            "trainNo": task["trainNo"],
            "maintenanceType": maintenance_type,
            "track": track,
            "startTime": actual_start_time,
            "endTime": actual_end_time,
            "team": team,
            "peopleRequired": people_available
        })
    
    if not new_schedule["tasks"]:
        return None    
    return new_schedule
  
def convert_to_team_details(pm_teams, oh_team):
    team_details = {
        f"T{index + 1}": team.get("men", 0) for index, team in enumerate(pm_teams)
    }
    team_details["OH"] = oh_team.get("men", 0)
    return {"team_details": team_details}
  
def allocate_manpower(start_date, pm_teams, oh_team):
    current_date = start_date
    current_date_str = current_date.strftime("%Y-%m-%d")
    maintenance_schedule_forecast = load_data('src/data/maintenance_schedule_forecast.json')

    tasks_scheduled = next((entry for entry in maintenance_schedule_forecast if entry["date"] == current_date_str), None)
    manpower_schedule = convert_to_team_details(pm_teams, oh_team)
    if not (tasks_scheduled is None or manpower_schedule is None):
        new_schedule = allocate_schedule_one_day(tasks_scheduled, manpower_schedule)
    return new_schedule or {}    