import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port: port ? parseInt(port, 10) : 587,
    secure: port === "465",
    auth: { user, pass }
  });
  return transporter;
}

export async function sendPasswordResetEmail(to, resetUrl) {
  const transport = getTransporter();
  if (!transport) {
    console.log("[DEV] Password reset link (no SMTP configured):", resetUrl);
    return { ok: true };
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "MindCare AI – Reset your password",
    html: `
      <p>You requested a password reset for MindCare AI.</p>
      <p><a href="${resetUrl}" style="color:#0d9488;">Reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `
  });
  return { ok: true };
}

export async function sendContactEmail({ email, subject, message }) {
  const transport = getTransporter();
  const to = process.env.CONTACT_EMAIL || process.env.SMTP_USER;

  if (!to) {
    console.log("[DEV] Contact form submission (no CONTACT_EMAIL):", { email, subject, message });
    return { ok: true };
  }

  if (transport) {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      replyTo: email,
      subject: `[MindCare AI Contact] ${subject}`,
      html: `
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, "<br>")}</p>
      `
    });
  } else {
    console.log("[DEV] Contact form (no SMTP):", { email, subject, message });
  }

  return { ok: true };
}
