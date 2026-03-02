import { Link } from "react-router-dom";

export default function LegalFooter() {
  return (
    <footer className="mt-auto py-6 px-4 border-t border-slate-100">
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
        <Link to="/privacy" className="hover:text-slate-700 transition-colors">
          Privacy
        </Link>
        <Link to="/terms" className="hover:text-slate-700 transition-colors">
          Terms
        </Link>
        <Link to="/contact" className="hover:text-slate-700 transition-colors">
          Contact
        </Link>
        <Link to="/faq" className="hover:text-slate-700 transition-colors">
          FAQ
        </Link>
      </div>
    </footer>
  );
}
