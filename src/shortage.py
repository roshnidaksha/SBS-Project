import json

def calculate_shortfall(spare_parts_file, output_file):
    # Load spare parts data
    with open(spare_parts_file, "r") as spare_file:
        spare_parts = json.load(spare_file)
    
    # Calculate shortfall for each part (shortfall = quantity_needed - quantity_in_stock)
    for part in spare_parts:
        # Make sure 'quantity_needed' and 'quantity_in_stock' are present
        quantity_needed = part.get("total_quantity_needed", 0)
        quantity_in_stock = part.get("quantity_in_stock", 0)
        
        # Calculate shortfall
        part["shortfall"] = quantity_in_stock - quantity_needed
    
    # Save the updated spare parts data to a new file
    with open(output_file, "w") as output_file:
        json.dump(spare_parts, output_file, indent=4)
    
    print(f"Shortfall calculated and updated. Data saved to {output_file.name}")

# Run the function with file names
if __name__ == "__main__":
    spare_parts_file = "spare_parts_data.json"  # Input spare parts data file
    output_file = "spare_parts_data.json"  # Output file for updated spare parts data
    calculate_shortfall(spare_parts_file, output_file)
