import { Phone } from "lucide-react";

export default function CrisisAlert() {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4">
      <h3 className="font-semibold text-rose-800 flex items-center gap-2">
        You are not alone
      </h3>
      <p className="text-sm text-rose-700 mt-2">
        If you are in immediate danger, please contact a trusted person or a local support service.
      </p>
      <div className="mt-4 space-y-2">
        <a
          href="tel:988"
          className="flex items-center gap-2 text-sm font-medium text-rose-800 hover:text-rose-900"
        >
          <Phone size={16} />
          988 — Suicide & Crisis Lifeline (US)
        </a>
        <p className="text-xs text-rose-600">
          Text HOME to 741741 for Crisis Text Line (24/7, free)
        </p>
      </div>
    </div>
  );
}
