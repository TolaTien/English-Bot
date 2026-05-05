require("dotenv").config();

const { SHEET_SOURCE_URL } = require("../config");
const { fetchWordsFromGoogleSheet } = require("../services/sheetService");
const { saveSnapshot, SNAPSHOT_PATH } = require("../services/snapshotService");

async function runSnapshotJob() {
  const words = await fetchWordsFromGoogleSheet(SHEET_SOURCE_URL);
  saveSnapshot(words);
  console.log(
    JSON.stringify(
      {
        message: "Snapshot job completed.",
        totalWords: words.length,
        snapshotPath: SNAPSHOT_PATH,
      },
      null,
      2
    )
  );
}

runSnapshotJob().catch((error) => {
  console.error(error);
  process.exit(1);
});
