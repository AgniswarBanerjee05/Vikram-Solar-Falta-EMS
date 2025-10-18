import type { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import { buildHorizontalBarOptions, getPalette } from '../../lib/chartConfig';

export interface ChartEntry {
  label: string;
  value: number;
}

interface LocationsHorizontalBarProps {
  entries: ChartEntry[];
  isDark: boolean;
}

export const LocationsHorizontalBar: FC<LocationsHorizontalBarProps> = ({ entries, isDark }) => {
  const labels = entries.map((entry) => entry.label);
  const values = entries.map((entry) => entry.value);
  const palette = getPalette(values.length);

  const data = {
    labels,
    datasets: [
      {
        label: 'Meters',
        data: values,
        backgroundColor: palette.map((color) => `${color}CC`),
        borderColor: palette,
        borderWidth: 2,
        borderRadius: 14,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.65
      }
    ]
  };

  return <Bar data={data} options={buildHorizontalBarOptions(isDark)} />;
};
