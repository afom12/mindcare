import { Link } from "react-router-dom";
import { formatTime } from "../../utils/helpers";
import { Wind, Heart } from "lucide-react";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className="flex flex-col max-w-[85%] max-w-lg">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-slate-800 text-white rounded-br-md"
              : "bg-white border border-slate-100 text-slate-800 shadow-sm rounded-bl-md"
          }`}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          {message.suggestedResources && message.suggestedResources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <p className="text-xs font-medium text-slate-600 mb-2">You might find these helpful:</p>
              <div className="flex flex-wrap gap-2">
                {message.suggestedResources.map((r, i) => (
                  <Link
                    key={r._id || i}
                    to="/resources"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition-colors"
                  >
                    {r.type === "breathing" ? <Wind className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                    {r.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {message.isCrisis && message.resources && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <p className="text-xs font-medium text-slate-600 mb-2">Immediate support:</p>
              {message.resources.map((r, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-slate-800">{r.name}</span>
                  {r.number && (
                    <a
                      href={`tel:${r.number}`}
                      className="text-slate-600 hover:text-slate-700 font-semibold ml-2">
                      {r.number}
                    </a>
                  )}
                  {r.text && <span className="text-slate-600 ml-2">{r.text}</span>}
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:underline ml-2">
                      Visit
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-500 mt-1">
          {message.timestamp ? formatTime(message.timestamp) : "Just now"}
        </span>
      </div>
    </div>
  );
}
