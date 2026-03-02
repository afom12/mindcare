import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl font-medium text-slate-800 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: February 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">1. Introduction</h2>
            <p>
              MindCare AI (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This policy explains how we collect, use, and safeguard your information when you use our
              mental health support platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect information you provide directly:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account details (name, email, password)</li>
              <li>Mood check-ins and chat conversations</li>
              <li>Booking and session information</li>
              <li>Messages between you and therapists</li>
              <li>For therapists: license information and verification documents</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Provide and improve our services</li>
              <li>Connect you with therapists and manage sessions</li>
              <li>Send important notifications (e.g., booking confirmations)</li>
              <li>Detect and respond to crisis situations</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">4. Data Security</h2>
            <p>
              We use industry-standard security measures to protect your data, including encryption
              in transit (HTTPS) and secure authentication. Session and therapy data are stored
              securely and access is restricted to authorized personnel.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">5. Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share data only when necessary to
              provide services (e.g., with your therapist), to comply with law, or to protect safety
              in crisis situations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">6. Your Rights</h2>
            <p>
              You may access, correct, or delete your personal data through your account settings.
              You can request a copy of your data or withdraw consent by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">7. Contact Us</h2>
            <p>
              For privacy-related questions, contact us at{" "}
              <Link to="/contact" className="text-slate-700 underline hover:text-slate-900">
                our contact page
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link to="/" className="text-slate-600 hover:text-slate-800 text-sm">
            ← Back to MindCare AI
          </Link>
        </div>
      </main>
    </div>
  );
}
