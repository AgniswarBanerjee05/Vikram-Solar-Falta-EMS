export interface Meter {
  sl_no: string;
  location: string;
  panel_name: string;
  meter_id?: string;
  meter_name: string;
  meter_serial: string;
  equipment_connected: string;
  model: string;
  comm_port: string;
  remarks?: string;
  internal_looping_status?: string;
  new_meter_required: boolean;
}

export interface Panel {
  panel: string;
  sl_no: string;
  equipment: string;
  capacity: string;
  power: string;
  quantity: string;
}

export interface DashboardSummary {
  total_meters: number;
  new_meters_required: number;
  comm_ports: Record<string, number>;
  models: Record<string, number>;
}

export interface DashboardData {
  meters: Meter[];
  panels: Panel[];
  summary: DashboardSummary;
}

export type TableKind = 'meters' | 'panels';
