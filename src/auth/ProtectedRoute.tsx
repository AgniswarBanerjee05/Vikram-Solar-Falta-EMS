import type { PropsWithChildren } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSession, type UserRole } from './session';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  requiredRole,
  redirectTo = '/login',
  children
}: PropsWithChildren<ProtectedRouteProps>) => {
  const location = useLocation();
  const session = getSession();

  const hasRequiredRole =
    session && session.token ? (!requiredRole ? true : session.role === requiredRole) : false;

  if (!hasRequiredRole) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`.replace(/^\//, '/'));
    const search = next ? `?next=${next}` : '';
    return <Navigate to={`${redirectTo}${search}`} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
