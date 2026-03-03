import { ChatProvider } from "./context/ChatContext";
import { MoodProvider } from "./context/MoodContext";
import { NotificationProvider } from "./context/NotificationContext";
import { OfflineSyncProvider } from "./context/OfflineSyncContext";
import OfflineIndicator from "./components/OfflineIndicator";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <OfflineSyncProvider>
      <ChatProvider>
        <MoodProvider>
          <NotificationProvider>
            <OfflineIndicator />
            <AppRoutes />
          </NotificationProvider>
        </MoodProvider>
      </ChatProvider>
    </OfflineSyncProvider>
  );
}

export default App;
