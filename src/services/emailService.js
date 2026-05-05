const nodemailer = require("nodemailer");

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function buildQuizHtml({ questions, quizLink, summary }) {
  const lines = questions
    .map((q) => {
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0ea;font-weight:500">${q.id}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0ea">${q.word || ""}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0ea;color:#666">${q.pronunciation || "—"}</td>
      </tr>`;
    })
    .join("");
  const cta = quizLink
    ? `<a href="${quizLink}" style="display:inline-block;background:#ba7517;color:#fff;text-decoration:none;border-radius:8px;padding:11px 18px;font-weight:700;margin-bottom:14px">Làm bài quiz ngay →</a>`
    : `<p style="color:#a32d2d;font-size:13px;margin:0 0 14px">Thiếu APP_BASE_URL nên chưa tạo được link làm bài.</p>`;

  return `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:680px;margin:0 auto;background:#f5f5f7;padding:24px 10px;color:#1d1d1f">
      <div style="background:#fff;border:1px solid #e0e0e0;border-radius:18px;padding:22px">
        <h2 style="font-size:24px;line-height:1.2;margin:0 0 6px;letter-spacing:-0.2px">Daily Vocab Quiz</h2>
        <p style="margin:0 0 6px;color:#666">Ngày: <b>${summary.date}</b> · Tổng từ trong sheet: <b>${summary.totalWords}</b></p>
        <p style="margin:0 0 14px;color:#666">Từ mới sau snapshot 1h sáng: <b>${summary.newWordsCount}</b></p>
        ${cta}
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr>
              <th style="padding:8px 12px;text-align:left;color:#999;font-weight:500;border-bottom:1px solid #e8e8e2">#</th>
              <th style="padding:8px 12px;text-align:left;color:#999;font-weight:500;border-bottom:1px solid #e8e8e2">Từ</th>
              <th style="padding:8px 12px;text-align:left;color:#999;font-weight:500;border-bottom:1px solid #e8e8e2">Phát âm</th>
            </tr>
          </thead>
          <tbody>${lines}</tbody>
        </table>
      </div>
    </div>
  `;
}

async function sendQuizEmail({ to, subject, questions, quizLink, summary }) {
  const transport = getTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (!transport || !to || !from) {
    return { sent: false, reason: "Email config is missing." };
  }

  await transport.sendMail({
    from,
    to,
    subject,
    html: buildQuizHtml({ questions, quizLink, summary }),
  });

  return { sent: true };
}

module.exports = {
  sendQuizEmail,
};
