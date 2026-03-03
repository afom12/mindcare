/**
 * Static crisis resources - always available offline.
 * Used when the app cannot reach the API.
 */
export const CRISIS_RESOURCES_OFFLINE = [
  { title: "988 Suicide & Crisis Lifeline", number: "988", desc: "Call or text 24/7", type: "crisis" },
  { title: "Crisis Text Line", text: "Text HOME to 741741", desc: "Free, 24/7 support", type: "crisis" },
  {
    title: "International Association for Suicide Prevention",
    url: "https://www.iasp.info/resources/Crisis_Centres/",
    desc: "Global crisis centers",
    type: "crisis"
  }
];

export const BREATHING_OFFLINE = [
  {
    type: "breathing",
    category: "Focus",
    title: "Box Breathing",
    duration: "2–4 min",
    description: "Calms the nervous system.",
    steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds", "Hold for 4 seconds", "Repeat 4–6 times"]
  },
  {
    type: "breathing",
    category: "Relaxation",
    title: "4-7-8 Breathing",
    duration: "1–2 min",
    description: "Promotes relaxation and can help with sleep.",
    steps: ["Inhale through nose for 4 seconds", "Hold for 7 seconds", "Exhale slowly through mouth for 8 seconds", "Repeat 4 times"]
  },
  {
    type: "breathing",
    category: "Calm",
    title: "Belly Breathing",
    duration: "3–5 min",
    description: "Activates the parasympathetic nervous system.",
    steps: ["Place one hand on your chest, one on your belly", "Breathe in slowly—let your belly rise", "Exhale slowly—belly falls", "Keep chest still"]
  }
];

export const COPING_OFFLINE = [
  {
    type: "coping",
    category: "Grounding",
    title: "5-4-3-2-1 Grounding",
    steps: ["Name 5 things you can see", "4 you can hear", "3 you can touch", "2 you can smell", "1 you can taste"]
  },
  {
    type: "coping",
    category: "Breathing",
    title: "Box Breathing",
    steps: ["Breathe in for 4 counts", "Hold for 4 counts", "Breathe out for 4 counts", "Hold for 4 counts", "Repeat 4 times"]
  },
  {
    type: "coping",
    category: "Relaxation",
    title: "Progressive Muscle Relaxation",
    steps: ["Tense your feet for 5 seconds, then release", "Move up: calves, thighs, hands, arms, shoulders"]
  }
];
