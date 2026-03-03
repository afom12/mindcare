/**
 * Seed YouTube videos and external links for Resources.
 * Run: node backend/src/scripts/seedVideosAndLinks.js
 */
import "../config/env.js";
import connectDB from "../config/db.js";
import Resource from "../models/Resource.js";

const VIDEOS_AND_LINKS = [
  // YouTube - Guided meditations & breathing
  { type: "video", category: "Meditation", title: "5-Minute Breathing Meditation", excerpt: "Quick guided breathing to calm anxiety.", videoId: "gLJ5gFfR2UY", duration: "5 min", icon: "🧘" },
  { type: "video", category: "Sleep", title: "Sleep Meditation - Fall Asleep Fast", excerpt: "Gentle guided sleep meditation.", videoId: "aAEVK8wKj0o", duration: "10 min", icon: "🌙" },
  { type: "video", category: "Anxiety", title: "Calm Anxiety in 5 Minutes", excerpt: "Grounding techniques for anxiety relief.", videoId: "ZToicYcErOI", duration: "5 min", icon: "🌊" },
  { type: "video", category: "Stress", title: "Progressive Muscle Relaxation", excerpt: "Release tension from head to toe.", videoId: "1nZEdqcGVzo", duration: "16 min", icon: "💆" },
  { type: "video", category: "Mindfulness", title: "Body Scan Meditation", excerpt: "Mindful awareness of your body.", videoId: "6p_yaNFSYao", duration: "10 min", icon: "✨" },
  { type: "video", category: "Breathing", title: "Box Breathing - Navy SEAL Technique", excerpt: "4-4-4-4 breathing for focus and calm.", videoId: "GZzhK9eE9X4", duration: "5 min", icon: "🧘" },
  { type: "video", category: "Depression", title: "Understanding Depression", excerpt: "Psychologist explains depression and coping.", videoId: "XiCrniLQGYc", duration: "5 min", icon: "🧠" },
  { type: "video", category: "Self-Care", title: "Self-Compassion Break", excerpt: "Kristin Neff's self-compassion practice.", videoId: "IvtZBUSplr4", duration: "5 min", icon: "💜" },
  // External links - podcasts, articles, tools
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

function getYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  const str = String(urlOrId).trim();
  if (str.length === 11 && !str.includes("/")) return str;
  const match = str.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : str;
}

async function seed() {
  await connectDB();
  let added = 0;
  for (const item of VIDEOS_AND_LINKS) {
    const existing = await Resource.findOne({ type: item.type, title: item.title });
    if (existing) continue;

    const doc = { ...item };
    if (item.type === "video" && item.videoId) {
      doc.videoId = getYouTubeId(item.videoId);
    }
    await Resource.create(doc);
    added++;
  }
  console.log(`Added ${added} video/link resources.`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
