import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Onboarding from "../pages/Onboarding";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Chat from "../pages/Chat";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import ProfileEdit from "../pages/ProfileEdit";
import Mood from "../pages/Mood";
import Resources from "../pages/Resources";
import Community from "../pages/Community";
import Therapists from "../pages/Therapists";
import Bookings from "../pages/Bookings";
import Messages from "../pages/Messages";
import VideoCall from "../pages/VideoCall";
import Admin from "../pages/Admin";
import AdminRoute from "../components/AdminRoute";

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
        path="/therapists"
        element={
          <ProtectedRoute>
            <Therapists />
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
