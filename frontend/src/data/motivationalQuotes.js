/**
 * Motivational quotes by mood level.
 * Shown on Mood page and in notifications.
 */
export const QUOTES_BY_MOOD = {
  1: [
    "You don't have to be great to start, but you have to start to be great.",
    "This feeling will pass. You've survived 100% of your bad days.",
    "Be gentle with yourself. You're doing the best you can.",
    "Small steps still move you forward.",
    "It's okay to not be okay. Asking for help is strength.",
    "You are worthy of peace and healing."
  ],
  2: [
    "Every day may not be good, but there's something good in every day.",
    "Progress, not perfection.",
    "You're stronger than you think.",
    "Take it one moment at a time.",
    "It's brave to feel. It's brave to keep going.",
    "Tomorrow is a new chance."
  ],
  3: [
    "You're doing better than you think.",
    "Keep going. You're on the right path.",
    "Balance is a practice, not a destination.",
    "Be kind to your mind.",
    "Small wins count."
  ],
  4: [
    "Nice work checking in with yourself.",
    "You're building healthy habits.",
    "Keep that momentum going."
  ],
  5: [
    "Glad you're feeling good today!",
    "Celebrate the good moments.",
    "Your wellness matters."
  ]
};

export const getQuoteForMood = (value) => {
  const quotes = QUOTES_BY_MOOD[value] || QUOTES_BY_MOOD[3];
  return quotes[Math.floor(Math.random() * quotes.length)];
};
