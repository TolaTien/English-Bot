window.appCommon = {
  async fetchData() {
    const response = await fetch("/api/data");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Không thể tải dữ liệu.");
    }
    return data;
  },
  escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  },
  isDone(word) {
    return String(word.status || "").toLowerCase() === "done";
  },
};
