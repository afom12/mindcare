import "../config/env.js";
import connectDB from "../config/db.js";
import Resource from "../models/Resource.js";

const RESOURCES = [
  { type: "crisis", title: "988 Suicide & Crisis Lifeline", number: "988", desc: "Call or text 24/7" },
  { type: "crisis", title: "Crisis Text Line", text: "Text HOME to 741741", desc: "Free, 24/7 support" },
  { type: "crisis", title: "International Association for Suicide Prevention", url: "https://www.iasp.info/resources/Crisis_Centres/", desc: "Global crisis centers" },
  { type: "article", category: "Academic", title: "Managing Academic Stress", excerpt: "Practical tips for students dealing with exam pressure.", content: "Academic stress is common. Try breaking tasks into smaller steps, taking regular breaks.", icon: "📚" },
  { type: "article", category: "Anxiety", title: "Understanding Anxiety", excerpt: "What anxiety feels like and when to seek support.", content: "Anxiety can show up as racing thoughts, tension, or avoidance.", icon: "🌊" },
  { type: "article", category: "Sleep", title: "Better Sleep Habits", excerpt: "Simple changes for more restful sleep.", content: "Keep a consistent sleep schedule, limit screens before bed.", icon: "🌙" },
  { type: "article", category: "Stress", title: "When You Feel Overwhelmed", excerpt: "How to cope when everything feels like too much.", content: "Pause and breathe. Choose one small thing you can do right now.", icon: "🍃" },
  { type: "coping", category: "Grounding", title: "5-4-3-2-1 Grounding", steps: ["Name 5 things you can see", "4 you can hear", "3 you can touch", "2 you can smell", "1 you can taste"] },
  { type: "coping", category: "Breathing", title: "Box Breathing", steps: ["Breathe in for 4 counts", "Hold for 4 counts", "Breathe out for 4 counts", "Hold for 4 counts", "Repeat 4 times"] },
  { type: "coping", category: "Relaxation", title: "Progressive Muscle Relaxation", steps: ["Tense your feet for 5 seconds, then release", "Move up: calves, thighs, hands, arms, shoulders"] },
  { type: "coping", category: "Connection", title: "Reach Out", steps: ["Text or call someone you trust", "Share how you're feeling"] },
  { type: "breathing", category: "Focus", title: "Box Breathing", duration: "2–4 min", description: "Calms the nervous system. Used by Navy SEALs for focus under pressure.", steps: ["Inhale for 4 seconds", "Hold for 4 seconds", "Exhale for 4 seconds", "Hold for 4 seconds", "Repeat 4–6 times"] },
  { type: "breathing", category: "Relaxation", title: "4-7-8 Breathing", duration: "1–2 min", description: "Promotes relaxation and can help with sleep. Dr. Weil's technique.", steps: ["Inhale through nose for 4 seconds", "Hold for 7 seconds", "Exhale slowly through mouth for 8 seconds", "Repeat 4 times"] },
  { type: "breathing", category: "Calm", title: "Belly Breathing", duration: "3–5 min", description: "Activates the parasympathetic nervous system.", steps: ["Place one hand on your chest, one on your belly", "Breathe in slowly—let your belly rise", "Exhale slowly—belly falls", "Keep chest still"] },
  { type: "breathing", category: "Energy", title: "Energizing Breath", duration: "1–2 min", description: "Quick pick-me-up when you feel sluggish.", steps: ["Sit upright", "Quick inhales and exhales through nose (like a dog panting)", "Do for 15–30 seconds", "Then breathe normally"] },
  { type: "breathing", category: "Sleep", title: "Extended Exhale", duration: "3–5 min", description: "Slows heart rate and prepares body for sleep.", steps: ["Inhale for 4 counts", "Exhale for 6–8 counts", "Make exhale longer than inhale", "Repeat 5–10 times"] },
  { type: "coping", category: "Sleep", title: "Sleep Wind-Down", steps: ["Dim lights 1 hour before bed", "Avoid screens 30 min before", "Do 4-7-8 breathing (see Resources)", "Imagine a peaceful place in detail"] },
  { type: "coping", category: "Guided", title: "Body Scan Relaxation", steps: ["Lie down or sit comfortably", "Start at your feet—notice any tension", "Slowly move attention up: calves, thighs, belly", "Continue to chest, arms, shoulders, face", "Release tension in each area as you go"] }
];

async function seed() {
  await connectDB();
  const count = await Resource.countDocuments();
  if (count > 0) {
    console.log("Resources already seeded. Skipping.");
    process.exit(0);
  }
  await Resource.insertMany(RESOURCES);
  console.log("Seeded " + RESOURCES.length + " resources");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
