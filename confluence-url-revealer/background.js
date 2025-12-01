// アイコンがクリックされた時の処理
chrome.action.onClicked.addListener((tab) => {
  // 現在のタブにメッセージを送る
  chrome.tabs
    .sendMessage(tab.id, { command: "toggle_url_display" })
    .catch(() => {
      // ページがまだ読み込まれていない時などのエラー対策（何もしない）
    });
});
