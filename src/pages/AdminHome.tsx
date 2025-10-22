import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardView } from '../components/dashboard/DashboardView';
import { AdminUserManagement } from './AdminUserManagement';
import { getSession, logout } from '../auth/session';
import { STORAGE_KEYS } from '../lib/config';

type AdminView = 'dashboard' | 'accounts';

export const AdminHome = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view') as AdminView | null;
  const modeParam = searchParams.get('mode'); // Check for mode parameter from AdminUserManagement
  const [activeView, setActiveView] = useState<AdminView>(
    viewParam === 'accounts' || modeParam ? 'accounts' : 'dashboard'
  );

  useEffect(() => {
    const session = getSession();
    if (session?.role === 'admin' && session.token) {
      try {
        localStorage.setItem(STORAGE_KEYS.adminToken, session.token);
      } catch {
        // ignore localStorage issues
      }
    }
  }, []);

  const handleViewChange = (view: AdminView) => {
    setActiveView(view);
    if (view === 'accounts') {
      // Preserve mode parameter if it exists
      const mode = searchParams.get('mode');
      setSearchParams(mode ? { view, mode } : { view });
    } else {
      setSearchParams({ view });
    }
  };

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <>
      {activeView === 'dashboard' ? (
        <DashboardView
          role="admin"
          onLogout={handleLogout}
          onManageAccounts={() => handleViewChange('accounts')}
        />
      ) : (
        <AdminUserManagement
          onDashboardLogout={handleLogout}
          onBackToDashboard={() => handleViewChange('dashboard')}
        />
      )}
    </>
  );
};

export default AdminHome;
