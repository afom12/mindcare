import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/authApi";
import { chatApi, ANON_SESSION_KEY } from "../api/chatApi";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/dashboard";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data);
      const sessionId = localStorage.getItem(ANON_SESSION_KEY);
      if (sessionId) {
        try {
          await chatApi.migrateChat(sessionId);
        } catch (_) {}
        localStorage.removeItem(ANON_SESSION_KEY);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left side */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
        <p className="text-sm font-medium text-slate-400 tracking-wider mb-12">MINDCARE</p>
        <div className="space-y-8">
          <div className="text-8xl mb-6">🫧</div>
          <h1 className="text-5xl lg:text-6xl font-light text-slate-800 tracking-tight">
            welcome back.
          </h1>
          <p className="text-lg text-slate-500 max-w-sm leading-relaxed">
            we&apos;ve missed you — continue where you left off
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-light text-slate-800">welcome back</h2>
              <p className="text-sm text-slate-400 mt-1">sign in to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <p className="text-rose-600 text-sm text-center">{error}</p>
                </div>
              )}

              <input
                type="email"
                placeholder="email"
                required
                value={form.email}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 bg-white"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                type="password"
                placeholder="password"
                required
                value={form.password}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 bg-white"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-800 text-white py-3 px-6 rounded-xl font-medium text-sm tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "a moment..." : "sign in →"}
                </button>
              </div>

              <div className="text-center pt-2 space-y-1">
                <Link
                  to="/chat"
                  className="block text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  try anonymously →
                </Link>
                <Link
                  to="/register"
                  className="block text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  new here? create account
                </Link>
              </div>
            </form>
          </div>

          <p className="text-xs text-center text-slate-400 mt-6">
            a gentle companion, not a therapist
          </p>
        </div>
      </div>
    </div>
  );
}
