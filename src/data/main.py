from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os

from standard_functions import load_data, save_data, generate_initial_train_data
from update_daily_mileage import update_one_day_train_data, convert_csv_to_json
from generate_schedule import forecast
from allocate_manpower import allocate_manpower

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "File is not a CSV"}), 400

    # Save the file
    file_path = os.path.join("uploads", file.filename)
    file.save(file_path)

    # Process the CSV
    try:
        current_trains_data = load_data('src/data/trains_current_mileage.json')
        if not current_trains_data:
            current_trains_data = generate_initial_train_data(92)
        real_trains_data = convert_csv_to_json(file_path)
        date = datetime.today()
        updated_trains_data = update_one_day_train_data(current_trains_data['trains'], date, real_trains_data['trains'])
        save_data('src/data/trains_current_mileage.json', updated_trains_data)
        return jsonify({"message": "Mileage updated successfully. Click on Forecast to update changes."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
      
@app.route('/forecast', methods=['POST'])
def forecast_endpoint():
    data = request.get_json()
    start_date_str = data.get("start_date")
    days = data.get("days", 365)
    
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        schedule = forecast(start_date, days)
        return jsonify({"schedule": schedule}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400   
      
@app.route('/allocate_manpower', methods=['POST'])
def allocate_manpower_endpoint():
    try:
        data = request.get_json()
        start_date_str = data.get("start_date")
        pm_team = data.get("PmTeams")
        oh_team = data.get("OhTeam")
        if not start_date_str:
            return jsonify({"error": "start_date is required"}), 400
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        result = allocate_manpower(start_date, pm_team, oh_team)
        return jsonify({"schedule": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500  
      
if __name__ == "__main__":
    os.makedirs("uploads", exist_ok=True)
    app.run(debug=True)