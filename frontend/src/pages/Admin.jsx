import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import {
  Users,
  Shield,
  Search,
  Loader2,
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Trash2,
  Plus,
  Edit2,
  BarChart3,
  Flag,
  UserCheck,
  Activity,
  FileText,
  AlertTriangle,
  ExternalLink,
  UserX,
  Check,
  X
} from "lucide-react";
import { adminApi } from "../api/adminApi";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "posts", label: "Community Posts", icon: MessageSquare },
  { id: "reports", label: "Post Reports", icon: Flag },
  { id: "userReports", label: "User Reports", icon: UserX },
  { id: "crisis", label: "Crisis Alerts", icon: AlertTriangle },
  { id: "therapists", label: "Therapists", icon: UserCheck },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "system", label: "System Health", icon: Activity }
];

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getStats().then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-slate-800">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Manage users, content, and resources</p>
            </div>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    tab === t.id ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          {tab === "overview" && <OverviewTab stats={stats} loading={loading} setTab={setTab} />}
          {tab === "users" && <UsersTab setError={setError} />}
          {tab === "posts" && <PostsTab setError={setError} />}
          {tab === "reports" && <ReportsTab setError={setError} />}
          {tab === "userReports" && <UserReportsTab setError={setError} />}
          {tab === "crisis" && <CrisisAlertsTab setError={setError} />}
          {tab === "therapists" && <TherapistsTab setError={setError} />}
          {tab === "resources" && <ResourcesTab setError={setError} />}
          {tab === "analytics" && <AnalyticsTab setError={setError} />}
          {tab === "system" && <SystemTab setError={setError} />}
        </div>
      </div>
    </AppLayout>
  );
}

function OverviewTab({ stats, loading, setTab }) {
  const [reports, setReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [therapists, setTherapists] = useState([]);

  useEffect(() => {
    if (stats?.pendingReports > 0) adminApi.getReports({ status: "pending" }).then(({ data }) => setReports(data.reports?.slice(0, 5) || [])).catch(() => {});
    if (stats?.pendingUserReports > 0) adminApi.getUserReports({ status: "pending" }).then(({ data }) => setUserReports(data.reports?.slice(0, 5) || [])).catch(() => {});
    if (stats?.pendingTherapists > 0) adminApi.getPendingTherapists().then(({ data }) => setTherapists(data.therapists?.slice(0, 5) || [])).catch(() => {});
  }, [stats]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users },
    { label: "Active Therapists", value: stats?.activeTherapists ?? 0, icon: UserCheck },
    { label: "Pending Post Reports", value: stats?.pendingReports ?? 0, icon: Flag, alert: (stats?.pendingReports ?? 0) > 0 },
    { label: "Pending User Reports", value: stats?.pendingUserReports ?? 0, icon: UserX, alert: (stats?.pendingUserReports ?? 0) > 0 },
    { label: "Crisis Alerts Today", value: stats?.crisisAlertsToday ?? 0, icon: AlertTriangle, alert: (stats?.crisisAlertsToday ?? 0) > 0 },
    { label: "Pending Verification", value: stats?.pendingTherapists ?? 0, icon: Shield },
    { label: "Community Posts", value: stats?.totalPosts ?? 0, icon: MessageSquare },
    { label: "Pending Posts", value: stats?.pendingPosts ?? 0, icon: MessageSquare, alert: (stats?.pendingPosts ?? 0) > 0 },
    { label: "Resources", value: stats?.totalResources ?? 0, icon: BookOpen },
    { label: "Mood Logs", value: stats?.totalMoods ?? 0, icon: BarChart3 },
    { label: "AI Chat Sessions", value: stats?.totalChats ?? 0, icon: MessageSquare },
    { label: "Group Chat Messages", value: stats?.communityGroupMessages ?? 0, icon: MessageSquare },
    { label: "Peer DM Messages", value: stats?.peerMessages ?? 0, icon: MessageSquare }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`bg-white rounded-2xl p-5 border shadow-sm ${c.alert ? "border-amber-200" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{c.label}</p>
                <Icon className={`w-5 h-5 ${c.alert ? "text-amber-500" : "text-slate-400"}`} />
              </div>
              <p className="text-2xl font-semibold text-slate-800 mt-1">{c.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-800">Quick Actions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTab("therapists")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm">
              <UserCheck className="w-4 h-4" /> Verify Therapists
            </button>
            <button onClick={() => setTab("reports")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm">
              <Flag className="w-4 h-4" /> Post Reports
            </button>
            <button onClick={() => setTab("userReports")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm">
              <UserX className="w-4 h-4" /> User Reports
            </button>
            <button onClick={() => setTab("posts")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm">
              <MessageSquare className="w-4 h-4" /> Approve Posts
            </button>
            <button onClick={() => setTab("crisis")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm">
              <AlertTriangle className="w-4 h-4" /> Crisis Alerts
            </button>
            <Link to="/therapist/chat-moderation" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm">
              <MessageSquare className="w-4 h-4" /> Moderate Chat
            </Link>
            <button onClick={() => setTab("resources")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm">
              <FileText className="w-4 h-4" /> Create Resource
            </button>
            <button onClick={() => setTab("system")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm">
              <Activity className="w-4 h-4" /> System Health
            </button>
          </div>
        </div>

        {/* Recent Post Reports */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-800">Recent Post Reports</h3>
            {reports.length > 0 && <button onClick={() => setTab("reports")} className="text-sm text-slate-600 hover:text-slate-800">View all</button>}
          </div>
          {reports.length === 0 ? <p className="text-xs text-slate-500">No pending post reports</p> : (
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r._id} className="flex justify-between items-start gap-2 p-2 rounded-lg bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 truncate">{r.reason}</p>
                    <p className="text-xs text-slate-500">{r.reporterId?.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent User Reports */}
      {userReports.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-800">Recent User Reports</h3>
            <button onClick={() => setTab("userReports")} className="text-sm text-slate-600 hover:text-slate-800">View all</button>
          </div>
          <div className="space-y-2">
            {userReports.map((r) => (
              <div key={r._id} className="flex justify-between items-start gap-2 p-2 rounded-lg bg-slate-50">
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 truncate">{r.reportedUser?.name} reported by {r.reporter?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{r.reason}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex-shrink-0">pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Therapists */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-800">Pending Therapist Verification</h3>
            {therapists.length > 0 && <button onClick={() => setTab("therapists")} className="text-sm text-slate-600 hover:text-slate-800">View all</button>}
          </div>
          {therapists.length === 0 ? <p className="text-xs text-slate-500">No pending verifications</p> : (
            <div className="space-y-2">
              {therapists.map((t) => (
                <div key={t._id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">pending</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsersTab({ setError }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [updating, setUpdating] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    adminApi.getUsers({ page, limit: 15, search: search || undefined, role: roleFilter || undefined })
      .then(({ data }) => {
        setUsers(data.users || []);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadUsers(), [page, search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    setError("");
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setUpdating(userId);
    setError("");
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white"
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="therapist">Therapist</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                          {u.name?.charAt(0) || "?"}
                        </div>
                        <span className="font-medium text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.role === "admin" ? "bg-amber-100 text-amber-800" :
                        u.role === "therapist" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.status || "active"}
                        onChange={(e) => handleStatusChange(u._id, e.target.value)}
                        disabled={updating === u._id}
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white disabled:opacity-50"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={updating === u._id}
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white disabled:opacity-50"
                      >
                        <option value="user">User</option>
                        <option value="therapist">Therapist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-between px-4 py-3 border-t border-slate-100">
              <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-sm disabled:opacity-50">Previous</button>
                <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostsTab({ setError }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [deleting, setDeleting] = useState(null);
  const [approving, setApproving] = useState(null);

  const loadPosts = () => {
    setLoading(true);
    adminApi.getPosts({ page, limit: 15, status: statusFilter || undefined })
      .then(({ data }) => {
        setPosts(data.posts || []);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load posts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadPosts(), [page, statusFilter]);

  const handleDelete = async (id) => {
    setDeleting(id);
    setError("");
    try {
      await adminApi.deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const handleApprove = async (id) => {
    setApproving(id);
    setError("");
    try {
      await adminApi.approvePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id) => {
    setApproving(id);
    setError("");
    try {
      await adminApi.rejectPost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject");
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="space-y-4">
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
        <option value="">All posts</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === "pending" ? "bg-amber-100 text-amber-800" :
                    p.status === "approved" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                  }`}>{p.status}</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mt-1">{p.displayName}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.author?.email}</p>
                <p className="text-slate-600 text-sm mt-2">{p.content}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(p.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {p.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(p._id)}
                      disabled={approving === p._id}
                      className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(p._id)}
                      disabled={approving === p._id}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(p._id)}
                  disabled={deleting === p._id}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-between pt-4">
              <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-sm disabled:opacity-50">Previous</button>
                <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResourcesTab({ setError }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "article",
    title: "",
    excerpt: "",
    content: "",
    category: "",
    icon: "",
    number: "",
    text: "",
    url: "",
    desc: "",
    steps: [],
    duration: "",
    description: ""
  });

  const loadResources = () => {
    setLoading(true);
    adminApi.getResources({ page, limit: 20, type: typeFilter || undefined })
      .then(({ data }) => {
        setResources(data.resources || []);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load resources"))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadResources(), [page, typeFilter]);

  const handleDelete = async (id) => {
    setError("");
    try {
      await adminApi.deleteResource(id);
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await adminApi.updateResource(editing._id, form);
        setResources((prev) => prev.map((r) => (r._id === editing._id ? { ...r, ...form } : r)));
      } else {
        const { data } = await adminApi.createResource(form);
        setResources((prev) => [data.resource, ...prev]);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ type: "article", title: "", excerpt: "", content: "", category: "", icon: "", number: "", text: "", url: "", desc: "", steps: [], duration: "", description: "", videoId: "", source: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white w-fit"
        >
          <option value="">All types</option>
          <option value="crisis">Crisis</option>
          <option value="article">Article</option>
          <option value="video">Video</option>
          <option value="coping">Coping</option>
          <option value="breathing">Breathing</option>
          <option value="link">Link</option>
        </select>
        <button
          onClick={() => { setShowForm(true); setEditing(null); setForm({ type: "article", title: "", excerpt: "", content: "", category: "", icon: "", number: "", text: "", url: "", desc: "", steps: [], duration: "", description: "", videoId: "", source: "" }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700"
        >
          <Plus className="w-4 h-4" />
          Add resource
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-medium text-slate-800">{editing ? "Edit resource" : "New resource"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm">
                <option value="crisis">Crisis</option>
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="coping">Coping</option>
                <option value="breathing">Breathing</option>
                <option value="link">Link</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                required className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Icon (emoji)</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="📚" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Excerpt</label>
            <input type="text" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" />
          </div>
          {(form.type === "video" || form.type === "link") && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="block text-sm text-slate-600 mb-1">URL</label><input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>
              {form.type === "video" && <div><label className="block text-sm text-slate-600 mb-1">YouTube Video ID (or paste full URL)</label><input type="text" value={form.videoId || ""} onChange={(e) => setForm({ ...form, videoId: e.target.value })} placeholder="dQw4w9WgXcQ" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>}
              {form.type === "link" && <div><label className="block text-slate-600 mb-1">Source (e.g. app/podcast name)</label><input type="text" value={form.source || ""} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Headspace" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>}
              <div><label className="block text-slate-600 mb-1">Duration (video only)</label><input type="text" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="5 min" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>
            </div>
          )}
          {(form.type === "crisis" || form.type === "coping" || form.type === "breathing") && (
            <div className="grid gap-4 sm:grid-cols-2">
              {form.type === "crisis" && (
                <>
                  <div><label className="block text-sm text-slate-600 mb-1">Number</label><input type="text" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>
                  <div><label className="block text-sm text-slate-600 mb-1">Text</label><input type="text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>
                  <div><label className="block text-sm text-slate-600 mb-1">URL</label><input type="text" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>
                  <div><label className="block text-sm text-slate-600 mb-1">Description</label><input type="text" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>
                </>
              )}
              {(form.type === "coping" || form.type === "breathing") && (
                <>
                  <div><label className="block text-sm text-slate-600 mb-1">Steps (one per line)</label><textarea value={(form.steps || []).join("\n")} onChange={(e) => setForm({ ...form, steps: e.target.value.split("\n").filter(Boolean) })} rows={4} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>
                  {form.type === "breathing" && (
                    <>
                      <div><label className="block text-sm text-slate-600 mb-1">Duration</label><input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2–4 min" className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>
                      <div><label className="block text-sm text-slate-600 mb-1">Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm" /></div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{r.type}</span>
                  <h4 className="font-medium text-slate-800 mt-1">{r.title}</h4>
                  <p className="text-xs text-slate-500 truncate">{r.excerpt || r.desc}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(r); setForm({ type: r.type, title: r.title, excerpt: r.excerpt || "", content: r.content || "", category: r.category || "", icon: r.icon || "", number: r.number || "", text: r.text || "", url: r.url || "", desc: r.desc || "", steps: r.steps || [], duration: r.duration || "", description: r.description || "", videoId: r.videoId || "", source: r.source || "" }); setShowForm(true); }}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-between pt-4">
          <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1 rounded-lg border border-slate-200 text-sm disabled:opacity-50">Previous</button>
            <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
              className="px-3 py-1 rounded-lg border border-slate-200 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsTab({ setError }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const loadReports = () => {
    setLoading(true);
    adminApi.getReports({ status: statusFilter || undefined })
      .then(({ data }) => setReports(data.reports || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load reports"))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadReports(), [statusFilter]);

  const handleResolve = async (id, status) => {
    setError("");
    try {
      await adminApi.resolveReport(id, { status });
      setReports((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resolve");
    }
  };

  return (
    <div className="space-y-4">
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="resolved">Resolved</option>
        <option value="dismissed">Dismissed</option>
      </select>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-medium text-slate-800">{r.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">By: {r.reporterId?.email}</p>
                  {r.postId && <p className="text-sm text-slate-600 mt-2 truncate max-w-md">{r.postId?.content}</p>}
                  <p className="text-xs text-slate-400 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === "pending" ? "bg-amber-100 text-amber-800" :
                    r.status === "resolved" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                  }`}>{r.status}</span>
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => handleResolve(r._id, "resolved")} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">Resolve</button>
                      <button onClick={() => handleResolve(r._id, "dismissed")} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">Dismiss</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserReportsTab({ setError }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const loadReports = () => {
    setLoading(true);
    adminApi.getUserReports({ status: statusFilter || undefined })
      .then(({ data }) => setReports(data.reports || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load user reports"))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadReports(), [statusFilter]);

  const handleResolve = async (reportId, status) => {
    setError("");
    setActionLoading(reportId);
    try {
      await adminApi.resolveUserReport(reportId, { status });
      setReports((prev) => prev.map((r) => (r._id === reportId ? { ...r, status } : r)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resolve");
    } finally {
      setActionLoading(null);
    }
  };

  function formatDate(d) {
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="space-y-4">
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="resolved">Resolved</option>
        <option value="dismissed">Dismissed</option>
      </select>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <p className="text-slate-500">No user reports yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r._id}
              className={`bg-white rounded-2xl p-5 border shadow-sm ${
                r.status === "pending" ? "border-amber-200" : "border-slate-100"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-medium text-slate-800">
                    {r.reportedUser?.name || "Unknown"} reported by {r.reporter?.name || "Unknown"}
                  </p>
                  <p className="text-slate-600 text-sm mt-2">{r.reason}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatDate(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === "pending" ? "bg-amber-100 text-amber-800" :
                    r.status === "resolved" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                  }`}>{r.status}</span>
                  {r.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleResolve(r._id, "resolved")}
                        disabled={actionLoading === r._id}
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                        title="Resolve"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleResolve(r._id, "dismissed")}
                        disabled={actionLoading === r._id}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                        title="Dismiss"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CrisisAlertsTab({ setError }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("");

  const loadAlerts = () => {
    setLoading(true);
    adminApi.getCrisisAlerts({ limit: 50, source: sourceFilter || undefined })
      .then(({ data }) => setAlerts(data.alerts || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load crisis alerts"))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadAlerts(), [sourceFilter]);

  return (
    <div className="space-y-4">
      <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
        className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white">
        <option value="">All sources</option>
        <option value="anonymous">Anonymous chat</option>
        <option value="logged_in">Logged-in user</option>
      </select>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <p className="text-slate-500">No crisis alerts recorded</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${a.source === "anonymous" ? "bg-slate-100 text-slate-600" : "bg-blue-100 text-blue-800"}`}>
                      {a.source === "anonymous" ? "Anonymous" : "Logged-in"}
                    </span>
                    {a.riskLevel && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        a.riskLevel === "critical" ? "bg-rose-100 text-rose-800" :
                        a.riskLevel === "high" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {a.riskLevel}
                      </span>
                    )}
                    {a.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                        {a.category.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  {a.userId && <p className="text-sm text-slate-600 mt-2">User: {a.userId?.email}</p>}
                  {a.messagePreview && <p className="text-sm text-slate-700 mt-2 italic">&quot;{a.messagePreview}...&quot;</p>}
                  <p className="text-xs text-slate-400 mt-2">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TherapistsTab({ setError }) {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);

  const loadTherapists = () => {
    setLoading(true);
    adminApi.getPendingTherapists()
      .then(({ data }) => setTherapists(data.therapists || []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadTherapists(), []);

  const handleVerify = async (id) => {
    setVerifying(id);
    setError("");
    try {
      await adminApi.verifyTherapist(id);
      setTherapists((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify");
    } finally {
      setVerifying(null);
    }
  };

  const handleRejectClick = (t) => setRejectModal(t);

  const handleRejectConfirm = async (reason) => {
    if (!rejectModal) return;
    setVerifying(rejectModal._id);
    setError("");
    try {
      await adminApi.rejectTherapist(rejectModal._id, { reason });
      setTherapists((prev) => prev.filter((p) => p._id !== rejectModal._id));
      setRejectModal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject");
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>
      ) : therapists.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <p className="text-slate-500">No pending therapist verifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {therapists.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">{t.name}</p>
                <p className="text-sm text-slate-500">{t.email}</p>
                {(t.license || t.licenseType || t.licenseDocumentUrl) && (
                  <div className="mt-2 space-y-0.5">
                    {t.licenseType && <p className="text-xs text-slate-600">Type: {t.licenseType}</p>}
                    {t.license && <p className="text-xs text-slate-600">Number: {t.license}</p>}
                    {t.licenseDocumentUrl && (
                      <a
                        href={t.licenseDocumentUrl.startsWith("http") ? t.licenseDocumentUrl : `${(import.meta.env.VITE_API_URL || window.location.origin).replace(/\/api\/?$/, "")}${t.licenseDocumentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-3 h-3" /> View license document
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/search?q=verify+${encodeURIComponent((t.licenseType || "") + " " + (t.license || ""))}+license`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 ml-2"
                    >
                      Verify at board
                    </a>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleVerify(t._id)} disabled={verifying === t._id}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 disabled:opacity-50">Verify</button>
                <button onClick={() => handleRejectClick(t)} disabled={verifying === t._id}
                  className="px-4 py-2 border border-rose-200 text-rose-600 rounded-xl text-sm hover:bg-rose-50 disabled:opacity-50">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setRejectModal(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-slate-800 mb-2">Reject therapist application</h3>
              <p className="text-sm text-slate-500 mb-4">Add a reason (optional). The therapist will see this if they inquire.</p>
              <RejectReasonForm
                onSubmit={(reason) => handleRejectConfirm(reason)}
                onCancel={() => setRejectModal(null)}
                loading={verifying === rejectModal._id}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RejectReasonForm({ onSubmit, onCancel, loading }) {
  const [reason, setReason] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(reason);
      }}
      className="space-y-4"
    >
      <textarea
        placeholder="e.g. License could not be verified, Document unclear..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none"
      />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm hover:bg-rose-700 disabled:opacity-50">
          {loading ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </form>
  );
}

function AnalyticsTab({ setError }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>;

  const cards = [
    { label: "New users today", value: data?.usersToday ?? 0 },
    { label: "New users this week", value: data?.usersThisWeek ?? 0 },
    { label: "Mood logs today", value: data?.moodsToday ?? 0 },
    { label: "Mood logs this week", value: data?.moodsThisWeek ?? 0 },
    { label: "Community posts today", value: data?.postsToday ?? 0 },
    { label: "Community posts this week", value: data?.postsThisWeek ?? 0 },
    { label: "Group chat messages today", value: data?.groupMessagesToday ?? 0 },
    { label: "Group chat messages this week", value: data?.groupMessagesThisWeek ?? 0 },
    { label: "Peer DM messages today", value: data?.peerMessagesToday ?? 0 },
    { label: "Peer DM messages this week", value: data?.peerMessagesThisWeek ?? 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-2xl font-semibold text-slate-800 mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      {data?.moodDistribution && Object.keys(data.moodDistribution).length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-medium text-slate-800 mb-4">Mood distribution (this week)</h3>
          <div className="flex gap-4 flex-wrap">
            {[1, 2, 3, 4, 5].map((v) => (
              <div key={v} className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{v}:</span>
                <span className="font-medium text-slate-800">{data.moodDistribution[v] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SystemTab({ setError }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getHealth()
      .then(({ data }) => setHealth(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load health"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-slate-400 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${health?.status === "ok" ? "bg-green-500" : "bg-rose-500"}`} />
        <h3 className="font-medium text-slate-800">System status: {health?.status ?? "unknown"}</h3>
      </div>
      <div className="grid gap-2 text-sm">
        <p><span className="text-slate-500">Uptime:</span> <span className="text-slate-800">{health?.uptime ? Math.floor(health.uptime) + "s" : "—"}</span></p>
        <p><span className="text-slate-500">Environment:</span> <span className="text-slate-800">{health?.env ?? "—"}</span></p>
        <p><span className="text-slate-500">Timestamp:</span> <span className="text-slate-800">{health?.timestamp ?? "—"}</span></p>
      </div>
    </div>
  );
}
