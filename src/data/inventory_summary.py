import json

def calculate_totals_and_update(spare_parts_file, output_file):
    # Load spare parts data
    with open(spare_parts_file, "r") as spare_file:
        spare_parts = json.load(spare_file)
    
    total_shortfall = 0  # Initialize total shortfall
    total_stock = 0  # Initialize total stock
    total_lead_time = 0  # Initialize total lead time
    valid_lead_time_count = 0  # Count of parts with valid lead time
    
    # Calculate shortfall, total stock, and average lead time
    for part in spare_parts:
        # Check if 'shortfall' is negative and add its absolute value to total_shortfall
        shortfall = part.get("shortfall", 0)
        if shortfall < 0:
            total_shortfall += abs(shortfall)
        
        # Add to total stock
        quantity_in_stock = part.get("quantity_in_stock", 0)
        total_stock += quantity_in_stock
        
        # Add to total lead time if it's a valid number
        lead_time = part.get("lead_time", 0)
        if lead_time > 0:
            total_lead_time += lead_time
            valid_lead_time_count += 1
    
    # Calculate average lead time if there are valid entries
    average_lead_time = total_lead_time / valid_lead_time_count if valid_lead_time_count > 0 else 0
    
    # Save the updated data with the calculated totals
    with open(output_file, "w") as output_file:
        json.dump(spare_parts, output_file, indent=4)
    
    print(f"Total Shortfall: {total_shortfall}")
    print(f"Total Stock: {total_stock}")
    print(f"Average Lead Time: {average_lead_time:.2f}")
    print(f"Updated data saved to {output_file.name}")

# Run the function with file names
if __name__ == "__main__":
    spare_parts_file = "spare_parts_data.json"  # Input spare parts data file
    output_file = "updated_spare_parts_with_totals.json"  # Output file for updated spare parts data
    calculate_totals_and_update(spare_parts_file, output_file)
