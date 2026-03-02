import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MessageCircle, Send } from "lucide-react";
import { contactApi } from "../api/contactApi";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.target;
    const email = form.email.value;
    const subject = form.subject.value;
    const message = form.message.value;

    try {
      await contactApi.submit({ email, subject, message });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link to="/" className="text-slate-600 hover:text-slate-800 text-sm">
            ← Back to MindCare AI
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-medium text-slate-800 mb-2">Contact & Support</h1>
        <p className="text-slate-500 mb-10">
          Have a question or need help? We&apos;re here for you.
        </p>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-slate-800 mb-2">In crisis?</h2>
                <p className="text-slate-600 text-sm mb-3">
                  If you&apos;re in crisis or having thoughts of self-harm, please reach out to a
                  crisis helpline immediately. MindCare AI is not an emergency service.
                </p>
                <p className="text-sm font-medium text-slate-700">
                  US: 988 (Suicide & Crisis Lifeline) • Text HOME to 741741 (Crisis Text Line)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-slate-800 mb-2">General inquiries</h2>
                <p className="text-slate-600 text-sm mb-4">
                  For support, feedback, or partnership inquiries, send us a message.
                </p>

                {submitted ? (
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-slate-700 text-sm">
                      Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm">
                        {error}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="your@email.com"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        placeholder="How can we help?"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        placeholder="Your message..."
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {loading ? "Sending..." : "Send message"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex gap-6">
          <Link to="/privacy" className="text-slate-600 hover:text-slate-800 text-sm">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-slate-600 hover:text-slate-800 text-sm">
            Terms of Service
          </Link>
          <Link to="/faq" className="text-slate-600 hover:text-slate-800 text-sm">
            FAQ
          </Link>
        </div>
      </main>
    </div>
  );
}
