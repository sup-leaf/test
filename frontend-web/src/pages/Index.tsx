import { Navigate } from 'react-router-dom';
import { isLoggedIn, getUser } from '@/lib/auth';

export default function Index() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const user = getUser();
  if (user?.userType === 1) return <Navigate to="/jobs" replace />;
  if (user?.userType === 2) return <Navigate to="/my-jobs" replace />;
  return <Navigate to="/dashboard" replace />;
}