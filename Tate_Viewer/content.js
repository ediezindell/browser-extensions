(function () {
  // 即時実行関数で囲む（returnを使えるようにするため）

  // 既にビューアが存在する場合は非表示にする（トグル機能）
  if (document.getElementById("tate-viewer-overlay")) {
    const existingViewer = document.getElementById("tate-viewer-overlay");
    existingViewer.remove();
    return; // 関数内なのでreturn可能
  }

  // 1. 選択されているテキストを取得
  const selectedText = window.getSelection().toString().trim();

  if (!selectedText) {
    alert(
      "縦書きで読みたいテキストを選択してから、再度アイコンをクリックしてください。",
    );
    return; // 関数内なのでreturn可能
  }

  // 2. オーバーレイ要素を作成
  const overlay = document.createElement("div");
  overlay.id = "tate-viewer-overlay";

  // 3. 縦書き表示領域（ビューア本体）を作成
  const viewer = document.createElement("div");
  viewer.id = "tate-viewer";
  viewer.textContent = selectedText;

  // 4. スタイルを設定（CSS）
  overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.85); /* 半透明の黒背景 */
        z-index: 99999; /* 最前面に表示 */
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
    `;

  viewer.style.cssText = `
        /* 縦書きの核心部分 */
        writing-mode: vertical-rl; /* 縦書き（右から左）*/
        -webkit-writing-mode: vertical-rl;
        -ms-writing-mode: vertical-rl;
        
        font-family: 'Hiragino Mincho ProN', '游明朝', 'YuMincho', serif;
        font-size: 1.25rem;
        line-height: 2.2; /* 行間を広めに */
        letter-spacing: 0.1em; /* 文字間隔 */
        
        color: #ddd; /* 文字色 */
        background-color: #222; /* ビューアの背景色 */
        padding: 30px;
        height: 80%;
        max-width: 80%; /* 幅を広くとる */
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        white-space: pre-wrap; /* 改行を反映させる */
        overflow: auto; /* 読みきれない場合にスクロール可能にする */
    `;

  // 5. 閉じるボタンを設定
  overlay.addEventListener("click", (e) => {
    // ビューア本体やテキスト部分がクリックされた場合は閉じない
    if (e.target.id === "tate-viewer-overlay") {
      overlay.remove();
    }
  });

  // 6. 画面に追加
  overlay.appendChild(viewer);
  document.body.appendChild(overlay);
})(); // 即時実行関数の終わり
