import { Link } from "react-router-dom";
import { Bell, Heart, ExternalLink, X } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    dropdownOpen,
    setDropdownOpen,
    markAsRead,
    markAllAsRead,
    loadNotifications
  } = useNotifications();

  const handleToggle = () => {
    const next = !dropdownOpen;
    setDropdownOpen(next);
    if (next) loadNotifications();
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-rose-500 text-white text-xs font-medium rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-72">
              {loading ? (
                <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                      !n.read ? "bg-slate-50/50" : ""
                    }`}
                  >
                    {n.link ? (
                      <Link
                        to={n.link}
                        onClick={() => {
                          markAsRead(n._id);
                          setDropdownOpen(false);
                        }}
                        className="block"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            {n.type === "mood_reminder" ? (
                              <Heart className="w-4 h-4 text-slate-600" />
                            ) : (
                              <Bell className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{n.title}</p>
                            {n.body && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {n.body}
                              </p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              {formatTime(n.createdAt)}
                            </p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0 mt-1" />
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bell className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{n.title}</p>
                          {n.body && (
                            <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {formatTime(n.createdAt)}
                          </p>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="p-1 rounded hover:bg-slate-200"
                          >
                            <X className="w-3 h-3 text-slate-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
