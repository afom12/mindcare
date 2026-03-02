import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useMood } from "../context/MoodContext";
import AppLayout from "../components/layout/AppLayout";
import AnonymousChatLayout from "../components/layout/AnonymousChatLayout";
import ChatHeader from "../components/chat/ChatHeader";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";

export default function Chat() {
  const { user } = useAuth();
  const { moods } = useMood();
  const { messages, loading, loadingHistory, error, sendMessage, loadChatHistory, clearError } = useChat();
  const Layout = user ? AppLayout : AnonymousChatLayout;

  const recentMood = moods?.[0] ? { value: moods[0].value, label: moods[0].label } : null;
  const handleSend = (content) => sendMessage(content, user ? recentMood : null);

  return (
    <Layout>
      <div className="flex flex-col flex-1 overflow-hidden bg-white">
        {/* Header - Clean border */}
        <div className="border-b border-slate-100 px-6 py-4 bg-white">
          <ChatHeader />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/30">
          <div className="max-w-3xl mx-auto w-full">
            <ChatWindow
              messages={messages}
              loading={loading}
              loadingHistory={loadingHistory}
              error={error}
              onRetry={() => {
                clearError();
                loadChatHistory();
              }}
              recentMood={recentMood}
              onSendPrompt={handleSend}
            />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-100 p-4 bg-white">
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput
              onSubmit={handleSend}
              disabled={loading}
              placeholder="Type your message here..."
              suggestedPrompts={recentMood?.value <= 2 ? ["I'm feeling overwhelmed", "I need to talk", "I'm having a rough day"] : null}
            />
            <p className="text-xs text-slate-400 mt-2 text-center">
              Your conversations are private and secure
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}