import json

# Define the categories and subcategories based on WBS numbers
CATEGORIES = {
    "02": "Carbody Fittings",
    "02.01": "Exterior Finishing Aesthetics",
    "02.03": "Windows",
    "02.04": "Gangway",
    "02.05": "Obstacle Detector",
    "02.06": "Coupler",
    "03": "Bogies & Running Gear",
    "03.01": "Bogie Structure / Frame",
    "03.02": "Primary Suspension",
    "03.03": "Secondary Suspension",
    "03.04": "Wheelset",
    "03.05": "Traction Connection / Links",
    "03.06": "Bogie Fittings",
    "04": "Power Supply",
    "04.01": "Line Voltage System",
    "04.04": "Battery Systems",
    "05": "Propulsion",
    "05.01": "Drive System",
    "05.02": "Traction Converter",
    "05.04": "Propulsion Cooling System",
    "05.05": "Gearbox and Coupling",
    "06": "Auxiliaries",
    "06.01": "Air Supply System",
    "06.03": "Auxiliary Electrical Supply",
    "07": "Pneumatic Braking System",
    "07.01": "Brake Control",
    "07.02": "Friction Brake System",
    "12": "Exterior Door Systems",
    "12.02": "Passenger Door Systems",
    "12.02.05": "Door Operator",
    "12.02.06": "Driving Arm Assembly",
    "12.02.07": "Hanging Device",
    "12.02.08": "Right Door Leaf (from Outside)",
    "13": "ACV System",
    "13.02": "ACV Saloon",
}

# Function to determine category and subcategory
def determine_category(wbs_no):
    category = None
    subcategory = None
    for key in sorted(CATEGORIES.keys(), key=len, reverse=True):
        if wbs_no.startswith(key):
            if "." in key:
                subcategory = CATEGORIES[key]
            else:
                category = CATEGORIES[key]
    return category, subcategory

def process_inventory(input_file, output_file):
    # Load spare parts data
    with open(input_file, "r") as file:
        spare_parts = json.load(file)

    # Update the data
    for item in spare_parts:
        wbs_no = item.get("WBS No.", "")
        category, subcategory = determine_category(wbs_no)

        # Remove existing fields
        item.pop("category", None)
        item.pop("sub_category", None)
        item.pop("Category", None)

        # Add new fields
        if category:
            item["category"] = category
        if subcategory:
            item["subcategory"] = subcategory

    # Save the updated data
    with open(output_file, "w") as file:
        json.dump(spare_parts, file, indent=4)

    print(f"Inventory processed and saved to {output_file}")

# Run the function with input and output file names
if __name__ == "__main__":
    input_file = "spare_parts_data.json"
    output_file = "spare_parts_data.json"
    process_inventory(input_file, output_file)
