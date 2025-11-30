// 拡張機能がインストールされたとき、またはアップデートされたときにメニュー項目を作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "tateViewer", // メニュー項目の識別ID
    title: "縦書きビューアで表示", // メニューに表示されるテキスト
    contexts: ["selection"] // テキスト選択時にのみ表示する
  });
});

// 右クリックメニューの項目がクリックされた時の処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // クリックされたメニュー項目のIDが "tateViewer" かつテキストが選択されている場合
  if (info.menuItemId === "tateViewer" && info.selectionText) {
    // content.js を実行する
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['content.js']
    });
  }
});

// アイコンクリック時の動作は残しておく
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['content.js']
  });
});
