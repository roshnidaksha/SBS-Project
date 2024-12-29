import json

def calculate_maintenance_totals(train_data_file, spare_parts_file, output_file):
    # Load train maintenance data
    with open(train_data_file, "r") as train_file:
        train_data = json.load(train_file)
    
    # Initialize a dictionary to hold totals for each maintenance type
    maintenance_totals = {}
    
    # Iterate through each train in the data
    for train in train_data["trains"]:
        # Access the maintenance schedules
        maintenance_schedules = train.get("maintenanceSchedules", {})
        for maintenance_type, schedules in maintenance_schedules.items():
            # Count the number of occurrences for each maintenance type
            maintenance_totals[maintenance_type] = maintenance_totals.get(maintenance_type, 0) + len(schedules)
    
    print(f"Maintenance totals: {maintenance_totals}")
    maintenance_totals['MinOH'] = 1
    maintenance_totals['MajOH'] = 2


    # Load spare parts data
    with open(spare_parts_file, "r") as spare_file:
        spare_parts = json.load(spare_file)
    
    # Update spare parts data with calculated total quantities needed
    for part in spare_parts:
        total_needed = 0
        # Check for each maintenance type this spare part is used for
        for maintenance_type in part.get("Maintenance Done", []):
            if maintenance_type in maintenance_totals:
                # Multiply the maintenance total count by the quantity required for this part
                total_needed += maintenance_totals[maintenance_type] * part["Quantity"]
                print("Maintenance totals: ", total_needed)
        
        # Update the total quantity needed
        part["total_quantity_needed"] = total_needed
    
    # Save the updated spare parts data to a new file
    with open(output_file, "w") as output_file:
        json.dump(spare_parts, output_file, indent=4)
    
    print(f"Updated spare parts data saved to {output_file.name}")

# Run the function with file names
if __name__ == "__main__":
    train_data_file = "train_data.json"  # Input train maintenance data file
    spare_parts_file = "spare_parts_data.json"  # Input spare parts data file
    output_file = "spare_parts_data.json"  # Output file for updated spare parts data
    calculate_maintenance_totals(train_data_file, spare_parts_file, output_file)
