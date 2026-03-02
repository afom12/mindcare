import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Logo";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-full bg-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-100">
        <Logo />
        <p className="text-xs text-slate-500 mt-1">Mental wellness</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive ? "bg-slate-100 text-slate-800" : "text-slate-600 hover:bg-slate-50"
            }`
          }>
          <span className="text-lg">💬</span>
          <span className="font-medium">Chat</span>
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive ? "bg-slate-100 text-slate-800" : "text-slate-600 hover:bg-slate-50"
            }`
          }>
          <span className="text-lg">📊</span>
          <span className="font-medium">Dashboard</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              isActive ? "bg-slate-100 text-slate-800" : "text-slate-600 hover:bg-slate-50"
            }`
          }>
          <span className="text-lg">👤</span>
          <span className="font-medium">Profile</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="px-4 py-2 mb-3">
          <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition">
          <span className="text-lg">🚪</span>
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
