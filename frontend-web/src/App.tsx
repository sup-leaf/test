import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { isLoggedIn, getUser } from '@/lib/auth';
import Layout from '@/components/Layout';
import Welcome from '@/pages/Welcome';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import Jobs from '@/pages/student/Jobs';
import JobDetail from '@/pages/student/JobDetail';
import MyDeliveries from '@/pages/student/MyDeliveries';
import Resume from '@/pages/student/Resume';
import Research from '@/pages/student/Research';
import MyInternships from '@/pages/student/MyInternships';
import Competition from '@/pages/student/Competition';
import StudentProfile from '@/pages/student/Profile';
import JobMap from '@/pages/student/JobMap';
import MemberCenter from '@/pages/student/MemberCenter';
import CertificateVerify from '@/pages/student/CertificateVerify';
import CrawlerManage from '@/pages/admin/CrawlerManage';
import MyJobs from '@/pages/enterprise/MyJobs';
import ReceivedDeliveries from '@/pages/enterprise/ReceivedDeliveries';
import MyInterns from '@/pages/enterprise/MyInterns';
import Dashboard from '@/pages/admin/Dashboard';
import EnterpriseAudit from '@/pages/admin/EnterpriseAudit';
import ResearchManage from '@/pages/admin/ResearchManage';
import UserManage from '@/pages/admin/UserManage';
import Profile from '@/pages/Profile';
import VipPayment from '@/pages/VipPayment';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleRoute({ children, allowedTypes }: { children: React.ReactNode; allowedTypes: number[] }) {
  const user = getUser();
  if (!user || !allowedTypes.includes(user.userType)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function HomeRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/" replace />;
  if (user.userType === 1) return <Navigate to="/app/jobs" replace />;
  if (user.userType === 2) return <Navigate to="/app/my-jobs" replace />;
  return <Navigate to="/app/dashboard" replace />;
}

function App() {
  return (
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<HomeRedirect />} />
            {/* Common routes - accessible by all roles */}
            <Route path="settings" element={<Profile />} />
            <Route path="vip" element={<VipPayment />} />
            {/* Student routes */}
            <Route path="jobs" element={<RoleRoute allowedTypes={[1]}><Jobs /></RoleRoute>} />
            <Route path="jobs/:id" element={<RoleRoute allowedTypes={[1]}><JobDetail /></RoleRoute>} />
            <Route path="my-deliveries" element={<RoleRoute allowedTypes={[1]}><MyDeliveries /></RoleRoute>} />
            <Route path="resume" element={<RoleRoute allowedTypes={[1]}><Resume /></RoleRoute>} />
            <Route path="research" element={<RoleRoute allowedTypes={[1]}><Research /></RoleRoute>} />
            <Route path="my-internships" element={<RoleRoute allowedTypes={[1]}><MyInternships /></RoleRoute>} />
            <Route path="competition" element={<RoleRoute allowedTypes={[1]}><Competition /></RoleRoute>} />
            <Route path="profile" element={<RoleRoute allowedTypes={[1]}><StudentProfile /></RoleRoute>} />
            <Route path="job-map" element={<RoleRoute allowedTypes={[1]}><JobMap /></RoleRoute>} />
            <Route path="member" element={<RoleRoute allowedTypes={[1]}><MemberCenter /></RoleRoute>} />
            <Route path="certificate-verify" element={<RoleRoute allowedTypes={[1]}><CertificateVerify /></RoleRoute>} />
            {/* Enterprise routes */}
            <Route path="my-jobs" element={<RoleRoute allowedTypes={[2]}><MyJobs /></RoleRoute>} />
            <Route path="received-deliveries" element={<RoleRoute allowedTypes={[2]}><ReceivedDeliveries /></RoleRoute>} />
            <Route path="my-interns" element={<RoleRoute allowedTypes={[2]}><MyInterns /></RoleRoute>} />
            {/* Teacher/Admin routes */}
            <Route path="dashboard" element={<RoleRoute allowedTypes={[3]}><Dashboard /></RoleRoute>} />
            <Route path="enterprise-audit" element={<RoleRoute allowedTypes={[3]}><EnterpriseAudit /></RoleRoute>} />
            <Route path="research-manage" element={<RoleRoute allowedTypes={[3]}><ResearchManage /></RoleRoute>} />
            <Route path="user-manage" element={<RoleRoute allowedTypes={[3]}><UserManage /></RoleRoute>} />
            <Route path="crawler-manage" element={<RoleRoute allowedTypes={[3]}><CrawlerManage /></RoleRoute>} />
          </Route>
        </Routes>
        <Toaster position="top-center" duration={2000} />
      </BrowserRouter>
  );
}

export default App;