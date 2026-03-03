import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { moodApi } from "../api/moodApi";
import { offlineStorage } from "../utils/offlineStorage";

const MOOD_OPTIONS = [
  { value: 5, label: "Great" },
  { value: 4, label: "Good" },
  { value: 3, label: "Okay" },
  { value: 2, label: "Low" },
  { value: 1, label: "Struggling" }
];

const isOfflineError = (err) =>
  !navigator.onLine ||
  err?.message === "Network Error" ||
  err?.code === "ERR_NETWORK";

const MoodContext = createContext(null);

export const MoodProvider = ({ children }) => {
  const [moods, setMoods] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, averageThisWeek: null });
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const loadMoodHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    try {
      const { data } = await moodApi.getHistory({ limit: 50, days: 14 });
      setMoods(data.moods || []);
      setStats(data.stats || { total: 0, thisWeek: 0, averageThisWeek: null });
    } catch (err) {
      if (!isOfflineError(err)) console.error("Failed to load mood history:", err);
      setMoods([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadMoodHistory();
    setPendingCount(offlineStorage.getMoodQueue().length);
  }, [loadMoodHistory]);

  useEffect(() => {
    const onSynced = () => {
      loadMoodHistory();
      setPendingCount(offlineStorage.getMoodQueue().length);
    };
    window.addEventListener("mindcare:moodSynced", onSynced);
    return () => window.removeEventListener("mindcare:moodSynced", onSynced);
  }, [loadMoodHistory]);

  const logMood = useCallback(async (value, note = "") => {
    if (!value || value < 1 || value > 5) return null;
    setLoading(true);
    try {
      const { data } = await moodApi.logMood(value, note);
      await loadMoodHistory();
      return data.mood;
    } catch (err) {
      if (isOfflineError(err)) {
        offlineStorage.addMoodToQueue(value, note);
        setPendingCount(offlineStorage.getMoodQueue().length);
        return { value, label: MOOD_OPTIONS.find((o) => o.value === value)?.label || "Saved", pending: true };
      }
      console.error("Failed to log mood:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadMoodHistory]);

  return (
    <MoodContext.Provider
      value={{
        moods,
        stats,
        loading,
        loadingHistory,
        logMood,
        loadMoodHistory,
        pendingCount,
        MOOD_OPTIONS
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error("useMood must be used within MoodProvider");
  return ctx;
};
