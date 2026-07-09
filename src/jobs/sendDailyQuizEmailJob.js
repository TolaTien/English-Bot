require("dotenv").config();

const { SHEET_SOURCE_URL } = require("../config");
const { fetchWordsFromGoogleSheet } = require("../services/sheetService");
const { loadSnapshot, saveSnapshot } = require("../services/snapshotService");
const { getNewWords } = require("../services/wordDiffService");
const { buildQuiz } = require("../services/quizService");
const { saveDailyQuiz, getDailyQuizPath } = require("../services/dailyQuizStoreService");
const { sendQuizEmail } = require("../services/emailService");

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function runSendDailyQuizEmailJob() {
  const todayKey = getTodayKey();
  const words = await fetchWordsFromGoogleSheet(SHEET_SOURCE_URL);
  const snapshotWords = loadSnapshot();
  const newWords = getNewWords(words, snapshotWords);

  const quizWords = newWords.length ? newWords : words;
  const quiz = buildQuiz(quizWords, quizWords.length, "w2m");

  const payload = {
    date: todayKey,
    createdAt: new Date().toISOString(),
    source: newWords.length ? "new_words_since_snapshot" : "fallback_all_words",
    totalWords: words.length,
    newWordsCount: newWords.length,
    questions: quiz.questions,
  };

  saveDailyQuiz(todayKey, payload);

  const appBaseUrl = (process.env.APP_BASE_URL || "").replace(/\/$/, "");
  const quizLink = appBaseUrl ? `${appBaseUrl}/daily-quiz/${todayKey}` : "";

  const subject =
    newWords.length > 0
      ? `[English Bot] Quiz 7h sáng (${newWords.length} từ mới)`
      : "[English Bot] Quiz 7h sáng (không có từ mới, ôn tập)";

  await sendQuizEmail({
    to: process.env.QUIZ_EMAIL_TO,
    subject,
    questions: quiz.questions,
    quizLink,
    summary: {
      date: todayKey,
      totalWords: words.length,
      newWordsCount: newWords.length,
      source: payload.source,
    },
  });

  // Cập nhật snapshot SAU khi đã so sánh và gửi email xong.
  // Điều này đảm bảo lần chạy tiếp theo sẽ so sánh với baseline mới nhất.
  saveSnapshot(words);

  console.log(
    JSON.stringify(
      {
        message: "Send daily quiz email job completed.",
        totalWords: words.length,
        newWords: newWords.length,
        quizQuestions: quiz.questions.length,
        dailyQuizPath: getDailyQuizPath(todayKey),
        quizLink: quizLink || "APP_BASE_URL not configured",
      },
      null,
      2
    )
  );
}

runSendDailyQuizEmailJob().catch((error) => {
  console.error(error);
  process.exit(1);
});
