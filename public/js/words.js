const searchInput = document.getElementById("search");
const topicFilter = document.getElementById("topicFilter");
const statusFilter = document.getElementById("statusFilter");
const wordTable = document.getElementById("wordTable");
const wordLabel = document.getElementById("wordLabel");

let words = [];

function renderTable() {
  const query = searchInput.value.trim().toLowerCase();
  const topic = topicFilter.value;
  const status = statusFilter.value;

  let list = words;
  if (query) {
    list = list.filter((word) => {
      const bucket = [word.term, word.pronunciation, word.meaning, word.type, word.topic].join(" ").toLowerCase();
      return bucket.includes(query);
    });
  }
  if (topic) {
    list = list.filter((word) => word.topic === topic);
  }
  if (status === "done") {
    list = list.filter((word) => window.appCommon.isDone(word));
  } else if (status === "undone") {
    list = list.filter((word) => !window.appCommon.isDone(word));
  }

  wordLabel.textContent = `Hiển thị ${list.length} / ${words.length} từ`;
  wordTable.innerHTML = list
    .map((word, index) => {
      const statusTag = window.appCommon.isDone(word) ? '<span class="tag tg-done">✓ Done</span>' : "";
      return `<tr>
        <td style="color:#ccc;font-size:11px">${index + 1}</td>
        <td><strong>${window.appCommon.escapeHtml(word.term)}</strong> ${statusTag}</td>
        <td style="color:#888;font-style:italic">${window.appCommon.escapeHtml(word.pronunciation || "—")}</td>
        <td>${word.type ? `<span class="tag tg-type">${window.appCommon.escapeHtml(word.type)}</span>` : "—"}</td>
        <td>${window.appCommon.escapeHtml(word.meaning)}</td>
        <td>${word.topic ? `<span class="tag tg-topic">${window.appCommon.escapeHtml(word.topic)}</span>` : "—"}</td>
        <td>${window.appCommon.escapeHtml(word.status || "—")}</td>
      </tr>`;
    })
    .join("");
}

async function bootstrap() {
  const data = await window.appCommon.fetchData();
  words = data.words;

  const topicOptions = [...new Set(words.map((word) => word.topic).filter(Boolean))].sort();
  topicFilter.innerHTML =
    '<option value="">Tất cả chủ đề</option>' +
    topicOptions.map((topic) => `<option value="${window.appCommon.escapeHtml(topic)}">${window.appCommon.escapeHtml(topic)}</option>`).join("");

  renderTable();
}

searchInput.addEventListener("input", renderTable);
topicFilter.addEventListener("change", renderTable);
statusFilter.addEventListener("change", renderTable);

bootstrap().catch((error) => {
  wordLabel.textContent = `Không thể tải dữ liệu: ${error.message}`;
});
