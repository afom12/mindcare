import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import LegalFooter from "../components/LegalFooter";
import { resetPassword } from "../api/authApi";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) navigate("/forgot-password", { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, { password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
        <p className="text-sm font-medium text-slate-400 tracking-wider mb-12">MINDCARE</p>
        <div className="space-y-8">
          <div className="text-8xl mb-6">🔑</div>
          <h1 className="text-5xl lg:text-6xl font-light text-slate-800 tracking-tight">
            new password
          </h1>
          <p className="text-lg text-slate-500 max-w-sm leading-relaxed">
            Choose a strong password you&apos;ll remember
          </p>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto bg-teal-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <h2 className="text-xl font-light text-slate-800">Password updated</h2>
                <p className="text-slate-500 text-sm">You can sign in with your new password now.</p>
                <Link
                  to="/login"
                  className="inline-block w-full bg-slate-800 text-white py-3 px-6 rounded-xl font-medium text-sm text-center hover:bg-slate-700 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-light text-slate-800">Set new password</h2>
                  <p className="text-sm text-slate-400 mt-1">At least 6 characters</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div role="alert" className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                      <p className="text-rose-600 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <input
                    type="password"
                    placeholder="New password"
                    required
                    minLength={6}
                    value={password}
                    autoComplete="new-password"
                    aria-label="New password"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 bg-white"
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="Confirm password"
                    required
                    minLength={6}
                    value={confirm}
                    autoComplete="new-password"
                    aria-label="Confirm password"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 bg-white"
                    onChange={(e) => setConfirm(e.target.value)}
                  />

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-800 text-white py-3 px-6 rounded-xl font-medium text-sm tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Updating..." : "Update password"}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <Link
                      to="/login"
                      className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      ← Back to sign in
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
      <LegalFooter />
    </div>
  );
}
