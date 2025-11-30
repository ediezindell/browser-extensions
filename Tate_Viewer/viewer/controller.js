// viewer/controller.js

// 1. 拡張機能からのメッセージを待機
window.addEventListener("message", (event) => {
  if (event.data.type === "RENDER_TEXT") {
    const text = event.data.text;
    const bodyDiv = document.getElementById("novel-body");

    // 2. テキストを流し込む
    bodyDiv.textContent = text;

    // 3. テキストセット完了後にライブラリを起動
    try {
      // ライブラリのクラスを初期化（グローバルにあるはず）
      if (typeof SNViewerAppClass !== "undefined") {
        const viewerApp = new SNViewerAppClass();
        // 表示アニメーション
        const appDiv = document.getElementById("snv-app");
        if (appDiv) appDiv.style.opacity = "1";
      } else {
        console.error(
          "SNViewerAppClassが見つかりません。ライブラリの読み込み順序を確認してください。",
        );
      }
    } catch (e) {
      console.error("ライブラリの起動に失敗しました", e);
    }
  }
});

// 4. ESCキーで閉じる処理
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    window.parent.postMessage({ type: "CLOSE_VIEWER" }, "*");
  }
});
