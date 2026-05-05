const loadState = document.getElementById("loadState");
const loadError = document.getElementById("loadError");
const quizCard = document.getElementById("quizCard");
const resultCard = document.getElementById("resultCard");
const nextBtn = document.getElementById("nextBtn");

let questions = [];
let currentIndex = 0;
let score = 0;

function renderQuestion() {
  const q = questions[currentIndex];
  const total = questions.length;

  document.getElementById("qCurrent").textContent = currentIndex + 1;
  document.getElementById("qTotal").textContent = total;
  document.getElementById("qScore").textContent = score;
  document.getElementById("qProgress").style.width = `${(currentIndex / total) * 100}%`;
  document.getElementById("qWord").textContent = q.word;
  document.getElementById("qPronunciation").textContent = q.pronunciation || "—";

  const optionsEl = document.getElementById("qOptions");
  optionsEl.innerHTML = q.options
    .map((option) => `<button type="button" class="opt">${window.appCommon.escapeHtml(option)}</button>`)
    .join("");
  optionsEl.querySelectorAll(".opt").forEach((button) => {
    button.addEventListener("click", () => handleAnswer(button, q));
  });
  nextBtn.classList.add("hidden");
}

function handleAnswer(button, q) {
  const selected = button.textContent;
  const correct = selected === q.answer;
  if (correct) {
    score += 1;
  }
  document.querySelectorAll("#qOptions .opt").forEach((optionButton) => {
    optionButton.disabled = true;
    if (optionButton.textContent === q.answer) {
      optionButton.classList.add("ok");
    } else if (optionButton === button && !correct) {
      optionButton.classList.add("ng");
    }
  });
  document.getElementById("qScore").textContent = score;
  nextBtn.classList.remove("hidden");
}

function renderResult() {
  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  document.getElementById("resultScore").textContent = `${score}/${total}`;
  document.getElementById("resultPct").textContent = `${pct}% chính xác`;
  document.getElementById("resultMsg").textContent =
    pct >= 90
      ? "🎉 Quá tốt!"
      : pct >= 70
        ? "💪 Rất ổn!"
        : pct >= 50
          ? "📖 Cần ôn thêm!"
          : "🔁 Hãy ôn lại rồi thử lại.";
  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
}

nextBtn.addEventListener("click", () => {
  currentIndex += 1;
  if (currentIndex >= questions.length) {
    renderResult();
  } else {
    renderQuestion();
  }
});

async function bootstrap() {
  const response = await fetch(`/api/quiz/daily/${window.dailyQuizDateKey}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Không tải được daily quiz.");
  }
  questions = data.questions || [];
  if (!questions.length) {
    throw new Error("Bài quiz không có câu hỏi.");
  }
  loadState.classList.add("hidden");
  quizCard.classList.remove("hidden");
  renderQuestion();
}

bootstrap().catch((error) => {
  loadState.classList.add("hidden");
  loadError.textContent = error.message;
  loadError.classList.remove("hidden");
});
