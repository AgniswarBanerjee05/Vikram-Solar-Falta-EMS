import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardView } from '../components/dashboard/DashboardView';
import { AdminUserManagement } from './AdminUserManagement';
import { getSession, logout } from '../auth/session';
import { STORAGE_KEYS } from '../lib/config';

type AdminView = 'dashboard' | 'accounts';

export const AdminHome = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

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

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <>
      {activeView === 'dashboard' ? (
        <DashboardView
          role="admin"
          onLogout={handleLogout}
          onManageAccounts={() => setActiveView('accounts')}
        />
      ) : (
        <AdminUserManagement
          onDashboardLogout={handleLogout}
          onBackToDashboard={() => setActiveView('dashboard')}
        />
      )}
    </>
  );
};

export default AdminHome;
