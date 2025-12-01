(function () {
  const LOG_PREFIX = "[Oreore URL Revealer]";
  const URL_SPAN_CLASS = "oreore-url-display"; // 重複防止用のクラス名

  function revealUrls() {
    // 1. data-card-url 属性を持つすべての要素を探す
    const cards = document.querySelectorAll("[data-card-url]");

    cards.forEach((card) => {
      // 2. リンク要素(aタグ)を探す
      const link = card.querySelector("a");
      if (!link) return;

      const url = card.getAttribute("data-card-url");
      if (!url) return;

      // 3. 既に我々が追加したURL表示パーツがあるかチェック
      if (link.querySelector(`.${URL_SPAN_CLASS}`)) {
        return; // あれば何もしない
      }

      // 4. URLを表示するパーツを作成
      const span = document.createElement("span");
      span.className = URL_SPAN_CLASS; // 目印クラスをつける
      span.style.fontSize = "0.75em";
      span.style.color = "#5e6c84"; // Confluenceっぽい薄いグレー
      span.style.marginLeft = "6px";
      span.style.fontWeight = "normal";
      span.style.fontFamily = "monospace"; // URLっぽく等幅フォントで
      span.textContent = `(${url})`;

      // 5. リンクの中にそっと追加する（既存の中身は消さない）
      link.appendChild(span);
    });
  }

  // 初回実行
  revealUrls();

  // 監視設定（Reactなどの再描画にしつこく追従する）
  const observer = new MutationObserver(() => {
    revealUrls();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-card-url", "href"], // 属性変化も監視
  });

  // ダメ押しの定期実行（3秒ごと）
  // 複雑な描画更新で消された場合に復活させるため
  setInterval(revealUrls, 3000);

  console.log(`${LOG_PREFIX} Watching for smart links...`);
})();
