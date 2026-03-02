import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import { updateProfile } from "../api/authApi";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { name: form.name.trim() };
      if (form.email.trim() !== user?.email) {
        payload.email = form.email.trim();
        payload.currentPassword = form.currentPassword;
      }
      const { data } = await updateProfile(payload);
      updateUser(data.user);
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const emailChanged = form.email.trim() !== user?.email;

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-800">Edit Profile</h1>
            <p className="text-slate-500 text-sm mt-1">Update your account information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                <p className="text-rose-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {emailChanged && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current password (required to change email)
                </label>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  required={emailChanged}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-4 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-slate-800 text-white py-3 px-6 rounded-xl font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
