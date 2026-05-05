const SHEET_SOURCE_URL = process.env.SHEET_SOURCE_URL || "";
const QUIZ_DEFAULT_COUNT = Number(process.env.QUIZ_DEFAULT_COUNT || 10);

module.exports = {
  SHEET_SOURCE_URL,
  QUIZ_DEFAULT_COUNT,
};
