/* ============================================================
   fronted-v2 / game.js
   ログイン中に遊べるゲーム要素（コイン制）。UIスタイルは css/game.css。

   仕様（GAME/README.md の仕様変更に対応）:
     - 体力/攻撃力/防御力・レベル・経験値・ルーン・ステージは撤廃
     - コインを消費して GAME/ 内のミニゲームをプレイし、
       クリアで難易度に応じたコインを獲得する
     - コイン枚数はヘッダー左とゲーム画面で確認できる
     - 進捗バーは継続: API紹介ページ内クリックで上昇し、100%でコイン+1

   設計方針（後からの機能追加・保守を意識）:
     - CONFIG … 枚数・ゲーム一覧などの調整値を1か所に集約
     - state … localStorage に保存する単一のゲーム状態 { coins, progress }
     - logic … 状態を更新する関数（addCoins / spendCoins / bumpProgress）
     - ui    … 状態から画面を描く関数（副作用は DOM のみ）
     - init  … DOM 生成とイベント結線
   既存 app.js とは疎結合。API閲覧の通知だけ CustomEvent("apipage:shown") で受け取る。
   GAME/ 内の各ゲームとは postMessage({type:"game:ended", coin}) で連携する
   （coin 0 = ゲームオーバー / 1以上 = クリアで獲得枚数）。

   index:
     1. CONFIG（コイン設定・ゲーム一覧）
     2. STATE（保存・読込）
     3. LOGIC（コイン増減・進捗）
     4. UI: ヘッダー（コイン表示・進捗バー）
     5. UI: コイン獲得ポップアップ
     6. UI: ゲーム画面（コイン確認 + ゲーム一覧）
     7. UI: ゲームプレイ（iframe）と結果
     8. INIT
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     1. CONFIG — バランス調整用の定数はすべてここ
     ============================================================ */
  const CONFIG = {
    storageKey: "fronted-v2-game",
    initialCoins: 5,           // 初回付与コイン
    progressStep: 20,          // 進捗バーの1クリック上昇量（%）
    progressCoins: 1,          // 進捗100%到達で得るコイン
    // クリア報酬の目安（難易度→枚数）。実際の獲得枚数は各ゲームが
    // game:ended の coin で通知する（ゲーム内で難易度選択できるものがあるため）
    rewardByDifficulty: { easy: 1, normal: 2, hard: 3 },
    // GAME/ 内のプレイ可能ゲーム一覧。reward は一覧表示用のラベル。
    // playCost はゲームごとの1プレイ消費コイン（個別に設定可能）
    games: [
      { file: "Tilegame.html",   title: "Triple Tile",       icon: "ti-cat",             difficulty: "易", reward: "1", playCost: 1 },
      { file: "target.html",     title: "的あてゲーム",      icon: "ti-target-arrow",    difficulty: "選択式", reward: "1〜3", playCost: 1 },
      { file: "pazuru.html",     title: "スライドパズル",    icon: "ti-puzzle",          difficulty: "普", reward: "2", playCost: 1 },
      { file: "picross.html",    title: "ピクロス",          icon: "ti-grid-dots",       difficulty: "普", reward: "2", playCost: 1 },
      { file: "undertale.html",  title: "骨よけサバイバル",  icon: "ti-bone",            difficulty: "普", reward: "2", playCost: 2 },
      { file: "burroku.html",    title: "ブロック崩し",      icon: "ti-wall",            difficulty: "選択式", reward: "1〜3", playCost: 2 },
      { file: "game.html",       title: "勇者RPG",           icon: "ti-sword",           difficulty: "難", reward: "3", playCost: 3 },
      { file: "syuuthingu.html", title: "ゾンビシューター",  icon: "ti-crosshair",       difficulty: "難", reward: "3", playCost: 3 },
    ],
  };

  /* ============================================================
     2. STATE — localStorage に保存する単一状態
     ============================================================ */
  function defaultState() {
    return {
      coins: CONFIG.initialCoins,
      progress: 0,   // ヘッダー進捗バー（0〜100）
    };
  }

  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "{}");
      const d = defaultState();
      return {
        // 旧RPG版の保存データ（level/xp/runes等）はコイン制移行で破棄する
        coins: typeof saved.coins === "number" ? saved.coins : d.coins,
        progress: typeof saved.progress === "number" ? saved.progress : d.progress,
      };
    } catch { return defaultState(); }
  }

  function saveState() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
  }

  /* ============================================================
     3. LOGIC — コイン増減・進捗
     ============================================================ */
  function addCoins(n) {
    state.coins += n;
    saveState();
    renderCoins();
  }

  // 足りなければ false を返し消費しない
  function spendCoins(n) {
    if (state.coins < n) return false;
    state.coins -= n;
    saveState();
    renderCoins();
    return true;
  }

  // 進捗バーを step 上げ、100%に達したらコイン付与（付与時 true を返す）
  function bumpProgress() {
    state.progress += CONFIG.progressStep;
    if (state.progress >= 100) {
      state.progress = 0;
      addCoins(CONFIG.progressCoins);
      return true;
    }
    saveState();
    return false;
  }

  /* ============================================================
     4. UI: ヘッダー（コイン表示・進捗バー）
     ============================================================ */
  const el = {}; // init で id 参照をまとめる

  // ヘッダー左とゲーム画面のコイン枚数をまとめて更新
  function renderCoins() {
    if (el.hdrCoin) el.hdrCoin.textContent = state.coins;
    const inGame = document.getElementById("game-coin-count");
    if (inGame) inGame.textContent = state.coins;
    renderGameList(); // 残高でプレイ可否が変わるためボタン状態も更新
  }

  function renderProgress() {
    if (!el.progFill) return;
    el.progFill.style.width = state.progress + "%";
    el.progLabel.textContent = "進捗 " + state.progress + "%";
  }

  function showProgressBar(show) {
    if (el.progWrap) el.progWrap.classList.toggle("show", show);
  }

  // API紹介ページ(iframe)内でのボタン等のクリックを検知して進捗を進める。
  // 同一オリジン配信（../templates/ を fronted-v2 と同じホストから配信）前提。
  // 別オリジンで開いた場合は contentDocument に触れずエラーになるため try/catch で無視する。
  function handleIframeClick(e) {
    const clickable = e.target.closest('button, a, input[type="button"], input[type="submit"], [onclick]');
    if (!clickable) return;
    const awarded = bumpProgress();
    renderProgress();
    if (awarded) showCoinPopup(CONFIG.progressCoins, "閲覧進捗 100% 達成！");
  }

  function attachIframeClickTracking(preview) {
    preview.addEventListener("load", () => {
      try {
        preview.contentDocument.addEventListener("click", handleIframeClick);
      } catch {
        // 別オリジン等でアクセスできない場合は進捗検知をあきらめる
      }
    });
  }

  /* ============================================================
     5. UI: コイン獲得ポップアップ
     ============================================================ */
  function showCoinPopup(amount, subText) {
    document.getElementById("coin-gain").textContent = `コイン +${amount} 獲得！`;
    document.getElementById("coin-gain-sub").textContent = subText || "";
    document.getElementById("coin-gain-total").textContent = `所持コイン: ${state.coins}`;
    openOverlay("coin-overlay");
  }

  /* ============================================================
     6. UI: ゲーム画面（コイン確認 + ゲーム一覧）
     ============================================================ */
  function renderGameList() {
    const grid = document.getElementById("game-list-grid");
    if (!grid) return;
    const short = state.coins < Math.min(...CONFIG.games.map(g => g.playCost));
    grid.innerHTML = CONFIG.games.map((g, i) => `
      <div class="game-card">
        <div class="game-card-icon"><i class="ti ${g.icon}"></i></div>
        <div class="game-card-body">
          <div class="game-card-title">${g.title}</div>
          <div class="game-card-meta">難易度: ${g.difficulty} ／ 報酬: ${g.reward}枚</div>
        </div>
        <button class="game-btn game-play-btn" data-game="${i}" ${state.coins < g.playCost ? "disabled" : ""}>
          <i class="ti ti-coins"></i> ${g.playCost}枚
        </button>
      </div>`).join("");
    const note = document.getElementById("game-coin-short");
    if (note) note.style.display = short ? "block" : "none";
  }

  function openGameScreen() {
    renderCoins();
    renderGameList();
    openOverlay("game-screen-overlay");
  }

  /* ============================================================
     7. UI: ゲームプレイ（iframe）と結果
     ============================================================ */
  let playing = false; // プレイ中フラグ（game:ended の二重処理防止）

  // ゲームプレイ用のオーバーレイと iframe を遅延生成（再利用可能）
  function ensurePlayOverlay() {
    let ov = document.getElementById("game-preview-overlay");
    if (ov) return ov;
    ov = document.createElement("div");
    ov.id = "game-preview-overlay";
    ov.className = "game-overlay";
    ov.innerHTML = `
      <div class="game-preview-shell" style="position:fixed;inset:0;display:flex;align-items:stretch;justify-content:center;">
        <button class="game-close" data-close="game-preview-overlay" style="position:absolute;top:12px;right:12px;z-index:1010"><i class="ti ti-x"></i></button>
        <iframe id="game-preview-iframe" style="flex:1;width:100%;height:100%;border:0;background:#fff;" title="Game Preview"></iframe>
      </div>`;
    document.body.appendChild(ov);
    return ov;
  }

  // 開始処理: コインを消費してゲームを iframe で起動（残高不足なら起動しない）
  function startGame(game) {
    if (!spendCoins(game.playCost)) return;
    const ov = ensurePlayOverlay();
    document.getElementById("game-preview-iframe").src = "../GAME/" + game.file;
    closeOverlay("game-screen-overlay");
    ov.classList.add("open");
    playing = true;
  }

  // 終了処理: ゲームからの game:ended {coin} を受けて結果を表示
  // coin 0 = ゲームオーバー / 1以上 = クリア（獲得枚数）
  function handleGameEnded(coin) {
    if (!playing) return;
    playing = false;
    const ov = document.getElementById("game-preview-overlay");
    if (ov) ov.classList.remove("open");
    const ifr = document.getElementById("game-preview-iframe");
    if (ifr) ifr.src = "";

    const cleared = coin >= 1;
    if (cleared) addCoins(coin);
    document.getElementById("game-result-icon").innerHTML =
      cleared ? '<i class="ti ti-trophy"></i>' : '<i class="ti ti-skull"></i>';
    document.getElementById("game-result-title").textContent =
      cleared ? "ゲームクリア！" : "ゲームオーバー…";
    document.getElementById("game-result-desc").textContent =
      cleared ? `コイン +${coin} 獲得！（所持: ${state.coins}）` : `所持コイン: ${state.coins}`;
    openOverlay("game-result-overlay");
  }

  /* ============================================================
     オーバーレイ開閉ヘルパー
     ============================================================ */
  function openOverlay(id) { document.getElementById(id).classList.add("open"); }
  function closeOverlay(id) { document.getElementById(id).classList.remove("open"); }

  /* ============================================================
     モーダルのDOMを生成（index.html を汚さず game 内で完結）
     ============================================================ */
  function buildModals() {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <!-- コイン獲得ポップアップ（進捗100%達成時） -->
      <div class="game-overlay" id="coin-overlay">
        <div class="game-modal coin-modal">
          <button class="game-close" data-close="coin-overlay"><i class="ti ti-x"></i></button>
          <div class="coin-icon"><i class="ti ti-coins"></i></div>
          <div class="coin-gain" id="coin-gain"></div>
          <div class="coin-gain-sub" id="coin-gain-sub"></div>
          <div class="coin-gain-total" id="coin-gain-total"></div>
          <div style="margin-top:20px;"><button class="game-btn" data-close="coin-overlay">とじる</button></div>
        </div>
      </div>

      <!-- ゲーム画面（コイン確認 + ゲーム一覧） -->
      <div class="game-overlay" id="game-screen-overlay">
        <div class="game-modal wide">
          <button class="game-close" data-close="game-screen-overlay"><i class="ti ti-x"></i></button>
          <div class="game-title">ゲーム</div>
          <div class="game-coin-row">
            <i class="ti ti-coins"></i>
            <span class="game-coin-count" id="game-coin-count">0</span>
            <span class="game-coin-unit">枚</span>
          </div>
          <p class="game-sub">途中で閉じても消費したコインは戻りません</p>
          <div class="game-list-grid" id="game-list-grid"></div>
          <p class="game-coin-short" id="game-coin-short" style="display:none;">
            コインが足りません。API紹介ページを閲覧して進捗100%でコインを獲得できます
          </p>
        </div>
      </div>

      <!-- 結果ポップアップ（クリア / ゲームオーバー） -->
      <div class="game-overlay" id="game-result-overlay">
        <div class="game-modal coin-modal">
          <div class="coin-icon" id="game-result-icon"></div>
          <div class="coin-gain" id="game-result-title"></div>
          <div class="coin-gain-total" id="game-result-desc"></div>
          <div style="margin-top:20px;">
            <button class="game-btn" id="game-result-again-btn">ゲーム一覧へ</button>
            <button class="game-btn ghost" data-close="game-result-overlay">とじる</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }

  /* ============================================================
     8. INIT — DOM参照・イベント結線
     ============================================================ */
  function init() {
    buildModals();

    // 参照をまとめる
    el.progWrap  = document.getElementById("hdr-progress");
    el.progFill  = document.getElementById("hdr-progress-fill");
    el.progLabel = document.getElementById("hdr-progress-label");
    el.hdrCoin   = document.getElementById("hdr-coin-count");

    // API紹介ページ(iframe)内のクリックを検知して進捗を進める（+20%、100%でコイン付与）
    const preview = document.getElementById("preview");
    if (preview) attachIframeClickTracking(preview);

    // ハッシュ付きURLでのリロード等、game.js の初期化前に app.js が
    // 既にページを選択済み（"apipage:shown" を発火済み）のケースを補う。
    if (preview && !preview.classList.contains("hidden")) showProgressBar(true);

    // サイドバーのゲームボタン → ゲーム画面
    const gameBtn = document.getElementById("game-open-btn");
    if (gameBtn) gameBtn.addEventListener("click", openGameScreen);

    // ゲーム一覧のプレイボタン（コイン消費して起動）
    document.getElementById("game-list-grid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-game]");
      if (!btn || btn.disabled) return;
      startGame(CONFIG.games[Number(btn.dataset.game)]);
    });

    // 結果ポップアップ → ゲーム一覧へ戻る
    document.getElementById("game-result-again-btn").addEventListener("click", () => {
      closeOverlay("game-result-overlay");
      openGameScreen();
    });

    // GAME/ 内のゲームからの終了通知
    window.addEventListener("message", (ev) => {
      if (ev && ev.data && ev.data.type === "game:ended") {
        handleGameEnded(Number(ev.data.coin) || 0);
      }
    });

    // 汎用: data-close / 背景クリック / Esc で閉じる
    // （プレイ中に閉じた場合は中断扱い。消費済みコインは戻らない）
    document.querySelectorAll(".game-overlay").forEach(ov => {
      ov.addEventListener("click", (e) => {
        if (e.target === ov || e.target.closest("[data-close]")) closeAnyOverlay(ov);
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") document.querySelectorAll(".game-overlay.open").forEach(closeAnyOverlay);
    });
    function closeAnyOverlay(ov) {
      ov.classList.remove("open");
      if (ov.id === "game-preview-overlay") {
        playing = false;
        const ifr = document.getElementById("game-preview-iframe");
        if (ifr) ifr.src = "";
      }
    }

    // API紹介ページ表示中だけ進捗バーを出す（app.js からの通知）
    document.addEventListener("apipage:shown", () => showProgressBar(true));

    // 初期描画
    renderProgress();
    renderCoins();
  }

  init();
})();
