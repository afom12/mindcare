/**
 * Master seed script - populates local MongoDB with all initial data.
 * Run: node src/scripts/seedAll.js
 *
 * Ensures: Resources, Videos/Links, Community Chat Groups
 * After this, run: node src/scripts/createAdmin.js your@email.com YourPassword
 */
import "../config/env.js";
import connectDB from "../config/db.js";
import Resource from "../models/Resource.js";
import CommunityGroup from "../models/CommunityGroup.js";

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

const VIDEOS_AND_LINKS = [
  { type: "video", category: "Meditation", title: "5-Minute Breathing Meditation", excerpt: "Quick guided breathing to calm anxiety.", videoId: "gLJ5gFfR2UY", duration: "5 min", icon: "🧘" },
  { type: "video", category: "Sleep", title: "Sleep Meditation - Fall Asleep Fast", excerpt: "Gentle guided sleep meditation.", videoId: "aAEVK8wKj0o", duration: "10 min", icon: "🌙" },
  { type: "video", category: "Anxiety", title: "Calm Anxiety in 5 Minutes", excerpt: "Grounding techniques for anxiety relief.", videoId: "ZToicYcErOI", duration: "5 min", icon: "🌊" },
  { type: "video", category: "Stress", title: "Progressive Muscle Relaxation", excerpt: "Release tension from head to toe.", videoId: "1nZEdqcGVzo", duration: "16 min", icon: "💆" },
  { type: "video", category: "Mindfulness", title: "Body Scan Meditation", excerpt: "Mindful awareness of your body.", videoId: "6p_yaNFSYao", duration: "10 min", icon: "✨" },
  { type: "video", category: "Breathing", title: "Box Breathing - Navy SEAL Technique", excerpt: "4-4-4-4 breathing for focus and calm.", videoId: "GZzhK9eE9X4", duration: "5 min", icon: "🧘" },
  { type: "video", category: "Depression", title: "Understanding Depression", excerpt: "Psychologist explains depression and coping.", videoId: "XiCrniLQGYc", duration: "5 min", icon: "🧠" },
  { type: "video", category: "Self-Care", title: "Self-Compassion Break", excerpt: "Kristin Neff's self-compassion practice.", videoId: "IvtZBUSplr4", duration: "5 min", icon: "💜" },
  { type: "link", category: "Podcast", title: "The Happiness Lab", excerpt: "Yale professor explores the science of happiness.", url: "https://www.happinesslab.fm/", source: "Dr. Laurie Santos", icon: "🎧" },
  { type: "link", category: "Podcast", title: "Ten Percent Happier", excerpt: "Meditation and mindfulness for skeptics.", url: "https://www.tenpercent.com/podcast", source: "Dan Harris", icon: "🎧" },
  { type: "link", category: "Podcast", title: "Therapy for Black Girls", excerpt: "Mental wellness for Black women.", url: "https://therapyforblackgirls.com/podcast/", source: "Dr. Joy Harden Bradford", icon: "🎧" },
  { type: "link", category: "Podcast", title: "The Hilarious World of Depression", excerpt: "Comedians and humor about mental health.", url: "https://www.apmpodcasts.org/thwod/", source: "APM", icon: "🎧" },
  { type: "link", category: "Tool", title: "Headspace", excerpt: "Guided meditation and sleep app.", url: "https://www.headspace.com/", source: "Headspace", icon: "📱" },
  { type: "link", category: "Tool", title: "Calm", excerpt: "Meditation, sleep stories, and music.", url: "https://www.calm.com/", source: "Calm", icon: "📱" },
  { type: "link", category: "Tool", title: "Insight Timer", excerpt: "Free meditation library.", url: "https://insighttimer.com/", source: "Insight Timer", icon: "📱" },
  { type: "link", category: "Article", title: "Mental Health America", excerpt: "Resources, screening tools, and support.", url: "https://mhanational.org/", source: "MHA", icon: "📖" },
  { type: "link", category: "Article", title: "NAMI Resources", excerpt: "National Alliance on Mental Illness.", url: "https://www.nami.org/Support-Education", source: "NAMI", icon: "📖" },
  { type: "link", category: "Article", title: "Mind.org.uk", excerpt: "Practical mental health information.", url: "https://www.mind.org.uk/information-support/", source: "Mind", icon: "📖" }
];

const COMMUNITY_GROUPS = [
  { topic: "anxiety", name: "Anxiety & Stress", icon: "🌿", description: "Peer support for anxiety & stress" },
  { topic: "depression", name: "Depression & Mood", icon: "💭", description: "Peer support for depression & mood" },
  { topic: "trauma", name: "Trauma & PTSD", icon: "🧠", description: "Peer support for trauma & PTSD" },
  { topic: "transitions", name: "Life Transitions", icon: "🌈", description: "Peer support for life transitions" },
  { topic: "students", name: "Students & Academics", icon: "🎓", description: "Peer support for students & academics" },
  { topic: "lgbtq", name: "LGBTQ+ Support", icon: "🏳️‍🌈", description: "Peer support for LGBTQ+ support" },
  { topic: "wellness", name: "Wellness & Self-Care", icon: "🧘", description: "Peer support for wellness & self-care" },
  { topic: "recovery", name: "Recovery & Sobriety", icon: "🤝", description: "Peer support for recovery & sobriety" },
  { topic: "general", name: "General Support", icon: "💬", description: "Peer support for general support" }
];

function getYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  const str = String(urlOrId).trim();
  if (str.length === 11 && !str.includes("/")) return str;
  const match = str.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : str;
}

async function seedAll() {
  console.log("Connecting to MongoDB...");
  await connectDB();

  let resourceCount = await Resource.countDocuments();
  if (resourceCount === 0) {
    console.log("Seeding base resources...");
    await Resource.insertMany(RESOURCES);
    console.log(`  ✓ ${RESOURCES.length} base resources`);
  } else {
    console.log(`  ✓ Resources already exist (${resourceCount}), skipping base`);
  }

  let videosAdded = 0;
  for (const item of VIDEOS_AND_LINKS) {
    const existing = await Resource.findOne({ type: item.type, title: item.title });
    if (existing) continue;
    const doc = { ...item };
    if (item.type === "video" && item.videoId) doc.videoId = getYouTubeId(item.videoId);
    await Resource.create(doc);
    videosAdded++;
  }
  console.log(`  ✓ ${videosAdded} video/link resources added`);

  const groupCount = await CommunityGroup.countDocuments();
  if (groupCount === 0) {
    console.log("Seeding community chat groups...");
    const groups = COMMUNITY_GROUPS.map((g) => ({
      name: g.name,
      topic: g.topic,
      description: g.description,
      icon: g.icon,
      memberIds: []
    }));
    await CommunityGroup.insertMany(groups);
    console.log(`  ✓ ${groups.length} community groups`);
  } else {
    console.log(`  ✓ Community groups already exist (${groupCount})`);
  }

  console.log("\n✅ Seed complete!");
  console.log("\nNext step: Create your admin account:");
  console.log("  node src/scripts/createAdmin.js your@email.com YourPassword");
  console.log("\nThen start the backend and frontend.");
  process.exit(0);
}

seedAll().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
