import path from 'path';
import { convertCsvToJson } from './lib/csvConverter';
import { convertXlsxToCsv } from './lib/excelConverter';

interface CliOptions {
  input?: string;
  output?: string;
}

function parseOptions(args: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--input' || arg === '-i') {
      options.input = args[i + 1];
      i += 1;
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[i + 1];
      i += 1;
    }
  }

  return options;
}

function printUsage(): void {
  const scriptName = path.basename(process.argv[1] ?? 'ts-node');
  console.log(`Usage:
  ${scriptName} convert-csv [--input path] [--output path]
  ${scriptName} convert-excel [--input path] [--output path]`);
}

async function run(): Promise<void> {
  const [, , command, ...rest] = process.argv;

  if (!command) {
    printUsage();
    return;
  }

  const options = parseOptions(rest);

  switch (command) {
    case 'convert-csv': {
      const input = options.input ?? 'Data.csv';
      const output = options.output ?? path.join('data', 'data.json');
      const result = await convertCsvToJson(input, output);
      console.log(`CSV data converted successfully to ${path.resolve(output)}`);
      console.log(`Total meters: ${result.summary.total_meters}`);
      console.log(`Total panels: ${result.panels.length}`);
      break;
    }
    case 'convert-excel': {
      const input = options.input ?? 'Data.xlsx';
      const output = options.output ?? 'Data.csv';
      await convertXlsxToCsv(input, output);
      console.log(`Excel data converted successfully to ${path.resolve(output)}`);
      break;
    }
    default:
      printUsage();
  }
}

run().catch((err: unknown) => {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error(err);
  }
  process.exitCode = 1;
});
