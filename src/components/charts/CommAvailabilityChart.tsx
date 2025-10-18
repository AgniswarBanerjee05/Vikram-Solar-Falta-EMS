import type { FC } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { buildDoughnutOptions } from '../../lib/chartConfig';

interface CommAvailabilityChartProps {
  isDark: boolean;
  summary: Record<string, number>;
}

const COLORS = ['#22c55e', '#f87171', '#facc15', '#38bdf8'];

export const CommAvailabilityChart: FC<CommAvailabilityChartProps> = ({ isDark, summary }) => {
  const labels = Object.keys(summary);
  const values = Object.values(summary);
  const data = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: values,
        backgroundColor: COLORS.slice(0, labels.length),
        borderWidth: 2,
        borderColor: isDark ? '#0f172a' : '#e2e8f0',
        cutout: '60%',
        hoverOffset: 16
      }
    ]
  };

  return <Doughnut data={data} options={buildDoughnutOptions(isDark)} />;
};
