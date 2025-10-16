import pandas as pd
import json

def process_meters_data(df):
    # Clean and rename columns for meters data
    column_mapping = {
        'SL.NO': 'sl_no',
        'LOCATION': 'location',
        'PANEL NAME': 'panel_name',
        'Meter ID\n (Added by env)': 'meter_id',
        'Meter Name': 'meter_name',
        'Meter Serial No  (Added by env)': 'meter_serial',
        'Name of the equipment  meter connected': 'equipment_connected',
        'EM MAKE/MODEL NO': 'model',
        'COMMUNICATION PORT AVAILABILTY': 'comm_port',
        'REMARKS': 'remarks',
        'INTERNAL LOOPING STATUS (TBP/Yes/No)': 'internal_looping_status',
        'NEW METER INSTALLATION REQUIRED (YES/NO)': 'new_meter_required'
    }
    
    df = df.rename(columns=column_mapping)
    df = df.fillna('')
    df = df[df['sl_no'].astype(str).str.strip() != '']
    
    # Convert boolean fields
    df['new_meter_required'] = df['new_meter_required'].apply(
        lambda x: str(x).strip().upper() == 'YES' if x else False
    )
    
    return df.to_dict('records')

def process_panels_data(df):
    # Process panels data which has a different structure
    panels = []
    current_panel = None
    
    for _, row in df.iterrows():
        if not pd.isna(row.iloc[0]) and 'Panel' in str(row.iloc[0]):
            current_panel = str(row.iloc[0]).strip()
        elif current_panel and not pd.isna(row.iloc[0]) and str(row.iloc[0]).strip().isdigit():
            panels.append({
                'panel': current_panel,
                'sl_no': str(row.iloc[0]).strip(),
                'equipment': str(row.iloc[1]).strip(),
                'capacity': str(row.iloc[2]).strip(),
                'power': str(row.iloc[3]).strip(),
                'quantity': str(row.iloc[4]).strip()
            })
    
    return panels

def csv_to_json(csv_file):
    try:
        # Read the main meter data
        meters_df = pd.read_csv(csv_file, nrows=79)
        
        # Read the panel data (starts after many empty rows)
        panels_df = pd.read_csv(csv_file, skiprows=160)
        
        # Process both sections
        meters_data = process_meters_data(meters_df)
        panels_data = process_panels_data(panels_df)
        
        # Create the final data structure
        data = {
            "meters": meters_data,
            "panels": panels_data,
            "summary": {
                "total_meters": len(meters_data),
                "new_meters_required": sum(1 for m in meters_data if m.get('new_meter_required')),
                "comm_ports": {
                    "YES": sum(1 for m in meters_data if m.get('comm_port') == 'YES'),
                    "NO": sum(1 for m in meters_data if m.get('comm_port') == 'NO')
                }
            }
        }
        
        # Calculate model breakdown
        models = {}
        for meter in meters_data:
            model = meter.get('model', '')
            if model:
                models[model] = models.get(model, 0) + 1
        data['summary']['models'] = models
        
        # Write to JSON file
        with open('data/data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print("CSV data converted to JSON successfully!")
        print(f"Total meters: {data['summary']['total_meters']}")
        print(f"Total panels: {len(panels_data)}")
        
    except Exception as e:
        print(f"Error converting CSV to JSON: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        csv_to_json('Data.csv')
    except Exception as e:
        print(f"Error: {str(e)}")