const axios = require("axios");
const XLSX = require("xlsx");

function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error("Invalid Google Sheet URL.");
  }
  return match[1];
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findColumnIndex(headers, aliases) {
  const aliasSet = new Set(aliases.map(normalizeHeader));
  return headers.findIndex((header) => aliasSet.has(normalizeHeader(header)));
}

function getCell(row, index) {
  if (index === -1) {
    return "";
  }
  return String(row[index] || "").trim();
}

function findHeaderRowIndex(rows) {
  return rows.findIndex((row) => {
    if (!Array.isArray(row)) {
      return false;
    }
    const termIndex = findColumnIndex(row, ["từ mới", "tu moi", "word", "vocabulary"]);
    const pronunciationIndex = findColumnIndex(row, ["phát âm", "phat am", "pronunciation"]);
    const meaningIndex = findColumnIndex(row, ["nghĩa tv", "nghia tv", "meaning", "nghia"]);
    return termIndex !== -1 && pronunciationIndex !== -1 && meaningIndex !== -1;
  });
}

function normalizeWordKey(word) {
  return word.term.trim().toLowerCase();
}

async function fetchWordsFromGoogleSheet(sheetUrl) {
  const sheetId = extractSheetId(sheetUrl);
  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  const response = await axios.get(exportUrl, { responseType: "arraybuffer" });

  const workbook = XLSX.read(response.data, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Google Sheet is empty.");
  }

  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    raw: false,
    defval: "",
  });

  const headerRowIndex = findHeaderRowIndex(rows);
  if (headerRowIndex === -1) {
    throw new Error("Cannot detect header row from Google Sheet.");
  }

  const headers = rows[headerRowIndex] || [];
  const dataRows = rows.slice(headerRowIndex + 1);
  const termIndex = findColumnIndex(headers, ["từ mới", "tu moi", "word", "vocabulary"]);
  const pronunciationIndex = findColumnIndex(headers, ["phát âm", "phat am", "pronunciation"]);
  const meaningIndex = findColumnIndex(headers, ["nghĩa tv", "nghia tv", "meaning", "nghia"]);
  const typeIndex = findColumnIndex(headers, ["loại từ", "loai tu", "type", "part of speech"]);
  const exampleIndex = findColumnIndex(headers, ["ví dụ câu", "vi du cau", "example", "sample sentence"]);
  const exampleMeaningIndex = findColumnIndex(headers, [
    "nghĩa ví dụ",
    "nghia vi du",
    "example meaning",
    "translation",
  ]);
  const topicIndex = findColumnIndex(headers, ["chủ đề", "chu de", "topic", "category"]);
  const statusIndex = findColumnIndex(headers, ["trạng thái", "trang thai", "status"]);
  const noteIndex = findColumnIndex(headers, ["ghi chú", "ghi chu", "note", "notes"]);

  if (termIndex === -1 || pronunciationIndex === -1 || meaningIndex === -1) {
    throw new Error(
      "Cannot find required columns: Từ mới, Phát âm, Nghĩa TV."
    );
  }

  const words = dataRows
    .map((row) => ({
      term: getCell(row, termIndex),
      pronunciation: getCell(row, pronunciationIndex),
      type: getCell(row, typeIndex),
      meaning: getCell(row, meaningIndex),
      example: getCell(row, exampleIndex),
      exampleMeaning: getCell(row, exampleMeaningIndex),
      topic: getCell(row, topicIndex),
      status: getCell(row, statusIndex),
      note: getCell(row, noteIndex),
    }))
    .filter((item) => item.term && item.meaning);

  const uniqueMap = new Map();
  for (const word of words) {
    uniqueMap.set(normalizeWordKey(word), word);
  }
  return Array.from(uniqueMap.values());
}

module.exports = {
  fetchWordsFromGoogleSheet,
  normalizeWordKey,
};
