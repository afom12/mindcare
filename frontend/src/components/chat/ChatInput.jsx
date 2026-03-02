import { useRef, useEffect, useState } from "react";

export default function ChatInput({ onSubmit, disabled, placeholder, suggestedPrompts }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSubmit?.(trimmed);
      setValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePromptClick = (prompt) => {
    if (!disabled) {
      onSubmit?.(prompt);
    }
  };

  return (
    <div className="space-y-4">
      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-xs text-slate-400 self-center">Try:</span>
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePromptClick(p)}
              disabled={disabled}
              className="px-3 py-1.5 rounded-full text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Type your message... (Enter to send)"}
        disabled={disabled}
        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 outline-none transition disabled:opacity-50 bg-white"
      />
      <button
        type="submit"
        disabled={disabled || !value?.trim()}
        className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition">
        Send
      </button>
    </form>
    </div>
  );
}
