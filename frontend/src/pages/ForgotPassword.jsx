import { useState } from "react";
import { Link } from "react-router-dom";
import LegalFooter from "../components/LegalFooter";
import { forgotPassword } from "../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
        <p className="text-sm font-medium text-slate-400 tracking-wider mb-12">MINDCARE</p>
        <div className="space-y-8">
          <div className="text-8xl mb-6">🔐</div>
          <h1 className="text-5xl lg:text-6xl font-light text-slate-800 tracking-tight">
            reset password
          </h1>
          <p className="text-lg text-slate-500 max-w-sm leading-relaxed">
            We&apos;ll send you a link to create a new password
          </p>
        </div>
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 mx-auto bg-teal-50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✉️</span>
                </div>
                <h2 className="text-xl font-light text-slate-800">Check your email</h2>
                <p className="text-slate-500 text-sm">
                  If an account exists for <strong>{email}</strong>, we sent a reset link. It expires in 1 hour.
                </p>
                <Link
                  to="/login"
                  className="inline-block text-teal-600 font-medium text-sm hover:text-teal-700"
                >
                  ← Back to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-light text-slate-800">Forgot password?</h2>
                  <p className="text-sm text-slate-400 mt-1">Enter your email to get a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div role="alert" className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                      <p className="text-rose-600 text-sm text-center">{error}</p>
                    </div>
                  )}

                  <input
                    type="email"
                    placeholder="email"
                    required
                    value={email}
                    autoComplete="email"
                    aria-label="Email address"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition text-sm placeholder:text-slate-400 bg-white"
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-800 text-white py-3 px-6 rounded-xl font-medium text-sm tracking-wide hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Send reset link"}
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
