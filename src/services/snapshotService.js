const fs = require("fs");
const path = require("path");

const SNAPSHOT_PATH = path.resolve(process.cwd(), "data", "word-snapshot.json");

function ensureDataDir() {
  const dir = path.dirname(SNAPSHOT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadSnapshot() {
  ensureDataDir();
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    return [];
  }
  const text = fs.readFileSync(SNAPSHOT_PATH, "utf-8");
  const data = JSON.parse(text);
  return Array.isArray(data.words) ? data.words : [];
}

function saveSnapshot(words) {
  ensureDataDir();
  const payload = {
    updatedAt: new Date().toISOString(),
    words,
  };
  fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

module.exports = {
  SNAPSHOT_PATH,
  loadSnapshot,
  saveSnapshot,
};
