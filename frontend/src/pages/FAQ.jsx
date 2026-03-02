import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "What is MindCare AI?",
    a: "MindCare AI is a mental health support platform that offers AI-assisted chat, mood tracking, self-help resources, and connections to licensed therapists. It's designed to be a gentle companion on your wellness journey."
  },
  {
    q: "Is the AI chat a replacement for therapy?",
    a: "No. The AI chat is a supportive tool for self-reflection and coping strategies. It is not a substitute for professional mental health care. For serious concerns, we recommend connecting with a licensed therapist through our platform."
  },
  {
    q: "How do I book a therapy session?",
    a: "Create an account, go to 'Book Session', and browse verified therapists. Select a therapist, choose an available date and time, and submit your request. The therapist will confirm or decline."
  },
  {
    q: "Can I use MindCare AI anonymously?",
    a: "Yes. You can try the AI chat without creating an account. For full features (mood tracking, booking sessions, community), you'll need to register."
  },
  {
    q: "How is my data protected?",
    a: "We use encryption, secure authentication, and follow best practices to protect your data. See our Privacy Policy for details."
  },
  {
    q: "I'm in crisis. What should I do?",
    a: "Please contact emergency services or a crisis helpline immediately. In the US: call 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line). MindCare AI is not an emergency service."
  },
  {
    q: "How do therapists get verified?",
    a: "Therapists submit their license information and documentation. Our admin team reviews applications before granting verified status."
  }
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

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
        <h1 className="text-3xl font-medium text-slate-800 mb-2">Frequently Asked Questions</h1>
        <p className="text-slate-500 mb-10">
          Quick answers to common questions about MindCare AI.
        </p>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-100 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium text-slate-800 pr-4">{faq.q}</span>
                {open === i ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
              {open === i && (
                <div className="px-4 pb-4">
                  <p className="text-slate-600 text-sm leading-relaxed pl-0">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm mb-4">Still have questions?</p>
          <Link
            to="/contact"
            className="inline-block text-slate-600 hover:text-slate-800 text-sm font-medium"
          >
            Contact us →
          </Link>
        </div>
      </main>
    </div>
  );
}
