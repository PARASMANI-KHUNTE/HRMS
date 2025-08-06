import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const roleToPath = {
  superadmin: '/superadmin',
  admin: '/admin',
  receptionist: '/receptionist',
  lab: '/lab',
  pharmacist: '/pharmacist',
};

export default function AuthRedirector({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('AUTH_REDIRECTOR_DEBUG:', { user, currentPath: location.pathname });
    const role = user?.role || user?.user?.role;
    if (role) {
      const dashboardPath = roleToPath[role];
      const isOnDashboard = location.pathname.startsWith(dashboardPath);
      const isPublicPath = location.pathname === '/login' || location.pathname === '/';

      if (isPublicPath && dashboardPath && !isOnDashboard) {
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [user, location.pathname, navigate]);

  return children;
}
