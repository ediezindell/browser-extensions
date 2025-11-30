// viewer/controller.js

window.addEventListener("message", (event) => {
  if (event.data.type === "RENDER_TEXT") {
    // ★修正：HTMLを受け取る
    const rawHtml = event.data.html;
    const bodyDiv = document.getElementById("novel-body");

    // --- HTML整形ロジック ---
    // 1. 一時的なDOMを作ってHTMLを流し込む
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = rawHtml;

    // 2. 「見た目の改行」になりうるタグを、特定の記号（\n）に置換する
    // <br> -> \n
    tempDiv.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));

    // ブロック要素 (<p>, <div>, <li> 等) の直後に \n を挿入
    // ※これをしないと <div>A</div><div>B</div> が "AB" と繋がってしまう
    const blockTags = [
      "p",
      "div",
      "li",
      "tr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ];
    blockTags.forEach((tag) => {
      tempDiv.querySelectorAll(tag).forEach((el) => {
        el.after("\n");
      });
    });

    // 3. タグを全部捨てて、純粋なテキストを取り出す
    const plainText = tempDiv.textContent;

    // 4. \n で分割し、再度 <p> タグで包んで小説形式にする
    const finalHtml = plainText
      .split("\n")
      .map((line) => line.trim()) // 空白除去
      .filter((line) => line !== "") // 空行除去
      .map((line) => {
        // HTMLエスケープ（念のため）
        const safeLine = line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `<p>${safeLine}</p>`;
      })
      .join("");

    // -------------------------

    // 5. 流し込む
    bodyDiv.innerHTML = finalHtml;

    // 6. ライブラリ起動
    try {
      if (typeof SNViewerAppClass !== "undefined") {
        const viewerApp = new SNViewerAppClass();
        const appDiv = document.getElementById("snv-app");
        if (appDiv) appDiv.style.opacity = "1";
      }
    } catch (e) {
      console.error("ライブラリ起動エラー", e);
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    window.parent.postMessage({ type: "CLOSE_VIEWER" }, "*");
  }
});
