import { ChatProvider } from "./context/ChatContext";
import { MoodProvider } from "./context/MoodContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ChatProvider>
      <MoodProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </MoodProvider>
    </ChatProvider>
  );
}

export default App;
