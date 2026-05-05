const wordCountEl = document.getElementById("wordCount");
const statusEl = document.getElementById("status");
const countInput = document.getElementById("wordCountInput");
const generateBtn = document.getElementById("generateBtn");
const quizSection = document.getElementById("quizSection");
const qNum = document.getElementById("qNum");
const bar = document.getElementById("bar");
const quizWord = document.getElementById("quizWord");
const quizPhonetic = document.getElementById("quizPhonetic");
const optionsGrid = document.getElementById("optionsGrid");
const done = document.getElementById("done");
const finalScore = document.getElementById("finalScore");
const resultEl = document.getElementById("result");

let currentQuestions = [];
let currentIndex = 0;
let correctCount = 0;

async function loadWordCount() {
  try {
    const response = await fetch("/api/words");
    const data = await response.json();
    wordCountEl.textContent = `Tổng số từ hiện có trong sheet: ${data.total}`;
  } catch (error) {
    wordCountEl.textContent = "Không thể tải dữ liệu từ vựng.";
  }
}

function showDone() {
  optionsGrid.innerHTML = "";
  quizWord.textContent = "";
  quizPhonetic.textContent = "";
  qNum.textContent = `${currentQuestions.length} / ${currentQuestions.length}`;
  bar.style.width = "100%";

  done.classList.remove("hidden");
  const percent = Math.round((correctCount / currentQuestions.length) * 100);
  finalScore.textContent = `${percent}%`;
  resultEl.textContent = `${correctCount}/${currentQuestions.length} câu đúng`;
}

function handleAnswer(button, selectedOption, answer) {
  const buttons = optionsGrid.querySelectorAll(".option-btn");
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.value === answer) {
      btn.classList.add("correct");
    }
  });

  if (selectedOption === answer) {
    correctCount += 1;
  } else {
    button.classList.add("wrong");
  }

  setTimeout(() => {
    currentIndex += 1;
    renderCurrentQuestion();
  }, 650);
}

function renderCurrentQuestion() {
  if (currentIndex >= currentQuestions.length) {
    showDone();
    return;
  }

  done.classList.add("hidden");

  const question = currentQuestions[currentIndex];
  qNum.textContent = `${currentIndex + 1} / ${currentQuestions.length}`;
  bar.style.width = `${(currentIndex / currentQuestions.length) * 100}%`;
  quizWord.textContent = question.word;
  quizPhonetic.textContent = question.pronunciation || "N/A";

  optionsGrid.innerHTML = "";
  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.dataset.value = option;
    button.textContent = option;
    button.addEventListener("click", () =>
      handleAnswer(button, option, question.answer)
    );
    optionsGrid.appendChild(button);
  });
}

async function generateQuiz() {
  try {
    const count = Number(countInput.value || 1);
    const response = await fetch("/api/quiz/random", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    const data = await response.json();
    currentQuestions = data.questions || [];

    if (currentQuestions.length === 0) {
      statusEl.textContent = "Chưa có dữ liệu từ vựng để tạo quiz.";
      return;
    }

    currentIndex = 0;
    correctCount = 0;
    statusEl.textContent = "";
    resultEl.textContent = "";
    done.classList.add("hidden");
    renderCurrentQuestion();
    quizSection.classList.remove("hidden");
  } catch (error) {
    statusEl.textContent = "Không thể tạo quiz lúc này.";
  }
}

generateBtn.addEventListener("click", generateQuiz);

loadWordCount();
