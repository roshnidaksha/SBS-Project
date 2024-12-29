import json
from datetime import datetime, timedelta

# Load JSON files
def load_json(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

# Save JSON files
def save_json(file_path, data):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

# Calculate daily usage from historical data
def calculate_daily_usage(historical_data, quantity_in_stock):
    total_quantity = sum(historical_data["last_4_quarters_order_quantity"].values())
    return total_quantity / 365 - quantity_in_stock

# Calculate the depletion date
def calculate_depletion_date(quantity_in_stock, daily_usage):
    if daily_usage == 0:
        return None  # No usage, no depletion
    days_to_depletion = quantity_in_stock / daily_usage
    return datetime.now() + timedelta(days=days_to_depletion)

# Calculate reorder date
def calculate_reorder_date(depletion_date, lead_time):
    if depletion_date is None:
        return None  # No reorder needed
    return depletion_date - timedelta(days=lead_time)

# Main script logic
def recommend_reorder_dates(spare_parts_file, train_data_file, min_oh_date, maj_oh_date):
    spare_parts_data = load_json(spare_parts_file)
    train_data = load_json(train_data_file)

    for component in spare_parts_data:
        if component["shortfall"] < 0:  # Check if there's a shortfall
            component_id = component["Component"]
            lead_time = component["lead_time"]
            quantity_in_stock = component["quantity_in_stock"]
            daily_usage = calculate_daily_usage(component["historical_data"], quantity_in_stock)
            depletion_date = calculate_depletion_date(quantity_in_stock, daily_usage)
            reorder_date = calculate_reorder_date(depletion_date, lead_time)

            # Maintenance considerations
            maintenance_dates = train_data.get(component_id, {}).get("Maintenance Done", [])
            if "MajOH" in maintenance_dates and datetime.strptime(min_oh_date, "%Y-%m-%d") < reorder_date:
                reorder_date = datetime.strptime(min_oh_date, "%Y-%m-%d") - timedelta(days=lead_time)
            if "MinOH" in maintenance_dates and datetime.strptime(maj_oh_date, "%Y-%m-%d") < reorder_date:
                reorder_date = datetime.strptime(maj_oh_date, "%Y-%m-%d") - timedelta(days=lead_time)

            # Add recommended reorder date to the component
            component["recommended_reorder_date"] = reorder_date.strftime("%Y-%m-%d") if reorder_date else None

    # Save updated data back to the file after processing all components
    save_json(spare_parts_file, spare_parts_data)
    print(f"Updated data with recommended reorder dates saved to {spare_parts_file}")

# Example usage
spare_parts_file = "spare_parts_data.json"
train_data_file = "train_data.json"
min_oh_date = "2025-11-23"  # Set manually
maj_oh_date = "2025-12-23"  # Set manually

recommend_reorder_dates(spare_parts_file, train_data_file, min_oh_date, maj_oh_date)
