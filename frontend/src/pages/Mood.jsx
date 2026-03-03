import { useState, useMemo } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useMood } from "../context/MoodContext";
import { Link } from "react-router-dom";
import { Heart, BarChart3, Wind, Sparkles } from "lucide-react";
import { formatTime } from "../utils/helpers";
import { getQuoteForMood } from "../data/motivationalQuotes";

function getWeeklyChartData(moods) {
  const result = [0, 0, 0, 0, 0, 0, 0];
  const dayLabels = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const targetDateStr = d.toDateString();

    const dayMoods = moods.filter((m) => {
      const created = m.createdAt ? new Date(m.createdAt) : null;
      if (!created || isNaN(created.getTime())) return false;
      return created.toDateString() === targetDateStr;
    });
    if (dayMoods.length > 0) {
      const avg = dayMoods.reduce((s, m) => s + (m.value || 0), 0) / dayMoods.length;
      result[i] = Math.round((avg / 5) * 100);
    }
    dayLabels.push(d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }));
  }
  return { heights: result, labels: dayLabels };
}

export default function Mood() {
  const { moods, stats, loading, loadingHistory, logMood, pendingCount, MOOD_OPTIONS } = useMood();
  const [note, setNote] = useState("");
  const [justLogged, setJustLogged] = useState(null);

  const { heights: chartHeights, labels: dayLabels } = getWeeklyChartData(moods);
  const hasData = chartHeights.some((h) => h > 0);
  const recentMood = moods?.[0];
  const quote = useMemo(() => getQuoteForMood(recentMood?.value || 3), [recentMood?.value]);
  const hasLowMood = recentMood && recentMood.value <= 2;

  const handleLog = async (value) => {
    const mood = await logMood(value, note);
    if (mood) {
      setJustLogged(mood.pending ? "Saved offline (will sync)" : mood.label);
      setNote("");
      setTimeout(() => setJustLogged(null), 3000);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-medium text-slate-800">Mood Tracker</h1>
              <p className="text-slate-500 mt-1">Log how you&apos;re feeling and see your trends</p>
            </div>
            <Link
              to="/assessments"
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <BarChart3 className="w-4 h-4" />
              PHQ-9 / GAD-7
            </Link>
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

          {pendingCount > 0 && (
            <p className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              {pendingCount} mood log(s) saved offline. Will sync when you reconnect.
            </p>
          )}

          {/* Quote & resources based on mood */}
          {moods.length > 0 && (
            <div className="mb-8 space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-700 italic">&quot;{quote}&quot;</p>
                  </div>
                </div>
              </div>
              {hasLowMood && (
                <Link
                  to="/resources"
                  className="block bg-slate-100 hover:bg-slate-200 rounded-2xl p-6 border border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center">
                      <Wind className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Resources that might help</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Breathing exercises and coping strategies based on your mood
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          )}

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
              {dayLabels.map((day, i) => (
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
