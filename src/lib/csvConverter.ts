import { promises as fs } from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { FaltaData, MeterRecord, PanelRecord, Summary } from '../types';

type MeterStringKeys = Exclude<keyof MeterRecord, 'new_meter_required'> | 'new_meter_required';

const headerMapping: Record<string, MeterStringKeys> = {
  'SL.NO': 'sl_no',
  'LOCATION': 'location',
  'PANEL NAME': 'panel_name',
  'METER ID (ADDED BY ENV)': 'meter_id',
  'METER NAME': 'meter_name',
  'METER SERIAL NO (ADDED BY ENV)': 'meter_serial',
  'NAME OF THE EQUIPMENT METER CONNECTED': 'equipment_connected',
  'EM MAKE/MODEL NO': 'model',
  'COMMUNICATION PORT AVAILABILTY': 'comm_port',
  'REMARKS': 'remarks',
  'INTERNAL LOOPING STATUS (TBP/YES/NO)': 'internal_looping_status',
  'NEW METER INSTALLATION REQUIRED (YES/NO)': 'new_meter_required'
};

const NORMALIZE_WHITESPACE = /\s+/g;

function normalizeHeader(value: string): string {
  return value.replace(/\r?\n/g, ' ')
    .replace(NORMALIZE_WHITESPACE, ' ')
    .trim()
    .toUpperCase();
}

function normalizeText(value: string | undefined | null): string {
  if (!value) return '';
  return String(value).replace(/\r?\n/g, ' ').trim();
}

function normalizeYesNo(value: string): 'YES' | 'NO' | '' {
  const upper = value.toUpperCase();
  if (upper === 'YES') return 'YES';
  if (upper === 'NO') return 'NO';
  return '';
}

function buildSummary(meters: MeterRecord[]): Summary {
  const models: Record<string, number> = {};
  let commYes = 0;
  let commNo = 0;
  let newRequired = 0;

  for (const meter of meters) {
    const model = meter.model.trim();
    if (model) {
      models[model] = (models[model] ?? 0) + 1;
    }

    const commPort = normalizeYesNo(meter.comm_port);
    if (commPort === 'YES') {
      commYes += 1;
    } else if (commPort === 'NO') {
      commNo += 1;
    }

    if (meter.new_meter_required) {
      newRequired += 1;
    }
  }

  return {
    total_meters: meters.length,
    new_meters_required: newRequired,
    comm_ports: { YES: commYes, NO: commNo },
    models
  };
}

function extractMeters(rows: string[][]): { meters: MeterRecord[]; nextIndex: number } {
  if (rows.length === 0) {
    return { meters: [], nextIndex: 0 };
  }

  const headerRow = rows[0].map(normalizeHeader);
  const columnIndex: Partial<Record<MeterStringKeys, number>> = {};

  headerRow.forEach((header, index) => {
    const mappedKey = headerMapping[header];
    if (mappedKey) {
      columnIndex[mappedKey] = index;
    }
  });

  const slIndex = columnIndex.sl_no;
  if (slIndex === undefined) {
    throw new Error('Unable to locate SL.NO column in CSV header.');
  }

  const meters: MeterRecord[] = [];
  let currentIndex = 1;

  while (currentIndex < rows.length) {
    const row = rows[currentIndex] ?? [];
    currentIndex += 1;

    const slRaw = normalizeText(row[slIndex]);

    if (!slRaw && row.every(cell => !normalizeText(cell))) {
      break;
    }

    if (!slRaw) {
      continue;
    }

    const getString = (key: MeterStringKeys): string => {
      const index = columnIndex[key];
      if (index === undefined) {
        return '';
      }
      return normalizeText(row[index]);
    };

    const commPortRaw = getString('comm_port');
    const normalizedComm = normalizeYesNo(commPortRaw) || commPortRaw;

    const meter: MeterRecord = {
      sl_no: slRaw,
      location: getString('location'),
      panel_name: getString('panel_name'),
      meter_id: getString('meter_id'),
      meter_name: getString('meter_name'),
      meter_serial: getString('meter_serial'),
      equipment_connected: getString('equipment_connected'),
      model: getString('model'),
      comm_port: normalizedComm,
      remarks: getString('remarks'),
      internal_looping_status: getString('internal_looping_status'),
      new_meter_required: normalizeYesNo(getString('new_meter_required')) === 'YES'
    };

    meters.push(meter);
  }

  return { meters, nextIndex: currentIndex };
}

function extractPanels(rows: string[][], startIndex: number): PanelRecord[] {
  const panels: PanelRecord[] = [];
  let currentPanel: string | null = null;

  for (let i = startIndex; i < rows.length; i += 1) {
    const row = rows[i];
    const firstCell = normalizeText(row[0]);

    if (!firstCell) {
      continue;
    }

    if (!/^\d+$/.test(firstCell) && /panel/i.test(firstCell)) {
      currentPanel = firstCell;
      continue;
    }

    if (currentPanel && /^\d+$/.test(firstCell)) {
      panels.push({
        panel: currentPanel,
        sl_no: firstCell,
        equipment: normalizeText(row[1]),
        capacity: normalizeText(row[2]),
        power: normalizeText(row[3]),
        quantity: normalizeText(row[4])
      });
    }
  }

  return panels;
}

export async function convertCsvToJson(inputPath: string, outputPath: string): Promise<FaltaData> {
  const csvContent = await fs.readFile(inputPath, 'utf-8');
  const parsed = Papa.parse<string[]>(csvContent, {
    skipEmptyLines: false
  });

  if (parsed.errors.length > 0) {
    const messages = parsed.errors.map(err => err.message).join('; ');
    throw new Error(`Failed to parse CSV file: ${messages}`);
  }

  const rows = parsed.data;
  const { meters, nextIndex } = extractMeters(rows);
  const panels = extractPanels(rows, nextIndex);
  const summary = buildSummary(meters);

  const result: FaltaData = { meters, panels, summary };

  const resolvedOutput = path.resolve(outputPath);
  await fs.mkdir(path.dirname(resolvedOutput), { recursive: true });
  await fs.writeFile(resolvedOutput, JSON.stringify(result, null, 2), 'utf-8');

  return result;
}
