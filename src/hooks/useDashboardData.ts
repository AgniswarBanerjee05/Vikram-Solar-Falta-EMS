import { useEffect, useMemo, useState } from 'react';
import type { DashboardData, DashboardSummary, Meter, Panel } from '../types/dashboard';

interface DashboardResponse {
  meters?: Meter[];
  panels?: Panel[];
  summary?: DashboardSummary;
}

const EMPTY_SUMMARY: DashboardSummary = {
  total_meters: 0,
  new_meters_required: 0,
  comm_ports: {},
  models: {}
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // ✅ Build URL manually to avoid "Invalid base URL" issues
        // Handles both localhost and GitHub Pages environments
        const base =
          (import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/')
            ? import.meta.env.BASE_URL
            : '/Vikram-Solar-Falta-EMS/';

        // Ensure trailing slash only once, then build absolute URL
        const dataUrl = `${window.location.origin}${base.replace(/\/$/, '')}/data/data.json`;

        console.log('📦 Loading dashboard data from:', dataUrl); // optional debug log

        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error(`Failed to load data (${response.status})`);
        }

        const payload: DashboardResponse = await response.json();
        if (!Array.isArray(payload.meters) || !Array.isArray(payload.panels)) {
          throw new Error('Unexpected data format. Expected meters and panels arrays.');
        }

        if (isMounted) {
          setData({
            meters: payload.meters,
            panels: payload.panels,
            summary: payload.summary ?? EMPTY_SUMMARY
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          console.error('❌ Failed to load dashboard data:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => {
    if (!data) {
      return {
        meters: [] as Meter[],
        panels: [] as Panel[],
        summary: EMPTY_SUMMARY
      };
    }
    return data;
  }, [data]);

  return {
    ...value,
    loading,
    error
  };
}
