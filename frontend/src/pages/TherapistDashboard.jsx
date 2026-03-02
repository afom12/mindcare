import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import { therapistApi } from "../api/therapistApi";
import {
  Calendar,
  Users,
  Video,
  FileText,
  TrendingUp,
  Award,
  ArrowRight,
  Loader2
} from "lucide-react";

export default function TherapistDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const userName = user?.name?.split(" ")[0] || user?.name || "there";
  const currentTime = new Date().getHours();
  const greeting =
    currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    therapistApi
      .getDashboard()
      .then(({ data: res }) => setData(res))
      .catch(() => setData({ todayAppointments: [], pendingNotes: [], recentClients: [], todayCount: 0, thisWeekCount: 0, pendingNotesCount: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const todayAppointments = data?.todayAppointments || [];
  const pendingNotes = data?.pendingNotes || [];
  const recentClients = data?.recentClients || [];
  const todayCount = data?.todayCount ?? 0;
  const thisWeekCount = data?.thisWeekCount ?? 0;
  const pendingNotesCount = data?.pendingNotesCount ?? 0;

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with welcome and stats */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-light text-slate-800">
                Welcome back, <span className="font-medium text-slate-700">{userName}</span>
              </h1>
              <p className="text-slate-500 mt-1">Here&apos;s your practice overview for today</p>
            </div>

            {/* Quick stats badges */}
            <div className="flex items-center gap-3 mt-4 md:mt-0 flex-wrap">
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-sm text-slate-500">Today&apos;s clients</span>
                <p className="text-xl font-semibold text-slate-800">{todayCount}</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-sm text-slate-500">This week</span>
                <p className="text-xl font-semibold text-slate-800">{thisWeekCount}</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <span className="text-sm text-slate-500">Pending notes</span>
                <p className="text-xl font-semibold text-amber-600">{pendingNotesCount}</p>
              </div>
            </div>
          </div>

          {/* Main grid - 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Today's schedule */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's appointments card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-slate-800">Today&apos;s schedule</h2>
                        <p className="text-sm text-slate-500">{todayDate}</p>
                      </div>
                    </div>
                    <Link
                      to="/bookings"
                      className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
                    >
                      Full schedule <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {todayAppointments.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm">No sessions scheduled for today</p>
                      <Link to="/bookings" className="text-slate-600 text-sm hover:text-slate-800 mt-2 inline-block">
                        View all bookings
                      </Link>
                    </div>
                  ) : (
                    todayAppointments.map((apt) => {
                      const client = apt.userId?.name || "Client";
                      const initials = client.split(" ").map((n) => n[0]).join("").slice(0, 2);
                      const scheduled = new Date(apt.scheduledAt);
                      const isPast = scheduled < new Date();
                      return (
                        <div
                          key={apt._id}
                          className={`p-4 hover:bg-slate-50 transition-colors ${isPast ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-slate-600">{initials}</span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{client}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-slate-500">
                                    {scheduled.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500">
                                    {apt.durationMinutes || 50} min
                                  </span>
                                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                    Video
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isPast && (
                                <Link
                                  to={`/video?booking=${apt._id}`}
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Join session"
                                >
                                  <Video className="w-4 h-4 text-slate-600" />
                                </Link>
                              )}
                              <Link
                                to="/bookings"
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Session notes"
                              >
                                <FileText className="w-4 h-4 text-slate-400" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <Link
                    to="/therapist/schedule"
                    className="flex-1 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium block text-center"
                  >
                    Set availability
                  </Link>
                  <Link
                    to="/bookings"
                    className="flex-1 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium block text-center"
                  >
                    View all sessions →
                  </Link>
                </div>
              </div>

              {/* Client progress overview */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-medium text-slate-800">Client progress</h2>
                  </div>
                  <Link to="/bookings" className="text-sm text-slate-600 hover:text-slate-800">
                    View all
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentClients.length === 0 ? (
                    <p className="text-slate-500 text-sm py-4">No clients yet</p>
                  ) : (
                    recentClients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600">
                              {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{client.name}</p>
                            <p className="text-xs text-slate-500">Last session: {client.lastSession}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                            {client.progress}
                          </span>
                          <span className="text-xs text-slate-400">{client.mood}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right column - Tasks & insights */}
            <div className="space-y-6">
              {/* Pending notes alert */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-medium text-slate-800">Pending notes</h2>
                </div>

                <div className="space-y-3">
                  {pendingNotes.length === 0 ? (
                    <p className="text-slate-500 text-sm py-2">All caught up</p>
                  ) : (
                    pendingNotes.slice(0, 5).map((note) => {
                      const client = note.userId?.name || "Client";
                      const sessionDate = new Date(note.scheduledAt);
                      const hoursSince = (Date.now() - sessionDate) / (1000 * 60 * 60);
                      const due = hoursSince > 48 ? "Overdue" : "Within 24h";
                      return (
                        <Link
                          key={note._id}
                          to="/bookings"
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">{client}</p>
                            <p className="text-xs text-slate-500">
                              {sessionDate.toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              due === "Overdue" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {due}
                          </span>
                        </Link>
                      );
                    })
                  )}
                </div>

                <Link
                  to="/bookings"
                  className="w-full mt-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium block text-center"
                >
                  + Add session notes
                </Link>
              </div>

              {/* AI insights (from PRD) */}
              <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 opacity-90" />
                  <h3 className="text-sm font-medium opacity-90">AI Insight</h3>
                </div>
                <p className="text-sm leading-relaxed mb-4 opacity-95">
                  Complete session notes within 48 hours to maintain compliance. Your notes help
                  track client progress and support continuity of care.
                </p>
                <p className="text-xs opacity-80">— Non-diagnostic suggestion</p>
              </div>

              {/* Need attention */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                  Quick actions
                </h3>

                <div className="space-y-3">
                  <Link
                    to="/bookings"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Video className="w-4 h-4 text-slate-600" />
                    <p className="text-sm text-slate-700">My sessions</p>
                  </Link>
                  <Link
                    to="/messages"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Users className="w-4 h-4 text-slate-600" />
                    <p className="text-sm text-slate-700">Messages</p>
                  </Link>
                  <Link
                    to="/resources"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-600" />
                    <p className="text-sm text-slate-700">Resources</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-xs text-slate-400 mt-8 text-center">
            All client data is encrypted and confidential • For clinical use only
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
