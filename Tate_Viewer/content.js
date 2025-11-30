// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "open_viewer") {
    // --- ★修正：HTML構造ごと取得する処理 ---
    const selection = window.getSelection();
    let htmlContent = "";

    if (selection.rangeCount > 0) {
      // 選択範囲を「DOMの断片」としてクローン取得
      const range = selection.getRangeAt(0);
      const fragment = range.cloneContents();

      // 一時的なdivに入れてinnerHTMLとして取り出す
      const div = document.createElement("div");
      div.appendChild(fragment);
      htmlContent = div.innerHTML;
    }
    // ------------------------------------

    if (!htmlContent.trim()) {
      alert("読みたいテキストを選択してください");
      return;
    }

    // 2. 既存削除
    const existingFrame = document.getElementById("tate-viewer-iframe");
    if (existingFrame) existingFrame.remove();

    // 3. Iframe作成
    const iframe = document.createElement("iframe");
    iframe.id = "tate-viewer-iframe";
    iframe.src = chrome.runtime.getURL("viewer/index.html");

    Object.assign(iframe.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      border: "none",
      zIndex: "2147483647",
      backgroundColor: "transparent",
    });

    document.body.appendChild(iframe);

    // 4. 通信 (ロード完了後に HTML を送信)
    iframe.onload = () => {
      iframe.contentWindow.postMessage(
        { type: "RENDER_TEXT", html: htmlContent },
        "*",
      );
      iframe.focus();
    };

    // 5. 閉じる処理
    const closeListener = (event) => {
      if (event.data.type === "CLOSE_VIEWER") {
        iframe.remove();
        window.removeEventListener("message", closeListener);
      }
    };
    window.addEventListener("message", closeListener);
  }
});
