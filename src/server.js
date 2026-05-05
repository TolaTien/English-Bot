require("dotenv").config();

const path = require("path");
const express = require("express");
const { SHEET_SOURCE_URL, QUIZ_DEFAULT_COUNT } = require("./config");
const { fetchWordsFromGoogleSheet } = require("./services/sheetService");
const { loadSnapshot } = require("./services/snapshotService");
const { getNewWords } = require("./services/wordDiffService");
const { buildQuiz } = require("./services/quizService");
const { loadDailyQuiz } = require("./services/dailyQuizStoreService");

const app = express();
const port = Number(process.env.PORT || 3000);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

async function getDashboardData() {
  const words = await fetchWordsFromGoogleSheet(SHEET_SOURCE_URL);
  const snapshotWords = loadSnapshot();
  const newWords = getNewWords(words, snapshotWords);
  const doneCount = words.filter((word) => String(word.status).toLowerCase() === "done").length;
  const topicMap = new Map();

  for (const word of words) {
    const topic = word.topic || "Chưa phân loại";
    topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
  }

  const topics = Array.from(topicMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    words,
    newWords,
    stats: {
      total: words.length,
      newCount: newWords.length,
      doneCount,
    },
    topics,
  };
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/words", (req, res) => {
  res.render("words");
});

app.get("/daily", (req, res) => {
  res.render("daily");
});

app.get("/quiz", (req, res) => {
  res.render("quiz", {
    defaultCount: QUIZ_DEFAULT_COUNT,
    mode: req.query.mode === "daily" ? "daily" : "custom",
  });
});

app.get("/daily-quiz/:dateKey", (req, res) => {
  res.render("daily-quiz", { dateKey: req.params.dateKey });
});

app.get("/api/data", async (req, res) => {
  try {
    const data = await getDashboardData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/quiz/start", async (req, res) => {
  try {
    const { source = "custom", count = QUIZ_DEFAULT_COUNT, topic = "", status = "all", type = "mixed" } =
      req.body || {};
    const data = await getDashboardData();

    let pool = source === "daily" ? data.newWords : data.words;
    if (source === "daily" && pool.length === 0) {
      return res.status(400).json({ error: "Chưa có từ mới để tạo quiz daily." });
    }

    if (topic) {
      pool = pool.filter((word) => word.topic === topic);
    }

    if (status === "done") {
      pool = pool.filter((word) => String(word.status).toLowerCase() === "done");
    } else if (status === "undone") {
      pool = pool.filter((word) => String(word.status).toLowerCase() !== "done");
    }

    if (pool.length === 0) {
      return res.status(400).json({ error: "Không có từ phù hợp bộ lọc hiện tại." });
    }

    const quiz = buildQuiz(pool, Number(count), type);
    return res.json({
      ...quiz,
      source,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/quiz/daily/:dateKey", (req, res) => {
  try {
    const payload = loadDailyQuiz(req.params.dateKey);
    if (!payload) {
      return res.status(404).json({ error: "Không tìm thấy bài quiz cho ngày này." });
    }
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`English Bot app is running at http://localhost:${port}`);
});
