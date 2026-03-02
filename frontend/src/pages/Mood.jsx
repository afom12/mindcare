import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useMood } from "../context/MoodContext";
import { Heart } from "lucide-react";
import { formatTime } from "../utils/helpers";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeeklyChartData(moods) {
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

export default function Mood() {
  const { moods, stats, loading, loadingHistory, logMood, MOOD_OPTIONS } = useMood();
  const [note, setNote] = useState("");
  const [justLogged, setJustLogged] = useState(null);

  const chartHeights = getWeeklyChartData(moods);
  const hasData = chartHeights.some((h) => h > 0);

  const handleLog = async (value) => {
    const mood = await logMood(value, note);
    if (mood) {
      setJustLogged(mood.label);
      setNote("");
      setTimeout(() => setJustLogged(null), 2000);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-slate-800">Mood Tracker</h1>
            <p className="text-slate-500 mt-1">Log how you&apos;re feeling and see your trends</p>
          </div>

          {/* Log Mood Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
            <h2 className="text-lg font-medium text-slate-800 mb-4">How are you feeling right now?</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {MOOD_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleLog(value)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-slate-800 text-slate-600 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
            />
            {justLogged && (
              <p className="mt-3 text-sm text-slate-700 font-medium">✓ Logged as {justLogged}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-2xl font-semibold text-slate-800">{stats.total}</p>
              <p className="text-sm text-slate-500">Total check-ins</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <p className="text-2xl font-semibold text-slate-800">
                {stats.averageThisWeek != null ? stats.averageThisWeek.toFixed(1) : "—"}
              </p>
              <p className="text-sm text-slate-500">Avg this week (1–5)</p>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
            <h3 className="text-lg font-medium text-slate-800 mb-6">Weekly trend</h3>
            <div className="flex items-end justify-between h-40 gap-2">
              {DAY_LABELS.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-slate-600 to-slate-800 rounded-t-lg transition-all duration-500"
                    style={{ height: `${hasData ? Math.max(chartHeights[i], 8) : 20}%` }}
                  />
                  <span className="text-xs text-slate-500">{day}</span>
                </div>
              ))}
            </div>
            {!hasData && (
              <p className="text-center text-slate-400 text-sm mt-4">Log your mood to see trends</p>
            )}
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-medium text-slate-800 mb-4">Recent entries</h3>
            {loadingHistory ? (
              <p className="text-slate-500 text-sm">Loading...</p>
            ) : moods.length === 0 ? (
              <p className="text-slate-500 text-sm">No mood entries yet. Log your first check-in above.</p>
            ) : (
              <div className="space-y-3">
                {moods.slice(0, 15).map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{m.label}</p>
                        {m.note && (
                          <p className="text-xs text-slate-500 mt-0.5">{m.note}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatTime(m.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
