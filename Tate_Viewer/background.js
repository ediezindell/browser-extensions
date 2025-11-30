chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openFloatingViewer",
    title: "縦書きビューアで読む",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openFloatingViewer" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "open_viewer",
      text: info.selectionText,
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  // アイコンクリック時は選択テキストがないため、空で開くかアラート
  chrome.tabs.sendMessage(tab.id, { action: "open_viewer", text: "" });
});
