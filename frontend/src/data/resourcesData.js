export const CRISIS_RESOURCES = [
  { name: "988 Suicide & Crisis Lifeline", number: "988", desc: "Call or text 24/7", type: "phone" },
  { name: "Crisis Text Line", text: "Text HOME to 741741", desc: "Free, 24/7 support", type: "text" },
  { name: "International Association for Suicide Prevention", url: "https://www.iasp.info/resources/Crisis_Centres/", desc: "Global crisis centers", type: "link" }
];

export const ARTICLES = [
  {
    id: 1,
    title: "Managing Academic Stress",
    excerpt: "Practical tips for students dealing with exam pressure, deadlines, and workload.",
    content: "Academic stress is common. Try breaking tasks into smaller steps, taking regular breaks (Pomodoro technique), and talking to a counselor or advisor. Sleep and exercise matter more than you think.",
    icon: "📚",
    category: "Academic"
  },
  {
    id: 2,
    title: "Understanding Anxiety",
    excerpt: "What anxiety feels like and when to seek support.",
    content: "Anxiety can show up as racing thoughts, tension, or avoidance. Grounding techniques (5-4-3-2-1: name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste) can help. If it's affecting daily life, consider talking to a professional.",
    icon: "🌊",
    category: "Anxiety"
  },
  {
    id: 3,
    title: "Better Sleep Habits",
    excerpt: "Simple changes for more restful sleep.",
    content: "Keep a consistent sleep schedule, limit screens before bed, avoid caffeine after 2 PM, and create a calm bedtime routine. If sleep problems persist, a doctor or sleep specialist can help.",
    icon: "🌙",
    category: "Sleep"
  },
  {
    id: 4,
    title: "When You Feel Overwhelmed",
    excerpt: "How to cope when everything feels like too much.",
    content: "Pause and breathe. Choose one small thing you can do right now. It's okay to ask for help—from friends, family, or a counselor. You don't have to figure it all out alone.",
    icon: "🍃",
    category: "Stress"
  }
];

export const COPING_STRATEGIES = [
  { title: "5-4-3-2-1 Grounding", steps: ["Name 5 things you can see", "4 you can hear", "3 you can touch", "2 you can smell", "1 you can taste"] },
  { title: "Box Breathing", steps: ["Breathe in for 4 counts", "Hold for 4 counts", "Breathe out for 4 counts", "Hold for 4 counts", "Repeat 4 times"] },
  { title: "Progressive Muscle Relaxation", steps: ["Tense your feet for 5 seconds, then release", "Move up: calves, thighs, hands, arms, shoulders", "Notice the difference between tension and relaxation"] },
  { title: "Reach Out", steps: ["Text or call someone you trust", "Share how you're feeling", "You don't have to have solutions—just connection"] }
];

export const BREATHING_EXERCISES = [
  {
    id: "box",
    name: "Box Breathing",
    duration: "2–4 min",
    description: "Calms the nervous system. Used by Navy SEALs for focus under pressure.",
    steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds", "Hold for 4 seconds", "Repeat 4–6 times"]
  },
  {
    id: "4-7-8",
    name: "4-7-8 Breathing",
    duration: "1–2 min",
    description: "Promotes relaxation and can help with sleep.",
    steps: ["Inhale through nose for 4 seconds", "Hold for 7 seconds", "Exhale slowly through mouth for 8 seconds", "Repeat 3–4 times"]
  },
  {
    id: "belly",
    name: "Belly Breathing",
    duration: "3–5 min",
    description: "Activates the parasympathetic nervous system for calm.",
    steps: ["Place one hand on your chest, one on your belly", "Breathe in slowly—let your belly rise more than your chest", "Breathe out slowly", "Repeat at a comfortable pace"]
  }
];
