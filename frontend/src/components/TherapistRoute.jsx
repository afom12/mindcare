import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

export default function TherapistRoute({ children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role === "therapist" ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}
