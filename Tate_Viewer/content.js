// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // background.js から "open_viewer" という合図が来たら動く
  if (request.action === "open_viewer") {
    // 1. テキストの取得
    let text = request.text;
    // 右クリック以外（アイコンクリック等）でテキストが空なら、現在選択中の文字をとる
    if (!text) {
      text = window.getSelection().toString().trim();
    }
    if (!text) {
      alert("縦書きで読みたいテキストを選択してください");
      return;
    }

    // 2. 既に開いていたら一度消す（リセット）
    const existingFrame = document.getElementById("tate-viewer-iframe");
    if (existingFrame) {
      existingFrame.remove();
    }

    // 3. Iframeを作成（これが「Shadow DOM」の代わりの隔離カプセル）
    const iframe = document.createElement("iframe");
    iframe.id = "tate-viewer-iframe";
    // ライブラリのファイルを読み込む
    iframe.src = chrome.runtime.getURL("viewer/index.html");

    // 4. フローティング表示のスタイル（画面いっぱいに重ねる）
    Object.assign(iframe.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      border: "none",
      zIndex: "2147483647", // 最前面
      background: "transparent", // 背景はライブラリ側に任せる
    });

    document.body.appendChild(iframe);

    // 5. Iframeの読み込み完了を待ってから、テキストを送る
    iframe.onload = () => {
      // iframeの中にある adapter.js に向かってメッセージを投げる
      iframe.contentWindow.postMessage(
        { type: "RENDER_TEXT", text: text },
        "*",
      );

      // 念のためフォーカスを移す（キー操作のため）
      iframe.focus();
    };

    // 6. Iframeの中から「閉じる」合図が来たら、自分（iframe）を消す
    window.addEventListener("message", (event) => {
      if (event.data.type === "CLOSE_VIEWER") {
        iframe.remove();
      }
    });
  }
});
