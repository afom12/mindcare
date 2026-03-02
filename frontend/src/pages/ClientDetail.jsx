import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { therapistApi } from "../api/therapistApi";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Calendar,
  FileText,
  Heart
} from "lucide-react";

const MOOD_LABELS = ["", "Very low", "Low", "Okay", "Good", "Great"];
const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-slate-100 text-slate-600",
  completed: "bg-blue-100 text-blue-800"
};

export default function ClientDetail() {
  const { clientId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    therapistApi
      .getClientDetail(clientId)
      .then(({ data: res }) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-500">Client not found</p>
          <Link to="/clients" className="ml-4 text-slate-600 hover:text-slate-800">
            Back to clients
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { client, sessions, recentMoods } = data;

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/clients"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to clients
          </Link>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-slate-600">
                    {client.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-slate-800">{client.name}</h1>
                  <p className="text-slate-500">{client.email}</p>
                </div>
              </div>
              <Link
                to={`/messages?client=${client.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-medium text-slate-800">Treatment history</h2>
                </div>
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <p className="text-slate-500 text-sm">No sessions yet</p>
                  ) : (
                    sessions.map((s) => (
                      <div
                        key={s._id}
                        className="p-4 bg-slate-50 rounded-xl flex justify-between items-start gap-4"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {new Date(s.scheduledAt).toLocaleDateString()} at{" "}
                            {new Date(s.scheduledAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                          <span
                            className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                              STATUS_COLORS[s.status] || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {s.status}
                          </span>
                          {s.notes && (
                            <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{s.notes}</p>
                          )}
                        </div>
                        <Link
                          to="/bookings"
                          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Notes
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-lg font-medium text-slate-800">Recent mood</h2>
                </div>
                {recentMoods.length === 0 ? (
                  <p className="text-slate-500 text-sm">No mood data</p>
                ) : (
                  <div className="space-y-2">
                    {recentMoods.slice(0, 7).map((m, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-slate-600">
                          {MOOD_LABELS[m.value] || "—"}
                        </span>
                        <span className="text-slate-400">
                          {new Date(m.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
