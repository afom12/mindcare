import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { chatAPI } from "../api/api";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { data } = await chatAPI.sendMessage(userMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          isCrisis: data.isCrisis,
          resources: data.resources
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't respond right now. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-teal-800">MindCare AI</h1>
          <p className="text-xs text-slate-500">Hi, {user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100">
          Log out
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg font-medium text-slate-700 mb-1">Welcome to MindCare AI</p>
            <p className="text-sm">Share how you're feeling. I'm here to listen.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-slate-200 text-slate-800 shadow-sm"
              }`}>
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              {msg.isCrisis && msg.resources && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                  {msg.resources.map((r, j) => (
                    <div key={j} className="text-sm">
                      <span className="font-medium">{r.name}</span>
                      {r.number && <span className="text-teal-600 ml-2">{r.number}</span>}
                      {r.text && <span className="text-teal-600 ml-2">{r.text}</span>}
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline ml-2">
                          Visit
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
              <span className="inline-block w-2 h-2 bg-teal-500 rounded-full animate-bounce mr-1" />
              <span className="inline-block w-2 h-2 bg-teal-500 rounded-full animate-bounce mr-1 animation-delay-150" />
              <span className="inline-block w-2 h-2 bg-teal-500 rounded-full animate-bounce animation-delay-300" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t border-slate-200 max-w-2xl mx-auto w-full">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
