import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { moodApi } from "../api/moodApi";

const MOOD_OPTIONS = [
  { value: 5, label: "Great" },
  { value: 4, label: "Good" },
  { value: 3, label: "Okay" },
  { value: 2, label: "Low" },
  { value: 1, label: "Struggling" }
];

const MoodContext = createContext(null);

export const MoodProvider = ({ children }) => {
  const [moods, setMoods] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, averageThisWeek: null });
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadMoodHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    try {
      const { data } = await moodApi.getHistory({ limit: 30, days: 7 });
      setMoods(data.moods || []);
      setStats(data.stats || { total: 0, thisWeek: 0, averageThisWeek: null });
    } catch (err) {
      console.error("Failed to load mood history:", err);
      setMoods([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadMoodHistory();
  }, [loadMoodHistory]);

  const logMood = useCallback(async (value, note = "") => {
    if (!value || value < 1 || value > 5) return null;
    setLoading(true);
    try {
      const { data } = await moodApi.logMood(value, note);
      await loadMoodHistory();
      return data.mood;
    } catch (err) {
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
