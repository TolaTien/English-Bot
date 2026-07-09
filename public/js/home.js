const ld = document.getElementById("ld");
const err = document.getElementById("err");
const content = document.getElementById("content");
const newPanel = document.getElementById("newPanel");
const topicPanel = document.getElementById("topicPanel");

function ttsButton(word) {
  return `<button type="button" class="tts-btn" onclick="event.stopPropagation();window.tts.speak('${word.replace(/'/g, "\\'")}');" title="Phát âm">🔊</button>`;
}

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
            `<div class="nwr"><strong>${window.appCommon.escapeHtml(word.term)}</strong> ${ttsButton(word.term)}<span style="color:#888;font-style:italic;margin-left:4px;">${window.appCommon.escapeHtml(word.pronunciation || "—")}</span><span>${window.appCommon.escapeHtml(word.meaning)}</span></div>`
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
