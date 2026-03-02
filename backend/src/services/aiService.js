import axios from "axios";

const SYSTEM_PROMPT = `You are a compassionate mental health support assistant for students. Your role is to help with stress, anxiety, academic pressure, and general emotional well-being.

IMPORTANT: Give SPECIFIC, VARIED responses based on what the user actually said. Acknowledge their specific situation. Offer concrete support. Keep responses warm but concise (2-4 sentences). Never repeat the same phrase.`;

/**
 * Smart fallback when Groq API fails (e.g. no API key, rate limit).
 * Returns contextual, varied responses based on message content.
 */
function getFallbackResponse(message) {
  const lower = (message || "").toLowerCase().trim();

  // Academic / grades / failing
  if (
    lower.includes("fail") ||
    lower.includes("f grade") ||
    lower.includes("failing") ||
    lower.includes("bad grade") ||
    lower.includes("flunk") ||
    lower.includes("flunking")
  ) {
    const options = [
      "Getting F's is really tough, and it's okay to feel overwhelmed. One step at a time: talk to your teacher or advisor about options—retakes, tutoring, or adjusting your load. Your grades don't define your worth.",
      "Failing grades can feel crushing. Remember, many people have bounced back from rough semesters. Reach out to your school's academic support or a counselor—they can help you figure out a path forward.",
      "I hear how stressful this is. Failing doesn't mean you're a failure. Consider talking to your professor about what went wrong and what options you have. You're not alone in this."
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Sadness / depression
  if (
    lower.includes("sad") ||
    lower.includes("depressed") ||
    lower.includes("down") ||
    lower.includes("hopeless")
  ) {
    const options = [
      "Feeling sad is valid, and it takes courage to share that. Sometimes small things help—a short walk, talking to someone you trust, or just resting. Would you like to talk more about what's going on?",
      "I'm sorry you're feeling this way. Sadness can feel heavy. Have you been able to do anything that usually helps, even a little? And have you considered reaching out to a counselor or someone close?",
      "Thank you for sharing. Feeling sad doesn't mean something is wrong with you. It might help to name one small thing you could do today—even just getting outside or texting a friend."
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Relationship / divorce
  if (
    lower.includes("divorce") ||
    lower.includes("breakup") ||
    lower.includes("break up") ||
    lower.includes("relationship") ||
    lower.includes("partner") ||
    lower.includes("spouse")
  ) {
    const options = [
      "Relationship changes like divorce or breakups are really hard. It's normal to feel a mix of emotions. Talking to a counselor or trusted friend can help you process things. You don't have to go through this alone.",
      "I hear you. Divorce and breakups can shake everything up. Give yourself permission to feel what you feel. If you have access to a therapist or support group, that can make a big difference.",
      "That sounds incredibly difficult. Major relationship changes take time to process. Be gentle with yourself, and consider reaching out to someone who can support you—a friend, family member, or professional."
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Anxiety / stress / overwhelmed
  if (
    lower.includes("anxious") ||
    lower.includes("anxiety") ||
    lower.includes("stress") ||
    lower.includes("overwhelm") ||
    lower.includes("worried") ||
    lower.includes("nervous")
  ) {
    const options = [
      "Anxiety can feel overwhelming. Try a simple grounding exercise: name 5 things you can see, 4 you can hear, 3 you can touch. Or take a few slow breaths. What's weighing on you most right now?",
      "Stress and anxiety are tough. Breaking things into smaller steps can help. Is there one thing you could do today that would ease the pressure a bit? And have you talked to anyone about how you're feeling?",
      "I hear you. When anxiety hits, even small steps matter. A short walk, talking to someone, or writing down your thoughts can help. What would feel most helpful to you right now?"
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // School / exams / academic pressure
  if (
    lower.includes("school") ||
    lower.includes("exam") ||
    lower.includes("test") ||
    lower.includes("study") ||
    lower.includes("class")
  ) {
    const options = [
      "School pressure is real. Try to take short breaks when you study, and get some sleep—it really helps. If it feels like too much, talking to a teacher or counselor can open up options.",
      "Academic pressure can be exhausting. Remember to breathe and take breaks. Sometimes talking through your workload with someone can make it feel more manageable. How are you doing with it?",
      "I get it—school can be a lot. Prioritize rest and breaks. If you're struggling, your school likely has tutoring or counseling. You don't have to figure it all out alone."
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Lonely / alone / isolated
  if (
    lower.includes("lonely") ||
    lower.includes("alone") ||
    lower.includes("isolated") ||
    lower.includes("no one") ||
    lower.includes("nobody")
  ) {
    const options = [
      "Feeling lonely is painful, and you're not alone in feeling that way. Reaching out—even a small text to someone—can help. Clubs, study groups, or counseling can also be ways to connect.",
      "Loneliness is hard. Sometimes the first step is small—saying hi to someone, joining a group, or talking to a counselor. You matter, and connection is possible.",
      "I hear you. Loneliness can feel heavy. Is there anyone you could reach out to today, even briefly? Or a group or activity that might help you feel more connected?"
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Nothing / numb / empty
  if (
    lower.includes("nothing") ||
    lower.includes("numb") ||
    lower.includes("empty") ||
    lower.includes("don't feel") ||
    lower.includes("dont feel")
  ) {
    const options = [
      "Feeling numb or empty is valid. Sometimes our minds shut down when things feel too big. Gentle steps—moving your body, being outside, or talking to someone—can sometimes help. You're not broken.",
      "That sounds really hard. Feeling nothing can be a way of coping when things are overwhelming. If you can, try one small thing today. And consider talking to a counselor—they can help with this.",
      "Thank you for sharing. Feeling numb doesn't mean you're fine—it can mean you're carrying a lot. Small steps and talking to someone you trust can help. You deserve support."
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Greetings / casual
  if (
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower === "hola" ||
    lower.length < 4
  ) {
    const options = [
      "Hi there. How are you doing today?",
      "Hello. I'm here if you want to talk.",
      "Hey. What's on your mind?"
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Default - varied generic responses
  const defaults = [
    "Thanks for sharing. I'm here to listen. What's been going on for you lately?",
    "I hear you. Sometimes putting it into words helps. Want to tell me more?",
    "Thank you for reaching out. How are you feeling about things right now?",
    "I'm glad you're here. What would be most helpful to talk about?",
    "I'm listening. What's on your mind today?"
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export const getAIResponse = async (message, conversationHistory = [], moodContext = null) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "your-groq-api-key-here") {
    console.warn("GROQ_API_KEY not set. Using smart fallback. Add your key to .env for full AI.");
    return getFallbackResponse(message);
  }

  let systemContent = SYSTEM_PROMPT;
  if (moodContext?.value && moodContext?.label) {
    systemContent += `\n\n[User context: They recently logged their mood as "${moodContext.label}" (${moodContext.value}/5). You may gently acknowledge this if relevant to the conversation.]`;
    if (moodContext.value <= 2) {
      systemContent += `\n\n[IMPORTANT - Low mood today: Respond with extra gentleness and warmth. Use a softer, more supportive tone. When appropriate, suggest: a grounding exercise (5-4-3-2-1), breathing exercise, or reaching out to someone they trust. Keep responses warm and validating. You may suggest they try the Resources page for breathing exercises or coping strategies.]`;
    }
  }

  try {
    const messages = [
      { role: "system", content: systemContent },
      ...conversationHistory.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      })),
      { role: "user", content: message }
    ];

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.8,
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0]?.message?.content?.trim();
    if (content) return content;

    return getFallbackResponse(message);
  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    return getFallbackResponse(message);
  }
};
