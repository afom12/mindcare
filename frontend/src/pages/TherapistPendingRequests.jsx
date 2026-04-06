import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { therapistApi } from "../api/therapistApi";
import { Loader2, UserPlus, MessageSquare, Check } from "lucide-react";

export default function TherapistPendingRequests() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    therapistApi
      .getPendingAssignments()
      .then(({ data }) => setAssignments(data.assignments || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (id) => {
    setAccepting(id);
    setError("");
    try {
      await therapistApi.acceptAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not accept");
    } finally {
      setAccepting(null);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-medium text-slate-800 mb-2">Student requests</h1>
          <p className="text-slate-500 mb-8">
            Students using the mobile app can request therapist support. Accept a request to
            assign them to you and open a message thread (same as Messages).
          </p>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No pending requests right now</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {assignments.map((a) => (
                <li
                  key={a.id}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <p className="font-medium text-slate-800">{a.studentName}</p>
                    <p className="text-sm text-slate-500">{a.studentEmail}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Requested {a.requestedAt ? new Date(a.requestedAt).toLocaleString() : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAccept(a.id)}
                      disabled={accepting === a.id}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 disabled:opacity-60"
                    >
                      {accepting === a.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Accept & assign to me
                    </button>
                    <Link
                      to={`/messages?client=${a.studentId}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm hover:bg-slate-50"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Open thread
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
