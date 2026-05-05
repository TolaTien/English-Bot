const fs = require("fs");
const path = require("path");

const DAILY_QUIZ_DIR = path.resolve(process.cwd(), "data", "daily-quizzes");

function ensureDailyQuizDir() {
  if (!fs.existsSync(DAILY_QUIZ_DIR)) {
    fs.mkdirSync(DAILY_QUIZ_DIR, { recursive: true });
  }
}

function getDailyQuizPath(dateKey) {
  return path.join(DAILY_QUIZ_DIR, `${dateKey}.json`);
}

function saveDailyQuiz(dateKey, payload) {
  ensureDailyQuizDir();
  fs.writeFileSync(getDailyQuizPath(dateKey), `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

function loadDailyQuiz(dateKey) {
  ensureDailyQuizDir();
  const filePath = getDailyQuizPath(dateKey);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

module.exports = {
  DAILY_QUIZ_DIR,
  ensureDailyQuizDir,
  getDailyQuizPath,
  saveDailyQuiz,
  loadDailyQuiz,
};
