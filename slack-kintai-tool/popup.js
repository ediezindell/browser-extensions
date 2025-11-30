// --- ユーティリティ ---
function log(msg, isError = false) {
  const el = document.getElementById("logArea");
  el.textContent = msg;
  el.className = isError ? "error" : "";
}

function showTab(tabName) {
  // タブの見た目
  document
    .getElementById("tabMain")
    .classList.toggle("active", tabName === "main");
  document
    .getElementById("tabSettings")
    .classList.toggle("active", tabName === "settings");

  // 画面の表示
  document
    .getElementById("viewMain")
    .classList.toggle("hidden", tabName !== "main");
  document
    .getElementById("viewSettings")
    .classList.toggle("hidden", tabName !== "settings");
}

// --- 初期化処理 ---
document.addEventListener("DOMContentLoaded", () => {
  // 日付初期化
  document.getElementById("targetDate").valueAsDate = new Date();

  // 設定読み込み
  chrome.storage.local.get(["slackToken", "channelId"], (items) => {
    if (items.slackToken)
      document.getElementById("token").value = items.slackToken;
    if (items.channelId)
      document.getElementById("channelId").value = items.channelId;

    // 設定が空なら設定画面を、あればメイン画面を表示
    if (!items.slackToken || !items.channelId) {
      showTab("settings");
    } else {
      showTab("main");
    }
  });
});

// --- タブ切り替え ---
document
  .getElementById("tabMain")
  .addEventListener("click", () => showTab("main"));
document
  .getElementById("tabSettings")
  .addEventListener("click", () => showTab("settings"));

// --- 設定保存 ---
document.getElementById("saveBtn").addEventListener("click", () => {
  const token = document.getElementById("token").value.trim();
  const channelId = document.getElementById("channelId").value.trim();

  if (!token || !channelId) {
    alert("TokenとChannel IDを入力してください");
    return;
  }

  chrome.storage.local.set({ slackToken: token, channelId: channelId }, () => {
    alert("設定を保存しました！\n実行画面に切り替えます。");
    showTab("main");
    log("設定完了。準備OKです！");
  });
});

// --- 変数 ---
let foundStartTime = null;
let foundEndTime = null;

// --- ① Slackから取得 ---
document.getElementById("fetchBtn").addEventListener("click", async () => {
  const token = document.getElementById("token").value.trim();
  const channelId = document.getElementById("channelId").value.trim();
  const dateStr = document.getElementById("targetDate").value;

  if (!token || !channelId) {
    log("設定が完了していません。「設定・ヘルプ」から登録してください。", true);
    return;
  }

  log("Slackに問い合わせ中...");
  document.getElementById("timesDisplay").textContent = "- : -";
  document.getElementById("fillBtn").disabled = true;

  try {
    // 1. User ID特定
    const authRes = await fetch("https://slack.com/api/auth.test", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const authData = await authRes.json();
    if (!authData.ok) throw new Error("認証失敗: " + authData.error);
    const myUserId = authData.user_id;

    // 2. 日時範囲計算
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const oldest = (startOfDay.getTime() / 1000).toFixed(0);
    const latest = (endOfDay.getTime() / 1000).toFixed(0);

    // 3. 履歴取得
    const historyUrl = `https://slack.com/api/conversations.history?channel=${channelId}&oldest=${oldest}&latest=${latest}&limit=100`;
    const histRes = await fetch(historyUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const histData = await histRes.json();
    if (!histData.ok) throw new Error("履歴取得失敗: " + histData.error);

    // 4. 自分の投稿抽出
    const myMessages = histData.messages.filter((m) => m.user === myUserId);
    if (myMessages.length === 0) {
      log("指定日にあなたの投稿が見つかりませんでした", true);
      return;
    }

    myMessages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));

    const formatTime = (ts) => {
      const d = new Date(parseFloat(ts) * 1000);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    };

    foundStartTime = formatTime(myMessages[0].ts);
    foundEndTime = formatTime(myMessages[myMessages.length - 1].ts);

    document.getElementById("timesDisplay").textContent =
      `${foundStartTime} 〜 ${foundEndTime}`;
    log(`取得成功 (${myMessages.length}件の投稿)`);
    document.getElementById("fillBtn").disabled = false;
  } catch (e) {
    log("エラー: " + e.message, true);
  }
});

// --- ② 勤怠サイトに入力 ---
document.getElementById("fillBtn").addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab) throw new Error("タブが見つかりません");

    chrome.tabs.sendMessage(
      tab.id,
      {
        action: "FILL_KINTAI",
        start: foundStartTime,
        end: foundEndTime,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          log("エラー: 勤怠サイトを開いてから押してください", true);
        } else if (response && response.success) {
          log("入力完了しました！");
        } else {
          log("入力欄(.start / .end)が見つかりませんでした", true);
        }
      },
    );
  } catch (e) {
    log(e.message, true);
  }
});
