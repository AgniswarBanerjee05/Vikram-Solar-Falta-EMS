import pandas as pd
import os

def convert_xlsx_to_csv(input_file, output_file):
    """
    Reads an XLSX file and converts it to a CSV file.

    Args:
        input_file (str): The path to the input .xlsx file.
        output_file (str): The path for the output .csv file.
    """
    try:
        # Read the Excel file
        df = pd.read_excel(input_file)

        # Save the DataFrame to a CSV file
        # index=False prevents pandas from writing row indices to the CSV
        df.to_csv(output_file, index=False, encoding='utf-8')
        
        print(f"Successfully converted '{input_file}' to '{output_file}'")

    except FileNotFoundError:
        print(f"Error: The file '{input_file}' was not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == '__main__':
    # --- Configuration ---
    # Replace 'your_file.xlsx' with the actual name of your Excel file.
    # The file should be in the same directory as this script.
    xlsx_filename = 'Data.xlsx' 
    
    # The output CSV file will have the same name but with a .csv extension.
    csv_filename = os.path.splitext(xlsx_filename)[0] + '.csv'
    # --- End of Configuration ---

    # Before running, ensure you have the necessary libraries installed:
    # pip install pandas openpyxl

    convert_xlsx_to_csv(xlsx_filename, csv_filename)