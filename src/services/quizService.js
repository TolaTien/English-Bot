function shuffle(input) {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandomWords(words, requestedCount) {
  const count = Math.max(1, Math.min(Number(requestedCount) || 1, words.length));
  return shuffle(words).slice(0, count);
}

function pickWrongOptions(words, currentWord, type, maxWrong = 3) {
  const pool = words.filter((word) => word.term.toLowerCase() !== currentWord.term.toLowerCase());
  const uniqueWrong = [];
  const seen = new Set();

  for (const word of shuffle(pool)) {
    const candidate = type === "m2w" ? word.term : word.meaning;
    const normalized = candidate.toLowerCase();
    if (!candidate || seen.has(normalized)) {
      continue;
    }
    if (type === "w2m" && normalized === currentWord.meaning.toLowerCase()) {
      continue;
    }
    if (type === "m2w" && normalized === currentWord.term.toLowerCase()) {
      continue;
    }
    uniqueWrong.push(candidate);
    seen.add(normalized);
    if (uniqueWrong.length >= maxWrong) {
      break;
    }
  }

  return uniqueWrong;
}

function createQuestion(word, allWords, type, id) {
  const answer = type === "m2w" ? word.term : word.meaning;
  const options = shuffle([answer, ...pickWrongOptions(allWords, word, type)]);

  return {
    id,
    type,
    word: word.term,
    pronunciation: word.pronunciation || "",
    meaning: word.meaning,
    answer,
    options,
    meta: {
      partOfSpeech: word.type || "",
      topic: word.topic || "",
      status: word.status || "",
      example: word.example || "",
      exampleMeaning: word.exampleMeaning || "",
    },
  };
}

function buildQuiz(words, requestedCount, questionType = "w2m") {
  const selected = pickRandomWords(words, requestedCount);
  const questions = selected.map((word, index) => {
    const resolvedType =
      questionType === "mixed" ? (Math.random() > 0.5 ? "w2m" : "m2w") : questionType;
    return createQuestion(word, words, resolvedType, index + 1);
  });

  return {
    total: questions.length,
    questions,
  };
}

function createQuizQuestions(words) {
  return words.map((word, index) => ({
    id: index + 1,
    prompt: `Nghĩa tiếng Việt của "${word.term}" (${word.pronunciation || "N/A"}) là gì?`,
    answer: word.meaning,
  }));
}

module.exports = {
  buildQuiz,
  createQuizQuestions,
};
