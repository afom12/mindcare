import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { assessmentApi } from "../api/assessmentApi";
import { offlineStorage } from "../utils/offlineStorage";
import { PHQ9_QUESTIONS, GAD7_QUESTIONS, getSeverityLabel as getSeverity } from "../data/assessmentQuestions";
import {
  BarChart3,
  Loader2,
  ChevronRight,
  TrendingDown,
  Brain,
  Heart,
  ArrowLeft
} from "lucide-react";

const SCALE_LABELS = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

const isOfflineError = (err) =>
  !navigator.onLine ||
  err?.message === "Network Error" ||
  err?.code === "ERR_NETWORK";

export default function Assessments() {
  const [view, setView] = useState("menu"); // menu | take | result | progress
  const [type, setType] = useState(null); // phq9 | gad7
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");

  const getStaticQuestions = (t) => (t === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS);

  const loadQuestions = async (t) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await assessmentApi.getQuestions(t);
      setQuestions(data.questions || []);
      setAnswers(new Array(data.questions?.length || 0).fill(null));
      setType(t);
      setView("take");
    } catch (err) {
      if (isOfflineError(err)) {
        const q = getStaticQuestions(t);
        setQuestions(q);
        setAnswers(new Array(q.length).fill(null));
        setType(t);
        setView("take");
      } else {
        setError(err.response?.data?.message || "Failed to load assessment");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (answers.some((a) => a === null || a === undefined)) {
      setError("Please answer all questions");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await assessmentApi.submit(type, answers);
      setResult(data.assessment);
      setView("result");
    } catch (err) {
      if (isOfflineError(err)) {
        offlineStorage.addAssessmentToQueue(type, answers);
        const score = answers.reduce((s, a) => s + a, 0);
        setResult({ score, severity: getSeverity(score, type), pending: true });
        setPendingAssessment(true);
        setView("result");
      } else {
        setError(err.response?.data?.message || "Failed to submit");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (t) => {
    setLoading(true);
    setError("");
    try {
      const [historyRes, progressRes] = await Promise.all([
        assessmentApi.getHistory({ type: t, limit: 20 }),
        assessmentApi.getProgress(t, { days: 90 })
      ]);
      setHistory(historyRes.data.assessments || []);
      setProgress(progressRes.data);
      setType(t);
      setView("progress");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load progress");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onSynced = () => {};
    window.addEventListener("mindcare:assessmentSynced", onSynced);
    return () => window.removeEventListener("mindcare:assessmentSynced", onSynced);
  }, []);

  const getSeverityColor = (severity) => {
    if (!severity) return "bg-slate-100 text-slate-600";
    const s = severity.toLowerCase();
    if (s.includes("severe") || s.includes("moderately severe")) return "bg-rose-100 text-rose-800";
    if (s.includes("moderate")) return "bg-amber-100 text-amber-800";
    if (s.includes("mild")) return "bg-sky-100 text-sky-800";
    return "bg-emerald-100 text-emerald-800";
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto">
          {view !== "menu" && (
            <button
              onClick={() => setView("menu")}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <div className="mb-8">
            <h1 className="text-2xl font-medium text-slate-800">Clinical Outcome Measures</h1>
            <p className="text-slate-500 mt-1">
              Evidence-based assessments to track your progress over time
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          {view === "menu" && (
            <div className="space-y-4">
              <div
                onClick={() => loadQuestions("phq9")}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-violet-50 rounded-xl flex items-center justify-center">
                      <Brain className="w-7 h-7 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-slate-600">
                        PHQ-9
                      </h3>
                      <p className="text-sm text-slate-500">
                        Depression screening (9 questions)
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); loadQuestions("phq9"); }}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700"
                  >
                    Take now
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); loadProgress("phq9"); }}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50"
                  >
                    View progress
                  </button>
                </div>
              </div>

              <div
                onClick={() => loadQuestions("gad7")}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center">
                      <Heart className="w-7 h-7 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-slate-600">
                        GAD-7
                      </h3>
                      <p className="text-sm text-slate-500">
                        Anxiety screening (7 questions)
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); loadQuestions("gad7"); }}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700"
                  >
                    Take now
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); loadProgress("gad7"); }}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50"
                  >
                    View progress
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-6">
                These tools are for self-monitoring only. They are not a substitute for professional
                diagnosis. <Link to="/therapists" className="text-slate-600 hover:underline">Connect with a therapist</Link> for clinical support.
              </p>
            </div>
          )}

          {view === "take" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-medium text-slate-800 mb-6">
                {type === "phq9" ? "PHQ-9" : "GAD-7"} — Over the last 2 weeks, how often have you been bothered by:
              </h2>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((q, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-slate-700 mb-3">
                        {i + 1}. {q}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 2, 3].map((v) => (
                          <button
                            key={v}
                            onClick={() => setAnswers((a) => [...a.slice(0, i), v, ...a.slice(i + 1)])}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                              answers[i] === v
                                ? "bg-slate-800 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {SCALE_LABELS[v]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-6 flex gap-3">
                    <button
                      onClick={() => setView("menu")}
                      className="px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || answers.some((a) => a === null || a === undefined)}
                      className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 disabled:opacity-50"
                    >
                      {loading ? "Submitting..." : "See results"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "result" && result && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              {result.pending && (
                <p className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                  Saved offline. Will sync when you reconnect.
                </p>
              )}
              <h2 className="text-lg font-medium text-slate-800 mb-4">Your results</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">{result.score}</span>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Score</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.severity)}`}>
                    {result.severity}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                {type === "phq9"
                  ? "PHQ-9 scores range from 0–27. Higher scores indicate more depressive symptoms."
                  : "GAD-7 scores range from 0–21. Higher scores indicate more anxiety symptoms."}
              </p>
              <div className="flex gap-3">
                {!result.pending && (
                  <button
                    onClick={() => loadProgress(type)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View progress
                  </button>
                )}
                <button
                  onClick={() => setView("menu")}
                  className="px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {view === "progress" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-medium text-slate-800 mb-4">
                  {type === "phq9" ? "PHQ-9" : "GAD-7"} progress
                </h2>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  </div>
                ) : progress?.assessments?.length > 0 ? (
                  <>
                    {progress.improvement != null && progress.improvement > 0 && (
                      <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 rounded-xl text-emerald-800 text-sm">
                        <TrendingDown className="w-4 h-4" />
                        <span>Score improved by {progress.improvement} points over this period</span>
                      </div>
                    )}
                    <div className="h-48 flex items-end gap-1">
                      {progress.assessments.map((a, i) => {
                        const maxScore = type === "phq9" ? 27 : 21;
                        const pct = Math.max(15, (a.score / maxScore) * 100);
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-slate-600 rounded-t min-w-[8px] transition-all hover:bg-slate-700"
                            style={{ height: `${pct}%` }}
                            title={`${new Date(a.date).toLocaleDateString()}: ${a.score} (${a.severity})`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>{progress.assessments[0] && new Date(progress.assessments[0].date).toLocaleDateString()}</span>
                      <span>{progress.assessments[progress.assessments.length - 1] && new Date(progress.assessments[progress.assessments.length - 1].date).toLocaleDateString()}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm">No assessments yet. Take one to see your progress.</p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-medium text-slate-800 mb-4">History</h3>
                {history.length === 0 ? (
                  <p className="text-slate-500 text-sm">No history yet</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((a) => (
                      <div
                        key={a._id}
                        className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <span className="font-medium text-slate-800">{a.score}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(a.severity)}`}>
                            {a.severity}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
