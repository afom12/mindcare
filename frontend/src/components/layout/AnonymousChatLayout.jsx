import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function AnonymousChatLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-800">MindCare AI</span>
            </Link>
            <Link
              to="/login"
              className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              Sign in to save your conversation
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
