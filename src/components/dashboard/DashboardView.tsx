import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { Topbar } from '../layout/Topbar';
import { KpiCard } from '../common/KpiCard';
import { SectionCard } from '../common/SectionCard';
import { InlineTabs } from '../common/InlineTabs';
import { MetersTable } from '../sections/MetersTable';
import { PanelsTable } from '../sections/PanelsTable';
import { ModelsDoughnut } from '../charts/ModelsDoughnut';
import { CommAvailabilityChart } from '../charts/CommAvailabilityChart';
import {
  LocationsHorizontalBar,
  type ChartEntry
} from '../charts/LocationsHorizontalBar';
import { PanelsVerticalBar } from '../charts/PanelsVerticalBar';
import { PasswordChangeModal } from '../common/PasswordChangeModal';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useTheme } from '../../hooks/useTheme';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import type { Meter, Panel, TableKind } from '../../types/dashboard';
import { formatNumber, matchesSearchTerm } from '../../utils/format';
import { downloadCsv, type CsvColumn } from '../../utils/csv';
import { changePassword } from '../../lib/userApi';
import { getSession } from '../../auth/session';

export interface DashboardViewProps {
  role: 'user' | 'admin';
  onLogout: () => void;
  onManageAccounts?: () => void;
}

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'inventory', label: 'Meter Inventory' },
  { id: 'locations', label: 'Locations' },
  { id: 'models', label: 'Models' }
] as const;

const meterCsvColumns: Array<CsvColumn<Meter>> = [
  { key: 'sl_no', label: 'SL' },
  { key: 'location', label: 'Location' },
  { key: 'panel_name', label: 'Panel' },
  { key: 'meter_name', label: 'Meter Name' },
  { key: 'model', label: 'Model' },
  { key: 'meter_serial', label: 'Serial' },
  { key: 'comm_port', label: 'Comm Port' },
  { key: 'new_meter_required', label: 'New Meter?' },
  { key: 'equipment_connected', label: 'Equipment' },
  { key: 'remarks', label: 'Remarks' }
];

const panelCsvColumns: Array<CsvColumn<Panel>> = [
  { key: 'panel', label: 'Panel' },
  { key: 'sl_no', label: 'SL' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'power', label: 'Power' },
  { key: 'quantity', label: 'Quantity' }
];

const MOBILE_BREAKPOINT = 1024;
const UNKNOWN_LOCATION_LABEL = 'Unknown Location';
const UNASSIGNED_PANEL_LABEL = 'Unassigned Panel';

const sanitizeLabel = (value: string | null | undefined, fallback: string) => {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const sanitizeMeters = (meters: Meter[]): Meter[] => {
  return meters
    .filter((meter) => {
      const hasCoreData =
        meter.location.trim().length > 0 ||
        meter.panel_name.trim().length > 0 ||
        meter.meter_name.trim().length > 0;
      return hasCoreData;
    })
    .map((meter) => ({
      ...meter,
      location: sanitizeLabel(meter.location, UNKNOWN_LOCATION_LABEL),
      panel_name: sanitizeLabel(meter.panel_name, UNASSIGNED_PANEL_LABEL),
      meter_name: meter.meter_name.trim(),
      meter_id: meter.meter_id?.trim(),
      meter_serial: meter.meter_serial.trim(),
      equipment_connected: meter.equipment_connected.trim(),
      model: meter.model.trim(),
      comm_port: meter.comm_port.trim(),
      remarks: meter.remarks?.trim() ?? meter.remarks,
      internal_looping_status: meter.internal_looping_status?.trim() ?? meter.internal_looping_status
    }));
};

const buildLocationEntries = (summary: Record<string, unknown>): ChartEntry[] => {
  const entries = summary?.locations as Record<string, number> | undefined;
  if (!entries) {
    return [];
  }
  return Object.entries(entries).map(([key, value]) => ({
    label: key,
    value
  }));
};

const buildPanelEntries = (summary: Record<string, unknown>): ChartEntry[] => {
  const entries = summary?.panels as Record<string, number> | undefined;
  if (!entries) {
    return [];
  }
  return Object.entries(entries).map(([key, value]) => ({
    label: key,
    value
  }));
};

const buildCsvFileName = (kind: TableKind) => {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
    2,
    '0'
  )}`;
  return kind === 'meters'
    ? `falta-meter-inventory-${timestamp}.csv`
    : `falta-panel-inventory-${timestamp}.csv`;
};

const formatRowCount = (meters: Meter[], panels: Panel[], active: TableKind) => {
  if (active === 'meters') {
    return `${formatNumber(meters.length)} meters`;
  }
  return `${formatNumber(panels.length)} panel rows`;
};

const getNormalizedBasePath = () => {
  const base = import.meta.env.BASE_URL ?? '/';
  if (base === '/' || base === './') {
    return '';
  }
  return base.replace(/\/+$/, '');
};

const buildSectionHref = (sectionId: string) => {
  const basePath = getNormalizedBasePath();
  const joined = [basePath, sectionId].filter(Boolean).join('/');
  const candidate = joined.startsWith('/') ? joined : `/${joined}`;
  return candidate || '/';
};

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const query = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
    const listener = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };
    setIsDesktop(query.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  return isDesktop;
};

export const DashboardView = ({ role, onLogout, onManageAccounts }: DashboardViewProps) => {
  const { meters, panels, summary, loading, error } = useDashboardData();
  const { isDark, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTable, setActiveTable] = useState<TableKind>('meters');
  const isDesktop = useIsDesktop();
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.style.overflow = !isDesktop && sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDesktop, sidebarOpen]);

  const sanitizedMeters = useMemo(() => sanitizeMeters(meters), [meters]);
  const filteredMeters = useMemo(
    () => sanitizedMeters.filter((meter) => matchesSearchTerm(meter, searchTerm)),
    [sanitizedMeters, searchTerm]
  );
  const filteredPanels = useMemo(
    () => panels.filter((panel) => matchesSearchTerm(panel, searchTerm)),
    [panels, searchTerm]
  );

  const locationEntries = useMemo(() => buildLocationEntries(summary), [summary]);
  const panelEntries = useMemo(() => buildPanelEntries(summary), [summary]);
  const rowCountDisplay = useMemo(
    () => formatRowCount(filteredMeters, filteredPanels, activeTable),
    [activeTable, filteredMeters, filteredPanels]
  );

  const activeSection = useScrollSpy(sections.map((section) => section.id));

  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  const handleDownloadCsv = () => {
    if (activeTable === 'meters') {
      downloadCsv(
        filteredMeters,
        meterCsvColumns,
        buildCsvFileName('meters')
      );
      return;
    }
    downloadCsv(
      filteredPanels,
      panelCsvColumns,
      buildCsvFileName('panels')
    );
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    const session = getSession();
    if (!session?.token) {
      throw new Error('Not authenticated');
    }

    try {
      await changePassword(session.token, {
        currentPassword,
        newPassword
      });
      alert('Password changed successfully! Admin can now see your new password.');
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-200 text-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <PasswordChangeModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />
      <Sidebar
        isOpen={sidebarOpen}
        sections={sections as unknown as Array<{ id: string; label: string }>}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        getSectionHref={buildSectionHref}
      />

      {!isDesktop && sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={clsx(
          'relative z-10 flex min-h-screen flex-col overflow-x-hidden transition-[padding-left] duration-300 ease-in-out lg:pl-0',
          isDesktop && sidebarOpen && 'lg:pl-72'
        )}
      >
        <Topbar
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onDownloadCsv={handleDownloadCsv}
          onToggleTheme={toggleTheme}
          isDark={isDark}
          isSidebarOpen={sidebarOpen}
          onLogout={onLogout}
          onManageUsers={role === 'admin' ? onManageAccounts : undefined}
          onChangePassword={role === 'user' ? () => setPasswordModalOpen(true) : undefined}
        />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 pb-12 pt-28 sm:px-6 lg:mx-0 lg:px-10 xl:px-14">
          <section id="overview" className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Total Meters"
                value={loading ? 'Loading...' : formatNumber(summary.total_meters)}
              />
              <KpiCard
                label="New Meters Required"
                value={loading ? 'Loading...' : formatNumber(summary.new_meters_required)}
                accent="rose"
              />
              <KpiCard
                label="Total Panels"
                value={loading ? 'Loading...' : formatNumber(summary.total_panels)}
                accent="amber"
              />
              <KpiCard
                label="Total Capacity (kVA)"
                value={loading ? 'Loading...' : formatNumber(summary.total_capacity_kva)}
                accent="emerald"
              />
            </div>

            <SectionCard title="Inventory Snapshot">
              <div className="grid gap-6 md:grid-cols-3">
                <KpiCard
                  label="Meters in Operation"
                  value={loading ? 'Loading...' : formatNumber(summary.active_meters)}
                />
                <KpiCard
                  label="Comm Ports - YES"
                  value={
                    loading ? 'Loading...' : formatNumber(summary.comm_ports?.YES ?? summary.comm_ports?.Yes ?? 0)
                  }
                  accent="emerald"
                />
                <KpiCard
                  label="Comm Ports - NO"
                  value={
                    loading ? 'Loading...' : formatNumber(summary.comm_ports?.NO ?? summary.comm_ports?.No ?? 0)
                  }
                  accent="amber"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <SectionCard title="Models Breakdown">
                  <div className="h-[320px]">
                    {loading ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Loading chart...</p>
                    ) : (
                      <ModelsDoughnut models={summary.models ?? {}} isDark={isDark} />
                    )}
                  </div>
                </SectionCard>
                <SectionCard title="Communication Port Availability">
                  <div className="h-[320px]">
                    {loading ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Loading chart...</p>
                    ) : (
                      <CommAvailabilityChart summary={summary.comm_ports ?? {}} isDark={isDark} />
                    )}
                  </div>
                </SectionCard>
              </div>
            </SectionCard>
          </section>

          <SectionCard
            id="inventory"
            title={
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Data Tables</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Explore the meter inventory and connected panel equipment.
                </p>
              </div>
            }
            actions={
              <InlineTabs
                options={[
                  { id: 'meters', label: 'Meters' },
                  { id: 'panels', label: 'Panels' }
                ]}
                active={activeTable}
                onChange={setActiveTable}
              />
            }
          >
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <label className="group relative flex w-full max-w-xl items-center gap-3 rounded-full border border-white/10 bg-white/50 px-5 py-3 text-sm font-medium text-slate-600 shadow-[0_18px_45px_rgba(14,165,233,0.18)] backdrop-blur-xl transition focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-200/80 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-100 dark:focus-within:ring-brand-300/60">
                <MagnifyingGlassIcon className="h-5 w-5 text-brand-500 transition group-focus-within:text-brand-300 dark:text-brand-300" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search across inventory"
                  className="flex-1 bg-transparent text-sm font-medium uppercase tracking-[0.2em] outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-400 group-focus-within:text-brand-300 dark:text-brand-200">
                  Ctrl+K
                </span>
              </label>
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-[0_12px_32px_rgba(15,23,42,0.18)] backdrop-blur dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
                {rowCountDisplay}
              </span>
            </div>

            {activeTable === 'meters' ? (
              <MetersTable rows={filteredMeters} />
            ) : (
              <PanelsTable rows={filteredPanels} />
            )}
          </SectionCard>

          <SectionCard id="locations" title="Meters by Location">
            <div className="h-[380px]">
              {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading chart...</p>
              ) : (
                <LocationsHorizontalBar entries={locationEntries} isDark={isDark} />
              )}
            </div>
          </SectionCard>

          <SectionCard id="models" title="Meters by Panel">
            <div className="h-[380px]">
              {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading chart...</p>
              ) : (
                <PanelsVerticalBar entries={panelEntries} isDark={isDark} />
              )}
            </div>
          </SectionCard>

          {error && (
            <SectionCard className="border-rose-300 bg-rose-50/70 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              <p className="text-sm font-medium">
                Failed to load dashboard data. Please refresh the page. Details: {error}
              </p>
            </SectionCard>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardView;
