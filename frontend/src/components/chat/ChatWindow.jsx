import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import CrisisAlert from "./CrisisAlert";

export default function ChatWindow({ messages, loading, loadingHistory, error, onRetry, recentMood, onSendPrompt }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const hasCrisisMessage = messages.some((m) => m.isCrisis);

  if (loadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading your conversation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasCrisisMessage && <CrisisAlert />}

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm flex items-center justify-between gap-4">
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium text-sm transition"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {messages.length === 0 && !loading && (
        <div className="text-center text-slate-500 mt-20">
          <p className="text-lg font-medium text-slate-600">Start a conversation</p>
          <p className="mt-2">Share how you&apos;re feeling. You are not alone.</p>
          {recentMood?.value <= 2 && onSendPrompt && (
            <p className="mt-4 text-sm text-slate-500">
              You could try: &quot;I&apos;m feeling overwhelmed&quot; or &quot;I need to talk&quot;
            </p>
          )}
        </div>
      )}

      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} />
      ))}

      {loading && <TypingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
