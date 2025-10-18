import type { FC } from 'react';
import { Bar } from 'react-chartjs-2';
import { buildVerticalBarOptions, getPalette } from '../../lib/chartConfig';
import type { ChartEntry } from './LocationsHorizontalBar';

interface PanelsVerticalBarProps {
  entries: ChartEntry[];
  isDark: boolean;
}

export const PanelsVerticalBar: FC<PanelsVerticalBarProps> = ({ entries, isDark }) => {
  const labels = entries.map((entry) => entry.label);
  const values = entries.map((entry) => entry.value);
  const palette = getPalette(values.length);

  const data = {
    labels,
    datasets: [
      {
        label: 'Meters',
        data: values,
        backgroundColor: palette.map((color) => `${color}D0`),
        borderColor: palette,
        borderWidth: 2,
        borderRadius: 14,
        borderSkipped: false,
        barPercentage: 0.55,
        categoryPercentage: 0.6
      }
    ]
  };

  return <Bar data={data} options={buildVerticalBarOptions(isDark)} />;
};
