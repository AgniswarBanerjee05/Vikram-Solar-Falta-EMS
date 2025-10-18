import type { FC } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { buildDoughnutOptions, getPalette } from '../../lib/chartConfig';

interface ModelsDoughnutProps {
  models: Record<string, number>;
  isDark: boolean;
}

export const ModelsDoughnut: FC<ModelsDoughnutProps> = ({ models, isDark }) => {
  const labels = Object.keys(models);
  const values = Object.values(models);
  const palette = getPalette(values.length);

  const data = {
    labels,
    datasets: [
      {
        label: 'Meters',
        data: values,
        backgroundColor: palette,
        borderWidth: 2,
        borderColor: isDark ? '#0f172a' : '#e2e8f0',
        cutout: '65%',
        hoverOffset: 18
      }
    ]
  };

  return <Doughnut data={data} options={buildDoughnutOptions(isDark)} />;
};
