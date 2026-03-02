import { Link } from "react-router-dom";

export default function TermsOfService() {
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
        <h1 className="text-3xl font-medium text-slate-800 mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: February 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p>
              By using MindCare AI, you agree to these Terms of Service. If you do not agree,
              please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">2. Description of Service</h2>
            <p>
              MindCare AI provides a platform for mental health support, including AI-assisted chat,
              mood tracking, resources, and connections to licensed therapists. The AI chat is a
              companion tool and is not a substitute for professional mental health care.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">3. User Responsibilities</h2>
            <p>You agree to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Provide accurate information when registering</li>
              <li>Use the service in a lawful and respectful manner</li>
              <li>Not misuse the platform for harassment or harmful content</li>
              <li>Keep your account credentials secure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">4. Crisis Situations</h2>
            <p>
              If you or someone you know is in crisis, please contact emergency services (e.g., 988
              in the US) or a crisis helpline. MindCare AI is not an emergency service and cannot
              replace immediate professional help in life-threatening situations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">5. Limitation of Liability</h2>
            <p>
              MindCare AI is provided &quot;as is&quot;. We are not liable for any indirect, incidental, or
              consequential damages arising from your use of the service. Our liability is limited
              to the extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">6. Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the service after
              changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-800 mb-3">7. Contact</h2>
            <p>
              Questions about these terms? Visit our{" "}
              <Link to="/contact" className="text-slate-700 underline hover:text-slate-900">
                contact page
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
