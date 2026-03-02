import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Logo";
import { MessageCircle, LayoutDashboard, User, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? "bg-slate-100 text-slate-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
    }`;

  return (
    <header className="h-16 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-4 sm:px-6 gap-4">
      <div className="flex items-center gap-4 sm:gap-8 min-w-0">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <Logo />
        </NavLink>

        <nav className="flex items-center gap-1 flex-shrink-0">
          <NavLink to="/chat" className={navLinkClass}>
            <MessageCircle size={18} />
            Chat
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/profile" className={navLinkClass}>
            <User size={18} />
            Profile
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition text-sm font-medium"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </header>
  );
}
