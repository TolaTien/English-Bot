const { normalizeWordKey } = require("./sheetService");

function getNewWords(currentWords, oldWords) {
  const oldSet = new Set(oldWords.map(normalizeWordKey));
  return currentWords.filter((word) => !oldSet.has(normalizeWordKey(word)));
}

module.exports = {
  getNewWords,
};
