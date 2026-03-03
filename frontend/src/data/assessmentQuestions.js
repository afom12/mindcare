/**
 * Static PHQ-9 and GAD-7 questions for offline use.
 */
export const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself—or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead or of hurting yourself in some way"
];

export const GAD7_QUESTIONS = [
  "Feeling nervous, anxious or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

export const getSeverityLabel = (score, type) => {
  const labels = type === "phq9"
    ? { 0: "Minimal", 5: "Mild", 10: "Moderate", 15: "Moderately severe", 20: "Severe" }
    : { 0: "Minimal", 5: "Mild", 10: "Moderate", 15: "Severe" };
  const thresholds = Object.keys(labels).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (score >= t) return labels[t];
  }
  return "Minimal";
};
