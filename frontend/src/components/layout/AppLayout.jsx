import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  MessageCircle,
  Heart,
  BookOpen,
  Users,
  User,
  LogOut,
  Menu,
  Shield,
  Calendar,
  CalendarClock,
  UserCheck,
  Mail,
  BarChart3
} from "lucide-react";
import NotificationBell from "../NotificationBell";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(user?.role !== "therapist" ? [{ name: "Chat", href: "/chat", icon: MessageCircle }] : []),
    ...(user?.role !== "therapist" ? [{ name: "Mood Tracker", href: "/mood", icon: Heart }] : []),
    ...(user?.role !== "therapist" ? [{ name: "Assessments", href: "/assessments", icon: BarChart3 }] : []),
    { name: "Resources", href: "/resources", icon: BookOpen },
    { name: "Community", href: "/community", icon: Users },
    ...(user?.role === "user" ? [{ name: "Book Session", href: "/therapists", icon: UserCheck }] : []),
    { name: user?.role === "therapist" ? "My Sessions" : "My Bookings", href: "/bookings", icon: Calendar },
    ...(user?.role === "therapist"
      ? [
          { name: "Schedule", href: "/therapist/schedule", icon: CalendarClock },
          { name: "My Clients", href: "/clients", icon: Users }
        ]
      : []),
    { name: "Messages", href: "/messages", icon: Mail },
    ...(user?.role === "admin" ? [{ name: "Admin", href: "/admin", icon: Shield }] : [])
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-100 fixed top-0 left-0 right-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo & Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>

              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-slate-800">MindCare AI</span>
              </Link>
            </div>

            {/* Right side - Notifications & Profile */}
            <div className="flex items-center gap-3">
              <NotificationBell />

              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-100 transform transition-transform duration-200 ease-in-out z-20 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full overflow-y-auto py-6">
          <nav className="px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 min-h-screen flex flex-col">
        {children}
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
