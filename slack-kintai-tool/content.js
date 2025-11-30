chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FILL_KINTAI") {
    try {
      // 指定されたクラス名で要素を探す
      const startInput = document.querySelector(".start");
      const endInput = document.querySelector(".end");

      let found = false;

      if (startInput) {
        startInput.value = request.start;
        // Reactなどのフレームワーク対策（念のためイベント発火）
        startInput.dispatchEvent(new Event("input", { bubbles: true }));
        startInput.dispatchEvent(new Event("change", { bubbles: true }));
        found = true;
      }

      if (endInput) {
        endInput.value = request.end;
        endInput.dispatchEvent(new Event("input", { bubbles: true }));
        endInput.dispatchEvent(new Event("change", { bubbles: true }));
        found = true;
      }

      sendResponse({ success: found });
    } catch (e) {
      console.error(e);
      sendResponse({ success: false, error: e.message });
    }
  }
  // 非同期レスポンスのためにtrueを返す
  return true;
});
