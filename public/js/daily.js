const emptyDaily = document.getElementById("emptyDaily");
const dailyContent = document.getElementById("dailyContent");
const dailyDesc = document.getElementById("dailyDesc");
const dailyList = document.getElementById("dailyList");

async function renderDaily() {
  const data = await window.appCommon.fetchData();
  if (data.newWords.length === 0) {
    emptyDaily.classList.remove("hidden");
    dailyContent.classList.add("hidden");
    return;
  }

  dailyDesc.textContent = `Phát hiện ${data.newWords.length} từ mới kể từ snapshot trước đó.`;
  dailyList.innerHTML = data.newWords
    .map(
      (word) =>
        `<div class="nwr"><strong>${window.appCommon.escapeHtml(word.term)}</strong><span style="color:#888;font-style:italic">${window.appCommon.escapeHtml(word.pronunciation || "—")}</span><span>${window.appCommon.escapeHtml(word.meaning)}</span></div>`
    )
    .join("");

  emptyDaily.classList.add("hidden");
  dailyContent.classList.remove("hidden");
}

renderDaily().catch((error) => {
  emptyDaily.classList.remove("hidden");
  emptyDaily.innerHTML = `<div class="ei">❌</div><div>${window.appCommon.escapeHtml(error.message)}</div>`;
});
