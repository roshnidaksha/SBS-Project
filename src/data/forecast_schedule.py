from datetime import datetime, timedelta

from standard_functions import MAINTENANCE_THRESHOLDS
from standard_functions import load_data, save_data
from standard_functions import generate_initial_train_data


"""
  Schedule maintenance for a train if timers are greater than threshold
"""
def schedule_maintenance(trains, current_date, maintenance_schedule_forecast):
    for train in trains:
        for track, threshold in MAINTENANCE_THRESHOLDS.items():
            if train['maintenanceTimers'][track] >= threshold:
                task = {
                    "trainNo": train['trainNo'],
                    "maintenanceType": track,
                }
                date_str = current_date.strftime("%Y-%m-%d")
                existing_schedule = next(
                    (schedule for schedule in maintenance_schedule_forecast if schedule["date"] == date_str), None
                )
                if existing_schedule:
                    if not any(t["trainNo"] == task["trainNo"] and t["maintenanceType"] == task["maintenanceType"] for t in existing_schedule["tasks"]):
                        existing_schedule["tasks"].append(task)
                        for i, schedule in enumerate(maintenance_schedule_forecast):
                            if schedule["date"] == date_str:
                                maintenance_schedule_forecast[i] = existing_schedule
                else:
                    maintenance_schedule_forecast.append({
                        "date": date_str,
                        "tasks": [task]
                    })
                
                train['maintenanceSchedules'][track].append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "mileage": train['currentMileage']
                })
                train['maintenanceTimers'][track] = 0

    return trains, maintenance_schedule_forecast

"""
  Update mileage for each train for 1 day with default value (simulate the daily travel)
"""
def update_mileage_one_day(trains, current_date):
    for train in trains:
        train['overallMileage'] += 660
        train['currentMileage'] += 660
            
        for track in MAINTENANCE_THRESHOLDS.keys():
            train['maintenanceTimers'][track] += 660
            
        train['lastUpdated'] = current_date.strftime("%Y-%m-%d")
    return trains
  
"""
  Forecast schedule for given number of days (default 1 year = 365 days)
"""
def forecast_schedule(start_date, days = 365):
    train_data_forecast = load_data('src/data/trains_current_mileage.json')
    if not train_data_forecast:
        train_data_forecast = generate_initial_train_data(92)
        
    maintenance_schedule_forecast = []
    
    for day in range(days):
        current_date = start_date + timedelta(days=day)
        train_data_forecast['trains'] = update_mileage_one_day(train_data_forecast['trains'], current_date)
        train_data_forecast['trains'], maintenance_schedule_forecast = schedule_maintenance(train_data_forecast['trains'], current_date, maintenance_schedule_forecast)
    
    save_data('src/data/train_data_forecast.json', train_data_forecast)
    save_data('src/data/maintenance_schedule_forecast.json', maintenance_schedule_forecast)