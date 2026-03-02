import Assessment from "../models/Assessment.js";

const PHQ9_QUESTIONS = [
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

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

const PHQ9_SCORE_LABELS = {
  0: "Minimal",
  5: "Mild",
  10: "Moderate",
  15: "Moderately severe",
  20: "Severe"
};

const GAD7_SCORE_LABELS = {
  0: "Minimal",
  5: "Mild",
  10: "Moderate",
  15: "Severe"
};

function getSeverityLabel(score, type) {
  const labels = type === "phq9" ? PHQ9_SCORE_LABELS : GAD7_SCORE_LABELS;
  const thresholds = Object.keys(labels).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (score >= t) return labels[t];
  }
  return "Minimal";
}

export const getQuestions = (req, res) => {
  const { type } = req.params;
  if (type === "phq9") {
    return res.json({ type: "phq9", questions: PHQ9_QUESTIONS });
  }
  if (type === "gad7") {
    return res.json({ type: "gad7", questions: GAD7_QUESTIONS });
  }
  return res.status(400).json({ message: "Invalid assessment type. Use phq9 or gad7" });
};

export const submitAssessment = async (req, res) => {
  try {
    const { type } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    if (!["phq9", "gad7"].includes(type)) {
      return res.status(400).json({ message: "Invalid assessment type" });
    }

    const questions = type === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ message: "Invalid answers. Expected " + questions.length + " values (0-3 each)" });
    }

    const valid = answers.every((a) => typeof a === "number" && a >= 0 && a <= 3);
    if (!valid) {
      return res.status(400).json({ message: "Each answer must be 0-3" });
    }

    const score = answers.reduce((s, a) => s + a, 0);
    const severity = getSeverityLabel(score, type);

    const assessment = await Assessment.create({
      userId,
      type,
      score,
      answers
    });

    res.status(201).json({
      assessment: {
        _id: assessment._id,
        type,
        score,
        severity,
        createdAt: assessment.createdAt
      }
    });
  } catch (error) {
    console.error("SUBMIT ASSESSMENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, limit = 30 } = req.query;

    const query = { userId };
    if (type && ["phq9", "gad7"].includes(type)) query.type = type;

    const assessments = await Assessment.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const withSeverity = assessments.map((a) => ({
      ...a,
      severity: getSeverityLabel(a.score, a.type)
    }));

    res.json({ assessments: withSeverity });
  } catch (error) {
    console.error("GET ASSESSMENT HISTORY ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAssessmentProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, days = 90 } = req.query;

    if (!["phq9", "gad7"].includes(type)) {
      return res.status(400).json({ message: "Invalid type. Use phq9 or gad7" });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(days));

    const assessments = await Assessment.find({
      userId,
      type,
      createdAt: { $gte: cutoff }
    })
      .sort({ createdAt: 1 })
      .lean();

    const progress = assessments.map((a) => ({
      date: a.createdAt,
      score: a.score,
      severity: getSeverityLabel(a.score, type)
    }));

    const latest = assessments.length > 0 ? assessments[assessments.length - 1] : null;
    const first = assessments.length > 0 ? assessments[0] : null;
    const improvement = latest && first ? first.score - latest.score : null;

    res.json({
      type,
      assessments: progress,
      latest: latest ? { score: latest.score, severity: getSeverityLabel(latest.score, type), date: latest.createdAt } : null,
      improvement
    });
  } catch (error) {
    console.error("GET ASSESSMENT PROGRESS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
