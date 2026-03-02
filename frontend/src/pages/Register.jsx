import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser, registerTherapist } from "../api/authApi";
import { ANON_SESSION_KEY } from "../api/chatApi";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", license: "", licenseType: "" });
  const [licenseDocument, setLicenseDocument] = useState(null);
  const [isTherapist, setIsTherapist] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const sessionId = localStorage.getItem(ANON_SESSION_KEY) || undefined;
      let res;
      if (isTherapist) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("email", form.email);
        fd.append("password", form.password);
        fd.append("license", form.license.trim());
        fd.append("licenseType", form.licenseType.trim());
        if (sessionId) fd.append("sessionId", sessionId);
        if (licenseDocument) fd.append("licenseDocument", licenseDocument);
        res = await registerTherapist(fd);
      } else {
        res = await registerUser({ ...form, sessionId });
      }
      login(res.data);
      if (sessionId) localStorage.removeItem(ANON_SESSION_KEY);
      navigate(isTherapist ? "/bookings" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
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
          <div className="text-8xl mb-6">🌱</div>
          <h1 className="text-5xl lg:text-6xl font-light text-slate-800 tracking-tight">
            begin.
          </h1>
          <p className="text-lg text-slate-500 max-w-sm leading-relaxed">
            start your journey toward clarity and calm
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-light text-slate-800">create account</h2>
              <p className="text-sm text-slate-400 mt-1">join our gentle community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <p className="text-rose-600 text-sm text-center">{error}</p>
                </div>
              )}

              <input
                type="text"
                placeholder="full name"
                required
                value={form.name}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 bg-white"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

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
                minLength={6}
                value={form.password}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 bg-white"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <p className="text-xs text-slate-400 ml-1">minimum 6 characters</p>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTherapist}
                  onChange={(e) => {
                  setIsTherapist(e.target.checked);
                  if (!e.target.checked) setLicenseDocument(null);
                }}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-600">I&apos;m a professional therapist</span>
              </label>

              {isTherapist && (
                <>
                  <input
                    type="text"
                    placeholder="License type (e.g. LPC, LMFT, LCSW - California)"
                    required
                    value={form.licenseType}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 bg-white"
                    onChange={(e) => setForm({ ...form, licenseType: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="License number *"
                    required
                    value={form.license}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 bg-white"
                    onChange={(e) => setForm({ ...form, license: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">License document (photo or PDF) *</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      required
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                      onChange={(e) => setLicenseDocument(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-slate-500 mt-0.5">JPEG, PNG, or PDF. Max 5MB.</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-1">
                    Your credentials will be verified against official licensing databases before approval.
                  </p>
                </>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || (isTherapist && (!form.license.trim() || !form.licenseType.trim() || !licenseDocument))}
                  className="w-full bg-slate-800 text-white py-3 px-6 rounded-xl font-medium text-sm tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "a moment..." : "create account →"}
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
                  to="/login"
                  className="block text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  already have an account? sign in
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
