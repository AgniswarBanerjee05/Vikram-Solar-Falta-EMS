import { promises as fs } from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

export async function convertXlsxToCsv(inputPath: string, outputPath: string): Promise<void> {
  const resolvedInput = path.resolve(inputPath);
  const resolvedOutput = path.resolve(outputPath);

  const workbook = XLSX.readFile(resolvedInput);
  const [firstSheetName] = workbook.SheetNames;

  if (!firstSheetName) {
    throw new Error(`No worksheets found in ${resolvedInput}`);
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const csvContent = XLSX.utils.sheet_to_csv(worksheet);

  await fs.mkdir(path.dirname(resolvedOutput), { recursive: true });
  await fs.writeFile(resolvedOutput, csvContent, 'utf-8');
}
