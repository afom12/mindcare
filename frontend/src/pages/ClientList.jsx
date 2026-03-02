import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { therapistApi } from "../api/therapistApi";
import { Users, Loader2, Search, MessageSquare, ChevronRight } from "lucide-react";

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    therapistApi
      .getClients({ search: search || undefined })
      .then(({ data }) => setClients(data.clients || []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-medium text-slate-800 mb-2">My clients</h1>
          <p className="text-slate-500 mb-8">
            View and manage your client list. Click a client for treatment history.
          </p>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 bg-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
            </div>
          ) : clients.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                {search ? "No clients match your search" : "No clients yet"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <Link
                  key={client.id}
                  to={`/clients/${client.id}`}
                  className="block bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{client.name}</p>
                        <p className="text-sm text-slate-500">{client.email}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {client.sessionCount} session{client.sessionCount !== 1 ? "s" : ""} • Last:{" "}
                          {client.lastSession
                            ? new Date(client.lastSession).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/messages?client=${client.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
                        title="Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Message
                      </Link>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
