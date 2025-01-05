# Forecast tentative schedule
from datetime import timedelta

from standard_functions import load_data, save_data
from forecast_schedule import forecast_schedule
from manpower import predict_manpower_required
from allocate_manpower import allocate_schedule_one_day

def forecast(start_date, days = 365):
    yearly_schedule = []
    forecast_schedule(start_date, days)
    predict_manpower_required(start_date, days)
    manpower_projected = load_data('src/data/manpower_projected.json')
      
    for day in range(days):
        current_date = start_date + timedelta(days=day)
        current_date_str = current_date.strftime("%Y-%m-%d")
                
        maintenance_schedule_forecast = load_data('src/data/maintenance_schedule_forecast.json')
        tasks_scheduled = next((entry for entry in maintenance_schedule_forecast if entry["date"] == current_date_str), None)
        manpower_schedule = manpower_projected.get(current_date_str)
        if not (tasks_scheduled is None or manpower_schedule is None):
            new_schedule = allocate_schedule_one_day(tasks_scheduled, manpower_schedule)
            if new_schedule:
                yearly_schedule.append(new_schedule)
            
    
    save_data('src/data/detailed_schedule.json', yearly_schedule)
    print("Data written successfully to detailed_schedule.json")
    return yearly_schedule