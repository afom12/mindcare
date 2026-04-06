import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Onboarding from "../pages/Onboarding";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Chat from "../pages/Chat";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import ProfileEdit from "../pages/ProfileEdit";
import Mood from "../pages/Mood";
import Assessments from "../pages/Assessments";
import Resources from "../pages/Resources";
import Community from "../pages/Community";
import CommunityChat from "../pages/CommunityChat";
import CommunityModeration from "../pages/CommunityModeration";
import CommunityChatModeration from "../pages/CommunityChatModeration";
import Therapists from "../pages/Therapists";
import TherapistProfile from "../pages/TherapistProfile";
import Bookings from "../pages/Bookings";
import Messages from "../pages/Messages";
import VideoCall from "../pages/VideoCall";
import Admin from "../pages/Admin";
import AdminRoute from "../components/AdminRoute";
import TherapistRoute from "../components/TherapistRoute";
import TherapistOrAdminRoute from "../components/TherapistOrAdminRoute";
import TherapistSchedule from "../pages/TherapistSchedule";
import TherapistPendingRequests from "../pages/TherapistPendingRequests";
import ClientList from "../pages/ClientList";
import ClientDetail from "../pages/ClientDetail";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import Contact from "../pages/Contact";
import FAQ from "../pages/FAQ";

function LandingPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Onboarding />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />

      <Route path="/chat" element={<Chat />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mood"
        element={
          <ProtectedRoute>
            <Mood />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessments"
        element={
          <ProtectedRoute>
            <Assessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community/chat"
        element={
          <ProtectedRoute>
            <CommunityChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapists"
        element={
          <ProtectedRoute>
            <Therapists />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapists/:id"
        element={
          <ProtectedRoute>
            <TherapistProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/video"
        element={
          <ProtectedRoute>
            <VideoCall />
          </ProtectedRoute>
        }
      />
      <Route
        path="/therapist/schedule"
        element={
          <TherapistRoute>
            <TherapistSchedule />
          </TherapistRoute>
        }
      />
      <Route
        path="/therapist/requests"
        element={
          <TherapistRoute>
            <TherapistPendingRequests />
          </TherapistRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <TherapistRoute>
            <ClientList />
          </TherapistRoute>
        }
      />
      <Route
        path="/clients/:clientId"
        element={
          <TherapistRoute>
            <ClientDetail />
          </TherapistRoute>
        }
      />
      <Route
        path="/therapist/community"
        element={
          <TherapistOrAdminRoute>
            <CommunityModeration />
          </TherapistOrAdminRoute>
        }
      />
      <Route
        path="/therapist/chat-moderation"
        element={
          <TherapistOrAdminRoute>
            <CommunityChatModeration />
          </TherapistOrAdminRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
