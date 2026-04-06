import TherapistAssignment from "../models/TherapistAssignment.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const isStudent = (user) => user.role === "user";

async function ensureConversation(studentId, therapistId) {
  let conv = await Conversation.findOne({ userId: studentId, therapistId });
  if (!conv) {
    conv = await Conversation.create({ userId: studentId, therapistId });
  }
  return conv;
}

function formatMessageForMobile(m, conv, viewerId) {
  const sid = m.senderId?._id || m.senderId;
  const senderStr = sid?.toString?.() || String(sid);
  const uid = conv.userId?.toString?.() || String(conv.userId);
  const tid = conv.therapistId?.toString?.() || String(conv.therapistId);
  const receiverStr = senderStr === uid ? tid : uid;
  const ts = m.createdAt || m.timestamp;
  const id = m._id?.toString?.() || m.id;
  const text = m.content ?? m.message ?? "";
  return {
    id,
    senderId: senderStr,
    receiverId: receiverStr,
    message: text,
    timestamp: ts instanceof Date ? ts.toISOString() : new Date(ts).toISOString(),
    sender_id: senderStr,
    text,
    createdAt: ts instanceof Date ? ts.toISOString() : new Date(ts).toISOString()
  };
}

/** POST /therapist/request — student only */
export const requestTherapistSupport = async (req, res) => {
  try {
    if (!isStudent(req.user)) {
      return res.status(403).json({ message: "Only students can request therapist support" });
    }
    const studentId = req.user._id;

    const open = await TherapistAssignment.findOne({
      studentId,
      status: { $in: ["pending", "assigned"] }
    }).lean();

    if (open) {
      if (open.status === "pending") {
        return res.status(200).json({
          assignmentId: open._id,
          status: "pending",
          message: "Request already pending"
        });
      }
      return res.status(200).json({
        assignmentId: open._id,
        status: "assigned",
        therapistId: open.therapistId,
        message: "You already have an assigned therapist"
      });
    }

    const created = await TherapistAssignment.create({
      studentId,
      status: "pending"
    });

    res.status(201).json({
      assignmentId: created._id,
      status: "pending",
      message: "Therapist support requested"
    });
  } catch (error) {
    console.error("REQUEST THERAPIST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/** GET /therapist/status — student only */
export const getTherapistConnectionStatus = async (req, res) => {
  try {
    if (!isStudent(req.user)) {
      return res.status(403).json({ message: "Only students can view therapist status" });
    }
    const studentId = req.user._id;

    const latest = await TherapistAssignment.findOne({ studentId })
      .sort({ updatedAt: -1 })
      .populate("therapistId", "name email")
      .lean();

    if (!latest) {
      const body = { status: "none", therapist: null };
      return res.json({ ...body, data: body });
    }

    if (latest.status === "pending") {
      const body = { status: "pending", therapist: null };
      return res.json({ ...body, data: body });
    }

    if (latest.status === "closed") {
      const body = { status: "closed", therapist: null };
      return res.json({ ...body, data: body });
    }

    const t = latest.therapistId;
    const therapist =
      t && typeof t === "object"
        ? { id: t._id?.toString?.() || String(t._id), name: t.name || "" }
        : null;

    const body = {
      status: "assigned",
      therapist: therapist || null
    };
    return res.json({ ...body, data: body });
  } catch (error) {
    console.error("THERAPIST STATUS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

async function getAssignmentConversationForStudent(studentId) {
  const assignment = await TherapistAssignment.findOne({
    studentId,
    status: "assigned",
    conversationId: { $ne: null }
  })
    .populate("therapistId")
    .lean();

  if (!assignment || !assignment.conversationId) {
    return { error: "No active therapist conversation. Wait until a therapist is assigned." };
  }

  const conv = await Conversation.findById(assignment.conversationId);
  if (!conv) return { error: "Conversation not found" };
  return { assignment, conv };
}

async function getAssignmentConversationForTherapist(therapistId, studentId) {
  const assignment = await TherapistAssignment.findOne({
    studentId,
    therapistId,
    status: "assigned",
    conversationId: { $ne: null }
  }).lean();

  if (!assignment) {
    return { error: "No assignment for this student or not active" };
  }
  const conv = await Conversation.findById(assignment.conversationId);
  if (!conv) return { error: "Conversation not found" };
  return { assignment, conv };
}

/** GET /therapist/messages — student (own thread) or therapist (?studentId=) */
export const getTherapistThreadMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let conv;
    if (role === "user") {
      const r = await getAssignmentConversationForStudent(userId);
      if (r.error) return res.status(400).json({ message: r.error, messages: [] });
      conv = r.conv;
    } else if (role === "therapist") {
      const { studentId } = req.query;
      if (!studentId) {
        return res.status(400).json({ message: "studentId query required for therapists", messages: [] });
      }
      const r = await getAssignmentConversationForTherapist(userId, studentId);
      if (r.error) return res.status(400).json({ message: r.error, messages: [] });
      conv = r.conv;
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const query = { conversationId: conv._id };
    const before = req.query.before;
    if (before) query.createdAt = { $lt: new Date(before) };

    const raw = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 100)
      .lean();

    const messages = raw.reverse().map((m) => formatMessageForMobile(m, conv, userId));

    res.json({ messages, data: { messages } });
  } catch (error) {
    console.error("GET THERAPIST MESSAGES ERROR:", error);
    res.status(500).json({ error: error.message, messages: [] });
  }
};

/** POST /therapist/messages — body { message } (+ optional studentId for therapist) */
export const postTherapistThreadMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const text = (req.body.message ?? req.body.content ?? "").trim();
    if (!text) {
      return res.status(400).json({ message: "message is required" });
    }

    let conv;
    if (role === "user") {
      const r = await getAssignmentConversationForStudent(userId);
      if (r.error) return res.status(400).json({ message: r.error });
      conv = r.conv;
    } else if (role === "therapist") {
      const studentId = req.body.studentId || req.query.studentId;
      if (!studentId) {
        return res.status(400).json({ message: "studentId is required in body for therapists" });
      }
      const r = await getAssignmentConversationForTherapist(userId, studentId);
      if (r.error) return res.status(400).json({ message: r.error });
      conv = r.conv;
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      conversationId: conv._id,
      senderId: userId,
      content: text
    });
    await Conversation.findByIdAndUpdate(conv._id, { updatedAt: new Date() });

    const populated = await Message.findById(message._id).lean();
    const formatted = formatMessageForMobile(populated, conv, userId);

    res.status(201).json({ message: formatted, messageRecord: formatted });
  } catch (error) {
    console.error("POST THERAPIST MESSAGE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/** GET /therapist/pending-assignments — therapist: list pending */
export const listPendingAssignments = async (req, res) => {
  try {
    if (req.user.role !== "therapist") {
      return res.status(403).json({ message: "Therapist access only" });
    }
    const therapist = await User.findById(req.user._id).select("therapistVerification status").lean();
    if (therapist?.therapistVerification !== "verified" || therapist?.status !== "active") {
      return res.status(403).json({ message: "Your therapist account must be verified to accept requests" });
    }

    const list = await TherapistAssignment.find({ status: "pending" })
      .populate("studentId", "name email")
      .sort({ createdAt: 1 })
      .lean();

    const assignments = list.map((a) => ({
      id: a._id.toString(),
      studentId: (a.studentId?._id || a.studentId)?.toString(),
      studentName: a.studentId?.name || "Student",
      studentEmail: a.studentId?.email || "",
      requestedAt: a.createdAt
    }));

    res.json({ assignments });
  } catch (error) {
    console.error("LIST PENDING ASSIGNMENTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/** POST /therapist/assignments/:assignmentId/accept — therapist */
export const acceptAssignment = async (req, res) => {
  try {
    if (req.user.role !== "therapist") {
      return res.status(403).json({ message: "Therapist access only" });
    }
    const therapistId = req.user._id;
    const { assignmentId } = req.params;

    const therapist = await User.findById(therapistId).select("therapistVerification status role").lean();
    if (therapist?.role !== "therapist" || therapist?.therapistVerification !== "verified" || therapist?.status !== "active") {
      return res.status(403).json({ message: "Your therapist account must be verified to accept requests" });
    }

    const assignment = await TherapistAssignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    if (assignment.status !== "pending") {
      return res.status(400).json({ message: "Assignment is no longer pending" });
    }

    const studentId = assignment.studentId;
    const conv = await ensureConversation(studentId, therapistId);

    assignment.therapistId = therapistId;
    assignment.status = "assigned";
    assignment.conversationId = conv._id;
    await assignment.save();

    const t = await User.findById(therapistId).select("name email").lean();

    res.json({
      success: true,
      assignment: {
        id: assignment._id.toString(),
        status: "assigned",
        therapistId: therapistId.toString(),
        conversationId: conv._id.toString(),
        studentId: studentId.toString()
      },
      therapist: t ? { id: therapistId.toString(), name: t.name } : null
    });
  } catch (error) {
    console.error("ACCEPT ASSIGNMENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const adminListAssignments = async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status && ["pending", "assigned", "closed"].includes(status)) q.status = status;

    const list = await TherapistAssignment.find(q)
      .populate("studentId", "name email")
      .populate("therapistId", "name email")
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    res.json({
      assignments: list.map((a) => ({
        id: a._id.toString(),
        studentId: (a.studentId?._id || a.studentId)?.toString(),
        studentName: a.studentId?.name,
        studentEmail: a.studentId?.email,
        therapistId: a.therapistId ? (a.therapistId._id || a.therapistId).toString() : null,
        therapistName: a.therapistId?.name,
        status: a.status,
        conversationId: a.conversationId?.toString(),
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      }))
    });
  } catch (error) {
    console.error("ADMIN LIST ASSIGNMENTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const adminAssignStudent = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { therapistId: bodyTherapistId, studentId: bodyStudentId } = req.body;

    let assignment = await TherapistAssignment.findById(assignmentId);
    if (!assignment && bodyStudentId) {
      assignment = await TherapistAssignment.findOne({
        studentId: bodyStudentId,
        status: "pending"
      }).sort({ createdAt: -1 });
    }
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const tId = bodyTherapistId;
    if (!tId) return res.status(400).json({ message: "therapistId is required" });

    const therapist = await User.findOne({
      _id: tId,
      role: "therapist",
      therapistVerification: "verified",
      status: "active"
    });
    if (!therapist) {
      return res.status(404).json({ message: "Verified therapist not found" });
    }

    const studentId = assignment.studentId;
    const conv = await ensureConversation(studentId, therapist._id);

    assignment.therapistId = therapist._id;
    assignment.status = "assigned";
    assignment.conversationId = conv._id;
    await assignment.save();

    res.json({
      success: true,
      assignment: {
        id: assignment._id.toString(),
        status: "assigned",
        therapistId: therapist._id.toString(),
        conversationId: conv._id.toString()
      }
    });
  } catch (error) {
    console.error("ADMIN ASSIGN ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
