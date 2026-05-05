const ld = document.getElementById("ld");
const err = document.getElementById("err");
const content = document.getElementById("content");
const newPanel = document.getElementById("newPanel");
const topicPanel = document.getElementById("topicPanel");

async function renderHome() {
  try {
    const data = await window.appCommon.fetchData();
    const done = data.stats.doneCount;

    document.getElementById("sTotal").textContent = data.stats.total;
    document.getElementById("sNew").textContent = data.stats.newCount;
    document.getElementById("sDone").textContent = done;
    document.getElementById("sTodo").textContent = data.stats.total - done;

    if (data.newWords.length > 0) {
      document.getElementById("newBadge").textContent = `${data.newWords.length} từ`;
      document.getElementById("newList").innerHTML = data.newWords
        .slice(0, 12)
        .map(
          (word) =>
            `<div class="nwr"><strong>${window.appCommon.escapeHtml(word.term)}</strong><span style="color:#888;font-style:italic">${window.appCommon.escapeHtml(word.pronunciation || "—")}</span><span>${window.appCommon.escapeHtml(word.meaning)}</span></div>`
        )
        .join("");
      newPanel.classList.remove("hidden");
    } else {
      newPanel.classList.add("hidden");
    }

    document.getElementById("topicList").innerHTML = data.topics
      .map(
        (topic) =>
          `<div class="tbar"><span><span class="tag tg-topic">${window.appCommon.escapeHtml(topic.name)}</span></span><strong>${topic.count} từ</strong></div>`
      )
      .join("");
    topicPanel.classList.remove("hidden");

    ld.classList.add("hidden");
    content.classList.remove("hidden");
  } catch (error) {
    ld.classList.add("hidden");
    err.textContent = `❌ ${error.message}`;
    err.classList.remove("hidden");
  }
}

renderHome();
