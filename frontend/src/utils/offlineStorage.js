/**
 * Offline storage and sync queue for MindCare AI.
 * Queues mood logs and assessments when offline, syncs when online.
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const STORAGE_KEYS = {
  MOOD_QUEUE: "mindcare_offline_mood_queue",
  ASSESSMENT_QUEUE: "mindcare_offline_assessment_queue",
  RESOURCES_CACHE: "mindcare_resources_cache",
  CACHE_TIME: "mindcare_resources_cache_time"
};

function getJson(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("OfflineStorage: failed to save", e);
  }
}

export const offlineStorage = {
  // Mood queue
  addMoodToQueue(value, note = "") {
    const queue = getJson(STORAGE_KEYS.MOOD_QUEUE);
    queue.push({ value, note, queuedAt: Date.now() });
    setJson(STORAGE_KEYS.MOOD_QUEUE, queue);
  },

  getMoodQueue() {
    return getJson(STORAGE_KEYS.MOOD_QUEUE);
  },

  clearMoodQueue() {
    setJson(STORAGE_KEYS.MOOD_QUEUE, []);
  },

  // Assessment queue
  addAssessmentToQueue(type, answers) {
    const queue = getJson(STORAGE_KEYS.ASSESSMENT_QUEUE);
    queue.push({ type, answers, queuedAt: Date.now() });
    setJson(STORAGE_KEYS.ASSESSMENT_QUEUE, queue);
  },

  getAssessmentQueue() {
    return getJson(STORAGE_KEYS.ASSESSMENT_QUEUE);
  },

  clearAssessmentQueue() {
    setJson(STORAGE_KEYS.ASSESSMENT_QUEUE, []);
  },

  // Resources cache (for offline viewing)
  setResourcesCache(resources) {
    setJson(STORAGE_KEYS.RESOURCES_CACHE, resources);
    localStorage.setItem(STORAGE_KEYS.CACHE_TIME, String(Date.now()));
  },

  getResourcesCache() {
    const cached = getJson(STORAGE_KEYS.RESOURCES_CACHE, null);
    const cachedAt = parseInt(localStorage.getItem(STORAGE_KEYS.CACHE_TIME) || "0", 10);
    if (!cached || Date.now() - cachedAt > CACHE_TTL_MS) {
      return null;
    }
    return cached;
  }
};
