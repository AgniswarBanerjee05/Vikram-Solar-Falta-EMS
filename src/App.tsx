import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { KpiCard } from './components/common/KpiCard';
import { SectionCard } from './components/common/SectionCard';
import { InlineTabs } from './components/common/InlineTabs';
import { MetersTable } from './components/sections/MetersTable';
import { PanelsTable } from './components/sections/PanelsTable';
import { ModelsDoughnut } from './components/charts/ModelsDoughnut';
import { CommAvailabilityChart } from './components/charts/CommAvailabilityChart';
import {
  LocationsHorizontalBar,
  type ChartEntry
} from './components/charts/LocationsHorizontalBar';
import { PanelsVerticalBar } from './components/charts/PanelsVerticalBar';
import { useDashboardData } from './hooks/useDashboardData';
import { useTheme } from './hooks/useTheme';
import { useScrollSpy } from './hooks/useScrollSpy';
import type { Meter, Panel, TableKind } from './types/dashboard';
import { formatNumber, matchesSearchTerm } from './utils/format';
import { downloadCsv, type CsvColumn } from './utils/csv';

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
const SECTION_SCROLL_OFFSET = 160;

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

const normalizePathname = (value: string) => {
  if (!value) {
    return '/';
  }
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.length ? trimmed : '/';
};

const resolveSectionFromPathname = (
  pathname: string,
  availableSections: ReadonlyArray<{ id: string }>
) => {
  const basePath = getNormalizedBasePath();
  let path = pathname;

  if (basePath && path.startsWith(basePath)) {
    path = path.slice(basePath.length);
  }

  path = path.replace(/^\/+/, '');
  const [firstSegment] = path.split('/');

  return (
    availableSections.find((section) => section.id === firstSegment)?.id ??
    availableSections[0]?.id ??
    ''
  );
};

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

export default function App() {
  const { meters, panels, summary, loading, error } = useDashboardData();
  const { isDark, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTable, setActiveTable] = useState<TableKind>('meters');
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= MOBILE_BREAKPOINT : true
  );
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= MOBILE_BREAKPOINT : false
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const sanitizedMeters = useMemo(() => sanitizeMeters(meters), [meters]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const query = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
    const listener = (event: MediaQueryListEvent) => {
      setSidebarOpen(event.matches);
      setIsDesktop(event.matches);
    };
    setIsDesktop(query.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    container.style.overflowY = !isDesktop && sidebarOpen ? 'hidden' : 'auto';
    return () => {
      container.style.overflowY = 'auto';
    };
  }, [isDesktop, sidebarOpen]);

  const activeSection = useScrollSpy(
    sections.map((section) => section.id),
    SECTION_SCROLL_OFFSET,
    scrollContainerRef
  );

  const filteredMeters = useMemo(
    () => sanitizedMeters.filter((meter) => matchesSearchTerm(meter, searchTerm)),
    [sanitizedMeters, searchTerm]
  );

  const filteredPanels = useMemo(
    () => panels.filter((panel) => matchesSearchTerm(panel, searchTerm)),
    [panels, searchTerm]
  );

  const locationEntries = useMemo<ChartEntry[]>(() => {
    const counts = new Map<string, number>();
    sanitizedMeters.forEach((meter) => {
      counts.set(meter.location, (counts.get(meter.location) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [sanitizedMeters]);

  const panelEntries = useMemo<ChartEntry[]>(() => {
    const counts = new Map<string, number>();
    sanitizedMeters.forEach((meter) => {
      counts.set(meter.panel_name, (counts.get(meter.panel_name) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [sanitizedMeters]);

  const scrollToSection = useCallback(
    (sectionId: string, behavior: ScrollBehavior = 'smooth') => {
      const element = document.getElementById(sectionId);
      if (!element) {
        return;
      }

      const container = scrollContainerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const offsetWithinContainer =
          elementRect.top - containerRect.top + container.scrollTop - SECTION_SCROLL_OFFSET;
        container.scrollTo({ top: Math.max(offsetWithinContainer, 0), behavior });
        return;
      }

      if (typeof window !== 'undefined') {
        const absoluteTop = element.getBoundingClientRect().top + window.scrollY;
        const target = Math.max(absoluteTop - SECTION_SCROLL_OFFSET, 0);
        window.scrollTo({ top: target, behavior });
      }
    },
    [scrollContainerRef]
  );

  const updateHistoryForSection = useCallback(
    (sectionId: string, { replace = false }: { replace?: boolean } = {}) => {
      if (typeof window === 'undefined') {
        return;
      }
      const targetPath = buildSectionHref(sectionId);
      const currentPath = normalizePathname(window.location.pathname);
      const normalizedTarget = normalizePathname(targetPath);
      if (currentPath === normalizedTarget) {
        return;
      }
      const state = { sectionId };
      if (replace) {
        window.history.replaceState(state, '', targetPath);
      } else {
        window.history.pushState(state, '', targetPath);
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const initialSection = resolveSectionFromPathname(window.location.pathname, sections);
    if (initialSection) {
      updateHistoryForSection(initialSection, { replace: true });
      requestAnimationFrame(() => {
        scrollToSection(initialSection, 'auto');
      });
    }

    const handlePopState = () => {
      const targetSection = resolveSectionFromPathname(window.location.pathname, sections);
      if (targetSection) {
        scrollToSection(targetSection);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [scrollToSection, updateHistoryForSection]);

  useEffect(() => {
    if (!activeSection) {
      return;
    }
    updateHistoryForSection(activeSection, { replace: true });
  }, [activeSection, updateHistoryForSection]);

  const handleNavigate = (sectionId: string) => {
    scrollToSection(sectionId);
    updateHistoryForSection(sectionId);
    if (!isDesktop) {
      setSidebarOpen(false);
      requestAnimationFrame(() => {
        scrollToSection(sectionId);
      });
    }
  };

  const handleDownloadCsv = () => {
    if (activeTable === 'meters') {
      downloadCsv(filteredMeters, meterCsvColumns, 'falta_meters.csv');
    } else {
      downloadCsv(filteredPanels, panelCsvColumns, 'falta_panels.csv');
    }
  };

  const rowCountDisplay =
    activeTable === 'meters'
      ? `Showing ${filteredMeters.length} of ${sanitizedMeters.length} meters`
      : `Showing ${filteredPanels.length} of ${panels.length} panel entries`;

  return (
    <div className="relative h-screen overflow-hidden text-slate-900 transition dark:text-slate-100">
      <Sidebar
        isOpen={sidebarOpen}
        sections={sections as unknown as Array<{ id: string; label: string }>}
        activeSection={activeSection}
        onNavigate={handleNavigate}
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
        ref={scrollContainerRef}
        className={clsx(
          'relative z-10 flex h-full flex-col overflow-y-auto transition-[padding-left] duration-300 ease-in-out lg:pl-0',
          isDesktop && sidebarOpen && 'lg:pl-72'
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320%]">
          <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-brand-400/25 blur-[140px] dark:bg-brand-300/15" />
          <div className="absolute -bottom-24 right-[-10%] h-[520px] w-[520px] rounded-full bg-indigo-400/20 blur-[160px] dark:bg-indigo-500/15" />
          <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-[130px] dark:bg-cyan-400/10" />
        </div>

        <Topbar
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onDownloadCsv={handleDownloadCsv}
          onToggleTheme={toggleTheme}
          isDark={isDark}
          isSidebarOpen={sidebarOpen}
        />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:mx-0 lg:px-10 xl:px-14">
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
}
