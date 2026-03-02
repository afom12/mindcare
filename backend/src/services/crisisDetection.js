/**
 * Clinical-grade crisis detection for mental health support.
 * Multi-classifier approach: suicidal ideation, self-harm, psychosis.
 * When users express crisis signals, we provide immediate resources and escalation.
 */

const CRISIS_RESPONSES = {
  suicidal: {
    category: "suicidal",
    riskLevel: "critical",
    reason: "Your message suggests thoughts of ending your life.",
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
  },
  selfHarm: {
    category: "self_harm",
    riskLevel: "critical",
    reason: "Your message suggests thoughts or plans of self-harm.",
    message: `I'm concerned about what you've shared. Your safety matters.

**Please reach out now:**

🇺🇸 **988 Suicide & Crisis Lifeline:** 988 (call or text)
📱 **Crisis Text Line:** Text HOME to 741741 (24/7, free)

These services support people experiencing self-harm thoughts. They're confidential and available 24/7.

You deserve support. Please reach out.`,
    resources: [
      { name: "988 Suicide & Crisis Lifeline", number: "988", available: "24/7" },
      { name: "Crisis Text Line", text: "HOME to 741741", available: "24/7" },
      { name: "Self-Injury Outreach & Support", url: "https://sioutreach.org/" }
    ]
  },
  psychosis: {
    category: "psychosis",
    riskLevel: "high",
    reason: "Your message suggests experiences that may need professional support.",
    message: `I hear that you're going through something difficult. What you're experiencing may benefit from professional support.

**Please consider reaching out:**

🇺🇸 **988 Suicide & Crisis Lifeline:** 988 (for any crisis)
📱 **NAMI Helpline:** 1-800-950-6264 (Mon–Fri, 10am–10pm ET)

A mental health professional can provide the right support. You don't have to navigate this alone.`,
    resources: [
      { name: "988 Suicide & Crisis Lifeline", number: "988", available: "24/7" },
      { name: "NAMI Helpline", number: "1-800-950-6264", available: "Mon–Fri 10am–10pm ET" },
      { name: "International Association for Suicide Prevention", url: "https://www.iasp.info/resources/Crisis_Centres/" }
    ]
  }
};

// Suicidal ideation – highest priority
const SUICIDAL_KEYWORDS = [
  "kill myself",
  "killing myself",
  "kill my self",
  "killing my self",
  "suicide",
  "suicidal",
  "end my life",
  "want to die",
  "want to kill myself",
  "take my life",
  "end it all",
  "end myself",
  "no reason to live",
  "better off dead",
  "thinking about suicide",
  "considering suicide",
  "planning to die",
  "going to kill myself",
  "don't want to be here",
  "wish i was dead",
  "wish i weren't here"
];

// Self-harm (non-suicidal)
const SELF_HARM_KEYWORDS = [
  "self harm",
  "self-harm",
  "hurt myself",
  "cutting myself",
  "cut myself",
  "burn myself",
  "self injury",
  "self-injury",
  "hurting myself"
];

// Psychosis / severe distress
const PSYCHOSIS_KEYWORDS = [
  "voices telling me",
  "someone is watching me",
  "they're after me",
  "being followed",
  "people can read my thoughts",
  "government is tracking me",
  "everyone is against me"
];

/**
 * Detect crisis signals and return appropriate response.
 * Priority: suicidal > self-harm > psychosis
 * @returns {Object|null} { category, riskLevel, reason, message, resources, isCrisis: true } or null
 */
export const detectCrisis = (message) => {
  if (!message || typeof message !== "string") return null;

  const lowerMessage = message.toLowerCase().trim();

  for (const keyword of SUICIDAL_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      return { ...CRISIS_RESPONSES.suicidal, isCrisis: true };
    }
  }

  for (const keyword of SELF_HARM_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      return { ...CRISIS_RESPONSES.selfHarm, isCrisis: true };
    }
  }

  for (const keyword of PSYCHOSIS_KEYWORDS) {
    if (lowerMessage.includes(keyword)) {
      return { ...CRISIS_RESPONSES.psychosis, isCrisis: true };
    }
  }

  return null;
};
