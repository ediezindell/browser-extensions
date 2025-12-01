(function () {
  const LOG_PREFIX = "[Oreore URL Revealer]";
  const URL_SPAN_CLASS = "oreore-url-display";
  const SHOW_CLASS = "oreore-show-urls";
  const STORAGE_KEY = "oreore_url_visible";

  // スタイル定義
  const style = document.createElement("style");
  style.textContent = `
    .${URL_SPAN_CLASS} {
      display: none;
      font-size: 0.75em;
      color: #5e6c84;
      margin-left: 6px;
      font-weight: normal;
      font-family: monospace;
    }
    body.${SHOW_CLASS} .${URL_SPAN_CLASS} {
      display: inline;
    }
  `;
  document.head.appendChild(style);

  // 設定読み込み
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const shouldShow = result[STORAGE_KEY] !== false;
    if (shouldShow) {
      document.body.classList.add(SHOW_CLASS);
    }
  });

  // 切り替え＆保存
  function toggleDisplay() {
    const isNowOn = document.body.classList.toggle(SHOW_CLASS);
    chrome.storage.local.set({ [STORAGE_KEY]: isNowOn });
  }

  chrome.runtime.onMessage.addListener((request) => {
    if (request.command === "toggle_url_display") {
      toggleDisplay();
    }
  });

  function revealUrls() {
    const links = document.querySelectorAll("a[href]");
    const currentLocation = window.location.href.split("#")[0];

    links.forEach((link) => {
      if (link.querySelector(`.${URL_SPAN_CLASS}`)) return;
      if (link.dataset.oreoreProcessed) return;

      // --- 除外エリア設定 ---

      // 1. サイドバー (nav)
      if (link.closest("nav")) {
        link.dataset.oreoreProcessed = "true";
        return;
      }

      // 2. ページヘッダー (最終更新、編集ボタンなど) ★ここを追加
      if (link.closest('[data-testid="content-header-container"]')) {
        link.dataset.oreoreProcessed = "true";
        return;
      }

      // --- 基本フィルター ---

      const url = link.href;
      if (!url || !url.startsWith("http")) return;

      const targetLocation = url.split("#")[0];
      if (currentLocation === targetLocation) return;

      const rawHref = link.getAttribute("href");
      if (rawHref && rawHref.startsWith("#")) return;

      const text = link.innerText.trim();
      if (!text) return;
      if (text === url || text.includes(url)) {
        link.dataset.oreoreProcessed = "true";
        return;
      }

      // --- URL表示 ---
      const span = document.createElement("span");
      span.className = URL_SPAN_CLASS;
      span.textContent = `(${url})`;

      link.appendChild(span);
      link.dataset.oreoreProcessed = "true";
    });
  }

  revealUrls();
  const observer = new MutationObserver(revealUrls);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href", "data-card-url"],
  });
  setInterval(revealUrls, 3000);
})();
