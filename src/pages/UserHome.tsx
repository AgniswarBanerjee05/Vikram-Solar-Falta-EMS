import { useNavigate } from 'react-router-dom';
import { DashboardView } from '../components/dashboard/DashboardView';
import { logout } from '../auth/session';

export const UserHome = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(navigate);
  };

  return <DashboardView role="user" onLogout={handleLogout} />;
};

export default UserHome;
