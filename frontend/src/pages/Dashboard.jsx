import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMood } from "../context/MoodContext";
import AppLayout from "../components/layout/AppLayout";
import { bookingApi } from "../api/bookingApi";
import { MessageCircle, BookOpen, Calendar, ArrowRight, Heart, Activity, Shield, Mail, Video } from "lucide-react";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function TherapistDashboard({ userName, greeting, upcomingSessions }) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-slate-800">
            {greeting}, <span className="font-medium text-slate-700">{userName}</span>
          </h1>
          <p className="text-slate-500 mt-1">Your practice at a glance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <Link
            to="/bookings"
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-slate-800">{upcomingSessions.length}</p>
            <p className="text-sm text-slate-500">Upcoming sessions</p>
            <p className="text-xs text-slate-400 mt-2">View in My Sessions</p>
          </Link>

          <Link
            to="/messages"
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-slate-800">—</p>
            <p className="text-sm text-slate-500">Messages</p>
            <p className="text-xs text-slate-400 mt-2">Chat with clients</p>
          </Link>

          <Link
            to="/resources"
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-slate-800">—</p>
            <p className="text-sm text-slate-500">Resources</p>
            <p className="text-xs text-slate-400 mt-2">Share with clients</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-800">Upcoming sessions</h3>
                <Link to="/bookings" className="text-sm text-slate-600 hover:text-slate-800">
                  View all
                </Link>
              </div>
              {upcomingSessions.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No upcoming sessions</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((b) => (
                    <Link
                      key={b._id}
                      to="/bookings"
                      className="block p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <p className="font-medium text-slate-800">{b.userId?.name}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(b.scheduledAt).toLocaleDateString()} at{" "}
                        {new Date(b.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                        <Video className="w-3 h-3" /> Join session available
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Quick actions</h3>
              <div className="space-y-3">
                <Link
                  to="/bookings"
                  className="flex items-center justify-between p-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">My sessions</span>
                  </div>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center justify-between p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span>Messages</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-400" />
                </Link>
                <Link
                  to="/resources"
                  className="flex items-center justify-between p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5" />
                    <span>Resources</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getWeeklyMoodData(moods) {
  const result = [0, 0, 0, 0, 0, 0, 0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const dayMoods = moods.filter((m) => {
      const created = new Date(m.createdAt);
      return created >= dayStart && created <= dayEnd;
    });
    if (dayMoods.length > 0) {
      const avg = dayMoods.reduce((s, m) => s + m.value, 0) / dayMoods.length;
      result[i] = Math.round((avg / 5) * 100);
    }
  }
  return result;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { moods, stats, loading, logMood, MOOD_OPTIONS } = useMood();
  const [bookings, setBookings] = useState([]);

  const userName = user?.name?.split(" ")[0] || "there";
  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (user?.role === "therapist") {
      bookingApi.getMyBookings().then(({ data }) => setBookings(data.bookings || [])).catch(() => {});
    }
  }, [user?.role]);

  const upcomingSessions = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.scheduledAt) > new Date()
  ).slice(0, 3);

  if (user?.role === "admin") {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-medium text-slate-800 mb-2">{greeting}, {userName}</h1>
            <p className="text-slate-500 mb-8">Manage the platform from the Admin Dashboard</p>
            <button
              onClick={() => navigate("/admin")}
              className="px-8 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700"
            >
              Go to Admin Dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (user?.role === "therapist") {
    return (
      <AppLayout>
        <TherapistDashboard
          userName={userName}
          greeting={greeting}
          upcomingSessions={upcomingSessions}
        />
      </AppLayout>
    );
  }

  const weeklyHeights = getWeeklyMoodData(moods);
  const defaultHeights = [40, 65, 45, 80, 70, 55, 90];
  const chartHeights = weeklyHeights.some((h) => h > 0) ? weeklyHeights : defaultHeights;

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-slate-800">
              {greeting}, <span className="font-medium text-slate-700">{userName}</span>
            </h1>
            <p className="text-slate-500 mt-1">How are you feeling today?</p>
          </div>

          {/* Quick Mood Check */}
          <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-100 shadow-sm">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Quick check-in</h2>
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
              {MOOD_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => logMood(value)}
                  disabled={loading}
                  className="flex-1 min-w-[80px] py-3 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-slate-800 transition-colors text-slate-600 text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "..." : label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-2xl font-semibold text-slate-800">—</p>
              <p className="text-sm text-slate-500">Chat sessions</p>
              <p className="text-xs text-slate-400 mt-2">View in Chat</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-slate-800">
                {stats.averageThisWeek != null ? `${Math.round(stats.averageThisWeek * 20)}%` : "—"}
              </p>
              <p className="text-sm text-slate-500">Mood this week</p>
              <p className="text-xs text-slate-400 mt-2">
                {stats.thisWeek > 0 ? `${stats.thisWeek} check-ins` : "Log your mood"}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-slate-800">{stats.total}</p>
              <p className="text-sm text-slate-500">Check-ins</p>
              <p className="text-xs text-slate-400 mt-2">All time</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-slate-800">4</p>
              <p className="text-sm text-slate-500">Articles</p>
              <p className="text-xs text-slate-400 mt-2">
                <Link to="/resources" className="text-slate-600 hover:text-slate-800">View resources</Link>
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Chats */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-slate-800">Recent conversations</h3>
                  <Link
                    to="/chat"
                    className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
                  >
                    View all <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="space-y-4">
                  <Link
                    to="/chat"
                    className="block py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 rounded-lg -mx-2 px-2 transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-800">Start a new conversation</p>
                    <p className="text-xs text-slate-400 mt-1">Chat with MindCare AI</p>
                  </Link>
                </div>
              </div>

              {/* Mood Trends */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-slate-800">Weekly mood trend</h3>
                  <Link
                    to="/mood"
                    className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
                  >
                    Details <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="flex items-end justify-between h-32 gap-2">
                  {DAY_LABELS.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-slate-700 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max(chartHeights[i], 10)}%` }}
                      />
                      <span className="text-xs text-slate-500">{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Quick actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/chat"
                    className="flex items-center justify-between p-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">Start a chat</span>
                    </div>
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/mood"
                    className="flex items-center justify-between p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5" />
                      <span>Log mood</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-400" />
                  </Link>

                  <Link
                    to="/resources"
                    className="flex items-center justify-between p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5" />
                      <span>Self-help resources</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-400" />
                  </Link>

                  <Link
                    to="/community"
                    className="flex items-center justify-between p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5" />
                      <span>Community support</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-400" />
                  </Link>

                  {user?.role === "user" && (
                    <Link
                      to="/therapists"
                      className="flex items-center justify-between p-4 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5" />
                        <span>Book therapy session</span>
                      </div>
                      <ArrowRight size={16} className="text-slate-400" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-sm">
                <p className="text-lg font-light leading-relaxed mb-4">
                  &quot;You are not alone. You are seen. You are heard. You matter.&quot;
                </p>
                <p className="text-sm opacity-80">— MindCare AI</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-8 text-center">
            If you&apos;re in crisis, please call 988 or text HOME to 741741
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
