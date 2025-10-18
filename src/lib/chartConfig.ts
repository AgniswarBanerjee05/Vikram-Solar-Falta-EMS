import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

const PALETTE = [
  '#38bdf8',
  '#34d399',
  '#fbbf24',
  '#a855f7',
  '#f97316',
  '#60a5fa',
  '#ec4899',
  '#f87171',
  '#2dd4bf',
  '#c084fc'
];

export function getPalette(size: number) {
  if (size <= PALETTE.length) {
    return PALETTE.slice(0, size);
  }
  return Array.from({ length: size }, (_, index) => PALETTE[index % PALETTE.length]);
}

export function buildDoughnutOptions(isDark: boolean) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isDark ? '#e2e8f0' : '#0f172a'
        }
      },
      tooltip: {
        callbacks: {
          label(context: { label: string; raw: number; dataset: { data: number[] } }) {
            const value = context.raw;
            const total = context.dataset.data.reduce((sum, item) => sum + item, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
}

export function buildHorizontalBarOptions(isDark: boolean) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    scales: {
      x: {
        ticks: {
          color: isDark ? '#cbd5f5' : '#0f172a'
        },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.4)',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: isDark ? '#cbd5f5' : '#0f172a'
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title(items: Array<{ label: string }>) {
            return items[0]?.label ?? '';
          }
        }
      }
    }
  };
}

export function buildVerticalBarOptions(isDark: boolean) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: isDark ? '#cbd5f5' : '#0f172a'
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          color: isDark ? '#cbd5f5' : '#0f172a'
        },
        grid: {
          color: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.4)',
          drawBorder: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };
}
