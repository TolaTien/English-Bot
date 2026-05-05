const setupCard = document.getElementById("setupCard");
const quizCard = document.getElementById("quizCard");
const resultCard = document.getElementById("resultCard");
const setupError = document.getElementById("setupError");
const countSlider = document.getElementById("countSlider");
const countLabel = document.getElementById("countLabel");
const poolSize = document.getElementById("poolSize");
const quizTopic = document.getElementById("quizTopic");
const startQuizBtn = document.getElementById("startQuizBtn");
const nextBtn = document.getElementById("nextBtn");
const retryBtn = document.getElementById("retryBtn");

let currentQuiz = [];
let answers = [];
let currentIndex = 0;
let score = 0;
let startPayload = null;

function readRadio(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function refreshLabelState() {
  document.querySelectorAll(".rl input[type=radio]").forEach((radio) => {
    radio.closest(".rl").classList.toggle("on", radio.checked);
  });
}

function renderQuestion() {
  const question = currentQuiz[currentIndex];
  const total = currentQuiz.length;

  document.getElementById("qCurrent").textContent = currentIndex + 1;
  document.getElementById("qTotal").textContent = total;
  document.getElementById("qScore").textContent = score;
  document.getElementById("qProgress").style.width = `${(currentIndex / total) * 100}%`;
  document.getElementById("qLabel").textContent =
    question.type === "m2w" ? "🇬🇧 Từ tiếng Anh là gì?" : "🇻🇳 Nghĩa tiếng Việt là gì?";
  document.getElementById("qWord").textContent = question.type === "m2w" ? question.meaning : question.word;
  document.getElementById("qPronunciation").textContent = question.type === "m2w" ? "" : question.pronunciation || "—";

  const tags = [];
  if (question.meta.partOfSpeech) {
    tags.push(`<span class="tag tg-type">${window.appCommon.escapeHtml(question.meta.partOfSpeech)}</span>`);
  }
  if (question.meta.topic) {
    tags.push(`<span class="tag tg-topic">${window.appCommon.escapeHtml(question.meta.topic)}</span>`);
  }
  document.getElementById("qTags").innerHTML = tags.join("");

  const exampleEl = document.getElementById("qExample");
  if (question.meta.example && question.type === "w2m") {
    exampleEl.textContent = `💬 ${question.meta.example}${question.meta.exampleMeaning ? `\n→ ${question.meta.exampleMeaning}` : ""}`;
    exampleEl.classList.remove("hidden");
  } else {
    exampleEl.classList.add("hidden");
  }

  const optionsEl = document.getElementById("qOptions");
  optionsEl.innerHTML = question.options
    .map(
      (option) =>
        `<button type="button" class="opt">${window.appCommon.escapeHtml(option)}</button>`
    )
    .join("");

  optionsEl.querySelectorAll(".opt").forEach((button) => {
    button.addEventListener("click", () => handleAnswer(button, question));
  });

  nextBtn.classList.add("hidden");
}

function handleAnswer(button, question) {
  const selected = button.textContent;
  const correct = selected === question.answer;
  if (correct) {
    score += 1;
  }
  answers.push({ question, selected, correct });

  document.querySelectorAll("#qOptions .opt").forEach((optionButton) => {
    optionButton.disabled = true;
    if (optionButton.textContent === question.answer) {
      optionButton.classList.add("ok");
    } else if (optionButton === button && !correct) {
      optionButton.classList.add("ng");
    }
  });

  document.getElementById("qScore").textContent = score;
  nextBtn.classList.remove("hidden");
}

function renderResults() {
  const total = currentQuiz.length;
  const pct = Math.round((score / total) * 100);
  document.getElementById("resultScore").textContent = `${score}/${total}`;
  document.getElementById("resultPct").textContent = `${pct}% chính xác`;
  document.getElementById("resultMsg").textContent =
    pct >= 90
      ? "🎉 Xuất sắc! Bạn nhớ rất tốt!"
      : pct >= 70
        ? "💪 Tốt lắm! Tiếp tục phát huy!"
        : pct >= 50
          ? "📖 Cần ôn thêm một chút nữa!"
          : "🔁 Ôn lại rồi thử lại nhé!";

  document.getElementById("resultItems").innerHTML = answers
    .map((item) => {
      const q = item.question;
      const title = q.type === "m2w" ? q.meaning : q.word;
      const detail = item.correct
        ? ""
        : `<div style="font-size:12px;color:#555;">✓ Đáp án: <strong>${window.appCommon.escapeHtml(q.answer)}</strong> · Bạn: <span style="color:#a32d2d">${window.appCommon.escapeHtml(item.selected)}</span></div>`;
      return `<div class="ri ${item.correct ? "ok" : "ng"}"><div><strong>${window.appCommon.escapeHtml(title)}</strong>${detail}</div><div>${item.correct ? "✓" : "✗"}</div></div>`;
    })
    .join("");

  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
}

async function startQuiz(payload) {
  setupError.classList.add("hidden");
  const response = await fetch("/api/quiz/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Không thể tạo quiz.");
  }

  startPayload = payload;
  currentQuiz = data.questions;
  answers = [];
  currentIndex = 0;
  score = 0;

  setupCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
  renderQuestion();
}

async function bootstrap() {
  const data = await window.appCommon.fetchData();
  poolSize.textContent = data.words.length;
  countSlider.max = Math.max(5, data.words.length);
  countSlider.value = Math.min(Number(countSlider.value), data.words.length || 5);
  countLabel.textContent = countSlider.value;

  const topics = [...new Set(data.words.map((word) => word.topic).filter(Boolean))].sort();
  quizTopic.innerHTML =
    '<option value="">Tất cả chủ đề</option>' +
    topics.map((topic) => `<option value="${window.appCommon.escapeHtml(topic)}">${window.appCommon.escapeHtml(topic)}</option>`).join("");

  if (window.quizInitialMode === "daily") {
    await startQuiz({
      source: "daily",
      count: Number(countSlider.value),
      topic: "",
      status: "all",
      type: "mixed",
    });
  }
}

countSlider.addEventListener("input", () => {
  countLabel.textContent = countSlider.value;
});

document.querySelectorAll(".rl input[type=radio]").forEach((radio) => {
  radio.addEventListener("change", refreshLabelState);
});

startQuizBtn.addEventListener("click", async () => {
  try {
    await startQuiz({
      source: "custom",
      count: Number(countSlider.value),
      topic: quizTopic.value,
      status: readRadio("quizStatus"),
      type: readRadio("quizType"),
    });
  } catch (error) {
    setupError.textContent = error.message;
    setupError.classList.remove("hidden");
  }
});

nextBtn.addEventListener("click", () => {
  currentIndex += 1;
  if (currentIndex >= currentQuiz.length) {
    renderResults();
  } else {
    renderQuestion();
  }
});

retryBtn.addEventListener("click", async () => {
  if (!startPayload) {
    return;
  }
  await startQuiz(startPayload);
});

bootstrap().catch((error) => {
  setupError.textContent = error.message;
  setupError.classList.remove("hidden");
});
