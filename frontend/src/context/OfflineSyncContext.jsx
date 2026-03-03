import { createContext, useContext, useEffect, useCallback } from "react";
import { moodApi } from "../api/moodApi";
import { assessmentApi } from "../api/assessmentApi";
import { offlineStorage } from "../utils/offlineStorage";

const OfflineSyncContext = createContext(null);

export function OfflineSyncProvider({ children }) {
  const syncMoodQueue = useCallback(async () => {
    const queue = offlineStorage.getMoodQueue();
    if (queue.length === 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    for (const item of queue) {
      try {
        await moodApi.logMood(item.value, item.note || "");
      } catch (err) {
        console.warn("Sync mood failed, will retry later:", err);
        return;
      }
    }
    offlineStorage.clearMoodQueue();
    window.dispatchEvent(new CustomEvent("mindcare:moodSynced"));
  }, []);

  const syncAssessmentQueue = useCallback(async () => {
    const queue = offlineStorage.getAssessmentQueue();
    if (queue.length === 0) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    for (const item of queue) {
      try {
        await assessmentApi.submit(item.type, item.answers);
      } catch (err) {
        console.warn("Sync assessment failed, will retry later:", err);
        return;
      }
    }
    offlineStorage.clearAssessmentQueue();
    window.dispatchEvent(new CustomEvent("mindcare:assessmentSynced"));
  }, []);

  const syncAll = useCallback(async () => {
    if (!navigator.onLine) return;
    await syncMoodQueue();
    await syncAssessmentQueue();
  }, [syncMoodQueue, syncAssessmentQueue]);

  useEffect(() => {
    const handleOnline = () => syncAll();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncAll]);

  return (
    <OfflineSyncContext.Provider value={{ syncAll }}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export const useOfflineSync = () => useContext(OfflineSyncContext);
