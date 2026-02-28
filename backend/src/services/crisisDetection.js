/**
 * Crisis detection for mental health support.
 * When users express self-harm or suicidal thoughts, we provide immediate resources.
 */

const CRISIS_KEYWORDS = [
  "kill myself",
  "killing myself",
  "kill my self",
  "killing my self",
  "suicide",
  "end my life",
  "want to die",
  "self harm",
  "self-harm",
  "hurt myself",
  "take my life",
  "end it all",
  "no reason to live",
  "better off dead"
];

const CRISIS_RESPONSE = {
  isCrisis: true,
  message: `I'm really concerned about what you've shared. Your life matters, and there are people who want to help.

**Please reach out now:**

🇺🇸 **National Suicide Prevention Lifeline:** 988 (call or text)
📱 **Crisis Text Line:** Text HOME to 741741 (24/7, free)

These services are confidential, free, and available 24/7. Trained counselors are ready to listen.

You don't have to face this alone. Please reach out to someone who can help right now.`,
  resources: [
    { name: "988 Suicide & Crisis Lifeline", number: "988", available: "24/7" },
    { name: "Crisis Text Line", text: "HOME to 741741", available: "24/7" },
    { name: "International Association for Suicide Prevention", url: "https://www.iasp.info/resources/Crisis_Centres/" }
  ]
};

export const detectCrisis = (message) => {
  if (!message || typeof message !== "string") return null;

  const lowerMessage = message.toLowerCase().trim();

  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      return CRISIS_RESPONSE;
    }
  }

  return null;
};
