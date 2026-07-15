/* ============================================================
   fronted-v2 / game.js
   ログイン中に遊べる軽量ゲーム要素。UIスタイルは css/game.css。

   設計方針（後からの機能追加・保守を意識）:
     - CONFIG … 数値・ステージ・ステータス計算を1か所に集約（バランス調整はここだけ）
     - state … localStorage に保存する単一のゲーム状態
     - logic … 状態を更新する純粋寄りの関数（addXp / clearStage 等）
     - ui    … 状態から画面を描く関数（副作用は DOM のみ）
     - init  … DOM 生成とイベント結線
   既存 app.js とは疎結合。API閲覧の通知だけ CustomEvent("apipage:shown") で受け取る。

   index:
     1. CONFIG（定数・ステータス計算）
     2. STATE（保存・読込）
     3. LOGIC（経験値・ステージ・ルーン）
     4. UI: 進捗バー
     5. UI: 経験値ポップアップ
     6. UI: キャラクター画面
     7. UI: ステージ画面
     8. UI: ルーン獲得
     9. INIT
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     1. CONFIG — バランス調整用の定数はすべてここ
     ============================================================ */
  const CONFIG = {
    storageKey: "fronted-v2-game",
    progressStep: 20,          // 進捗バーの1クリック上昇量（%）
    xpPerAward: 100,           // 進捗100%到達で得る経験値
    xpPerLevel: 100,           // レベルアップに必要な経験値
    runeSlots: 4,              // ルーンの装備枠
    totalStages: 10,           // ステージ総数
    bossStages: [5, 10],       // ボスステージ
    stats: ["hp", "atk", "def"],
    statLabel: { hp: "体力", atk: "攻撃力", def: "防御力" },
    statIcon:  { hp: "ti-heart", atk: "ti-sword", def: "ti-shield" },
    // レベル L のときの基礎ステータス（ここを変えれば成長曲線を調整可能）
    baseStats(level) {
      return {
        hp:  100 + (level - 1) * 20,
        atk:  20 + (level - 1) * 5,
        def:  10 + (level - 1) * 3,
      };
    },
    // ルーンの効果値の範囲（%）
    runePctMin: 5,
    runePctMax: 50,
  };

  const isBoss = (n) => CONFIG.bossStages.includes(n);

  /* ============================================================
     2. STATE — localStorage に保存する単一状態
     ============================================================ */
  function defaultState() {
    return {
      charName: "冒険者",
      level: 1,
      xp: 0,                                  // 現在レベル内の経験値（0〜xpPerLevel-1）
      progress: 0,                            // ヘッダー進捗バー（0〜100）
      stage: 1,                               // 次に挑むステージ（1..totalStages+1）
      runes: new Array(CONFIG.runeSlots).fill(null), // { stat, pct } or null
    };
  }

  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONFIG.storageKey) || "{}");
      const s = Object.assign(defaultState(), saved);
      // runes 配列の長さを枠数に正規化（将来枠数を変えても壊れない）
      s.runes = s.runes.slice(0, CONFIG.runeSlots);
      while (s.runes.length < CONFIG.runeSlots) s.runes.push(null);
      return s;
    } catch { return defaultState(); }
  }

  function saveState() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
  }

  /* ============================================================
     3. LOGIC — 状態更新（純粋寄り）
     ============================================================ */
  // ルーンを加味した最終ステータスを算出
  function computeStats() {
    const base = CONFIG.baseStats(state.level);
    const bonus = { hp: 0, atk: 0, def: 0 };
    state.runes.forEach(r => { if (r) bonus[r.stat] += r.pct; });
    const final = {};
    CONFIG.stats.forEach(k => { final[k] = Math.floor(base[k] * (1 + bonus[k] / 100)); });
    return { base, bonus, final };
  }

  function randomRune() {
    const stat = CONFIG.stats[Math.floor(Math.random() * CONFIG.stats.length)];
    const span = CONFIG.runePctMax - CONFIG.runePctMin;
    const pct = CONFIG.runePctMin + Math.floor(Math.random() * (span + 1));
    return { stat, pct };
  }

  // 経験値を加算し、レベルアップ結果を返す
  function addXp(amount) {
    const from = { level: state.level, xp: state.xp };
    let xp = state.xp + amount;
    let level = state.level;
    let gained = 0;
    while (xp >= CONFIG.xpPerLevel) { xp -= CONFIG.xpPerLevel; level++; gained++; }
    state.xp = xp;
    state.level = level;
    saveState();
    return { from, to: { level, xp }, leveledUp: gained > 0, gainedLevels: gained };
  }

  // 進捗バーを step 上げ、100%に達したら経験値付与（付与時 result を返す）
  function bumpProgress() {
    state.progress += CONFIG.progressStep;
    if (state.progress >= 100) {
      state.progress = 0;
      saveState();
      return addXp(CONFIG.xpPerAward);
    }
    saveState();
    return null;
  }

  // 現在ステージをクリア扱いにして次へ進める。戻り値は獲得ルーン
  function clearCurrentStage() {
    if (state.stage > CONFIG.totalStages) return null;
    state.stage += 1;
    const rune = randomRune();
    saveState();
    return rune;
  }

  /* ============================================================
     4. UI: 進捗バー（ヘッダー）
     ============================================================ */
  const el = {}; // 後で init で id 参照をまとめる

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
    const result = bumpProgress();
    renderProgress();
    if (result) showXpPopup(result, CONFIG.xpPerAward);
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
     5. UI: 経験値・レベルアップ ポップアップ
     ============================================================ */
  // 開始%→終了% へバーを確実にアニメさせる（rAF非依存: reflow で強制）
  function animateBar(fillEl, fromPct, toPct) {
    fillEl.style.transition = "none";
    fillEl.style.width = fromPct + "%";
    void fillEl.offsetWidth;           // reflow
    fillEl.style.transition = "";
    fillEl.style.width = toPct + "%";
  }

  function showXpPopup(result, amount) {
    const { from, to, leveledUp } = result;
    document.getElementById("xp-gain").textContent = `経験値 +${amount} を獲得！`;
    const badge = document.getElementById("xp-lv-badge");
    const levelup = document.getElementById("xp-levelup");
    const fill = document.getElementById("xp-bar-fill");
    const val = document.getElementById("xp-bar-val");
    badge.textContent = "Lv. " + from.level;
    levelup.classList.remove("show");
    val.textContent = `${from.xp} / ${CONFIG.xpPerLevel}`;

    openOverlay("xp-overlay");
    // まず現在レベルのバーを「上がった分」まで伸ばす
    const firstTarget = leveledUp ? 100 : (to.xp / CONFIG.xpPerLevel) * 100;
    animateBar(fill, (from.xp / CONFIG.xpPerLevel) * 100, firstTarget);

    if (leveledUp) {
      setTimeout(() => {
        levelup.textContent = `LEVEL UP!  Lv.${from.level} → Lv.${to.level}`;
        levelup.classList.add("show");
        badge.textContent = "Lv. " + to.level;
        // バーを 0 にスナップしてから残り経験値まで伸ばす
        animateBar(fill, 0, (to.xp / CONFIG.xpPerLevel) * 100);
        val.textContent = `${to.xp} / ${CONFIG.xpPerLevel}`;
        renderCharacterButton();
      }, 700);
    }
  }

  /* ============================================================
     6. UI: キャラクター画面（ステータス / ルーン）
     ============================================================ */
  function renderCharacterButton() {
    if (el.charBtnLv) el.charBtnLv.textContent = "Lv." + state.level;
    if (el.charBtnName) el.charBtnName.textContent = state.charName;
  }

  function renderCharacter() {
    document.getElementById("char-avatar").textContent = (state.charName || "?").charAt(0);
    const input = document.getElementById("char-name-input");
    if (document.activeElement !== input) input.value = state.charName;
    document.getElementById("char-lv-tag").textContent = "Lv. " + state.level;

    // ステータス
    const { base, bonus, final } = computeStats();
    const grid = document.getElementById("char-stat-grid");
    grid.innerHTML = CONFIG.stats.map(k => `
      <div class="stat-card">
        <div class="stat-label"><i class="ti ${CONFIG.statIcon[k]}"></i>${CONFIG.statLabel[k]}</div>
        <div class="stat-value">${final[k]}</div>
        <div class="stat-bonus">${bonus[k] ? "ルーン +" + bonus[k] + "%" : ""}</div>
      </div>`).join("");

    // ルーン枠
    document.getElementById("char-rune-grid").innerHTML = renderRuneSlots(state.runes, false);
    document.getElementById("char-stage-info").textContent =
      state.stage > CONFIG.totalStages
        ? "全ステージ制覇！"
        : `次のステージ: ${state.stage} / ${CONFIG.totalStages}`;
  }

  // ルーン枠のHTML（clickable=true なら獲得ポップアップ用に data-slot を付与）
  function renderRuneSlots(runes, clickable) {
    return runes.map((r, i) => {
      const attr = clickable ? ` data-slot="${i}"` : "";
      if (r) {
        return `<div class="rune-slot filled"${attr}>
          <i class="ti ${CONFIG.statIcon[r.stat]}"></i>
          <span class="rune-stat">${CONFIG.statLabel[r.stat]}</span>
          <span class="rune-pct">+${r.pct}%</span>
        </div>`;
      }
      return `<div class="rune-slot"${attr}>
        <i class="ti ti-plus"></i><span class="rune-empty-txt">空き枠</span>
      </div>`;
    }).join("");
  }

  /* ============================================================
     7. UI: ステージ画面
     ============================================================ */
  function renderStages() {
    const grid = document.getElementById("stage-grid");
    let html = "";
    for (let n = 1; n <= CONFIG.totalStages; n++) {
      const cleared = n < state.stage;
      const current = n === state.stage;
      const cls = ["stage-cell"];
      if (isBoss(n)) cls.push("boss");
      if (cleared) cls.push("cleared");
      else if (current) cls.push("current");
      else cls.push("locked");
      html += `<button class="${cls.join(" ")}" ${current ? `data-stage="${n}"` : "disabled"}>
        ${isBoss(n) ? '<span class="stage-boss-mark"><i class="ti ti-crown"></i></span>' : ""}
        <span class="stage-no">${n}</span>
        <span class="stage-tag">${cleared ? '<span class="stage-check"><i class="ti ti-check"></i></span>'
          : isBoss(n) ? "BOSS" : ""}</span>
      </button>`;
    }
    grid.innerHTML = html;

    const done = state.stage > CONFIG.totalStages;
    document.getElementById("stage-complete").style.display = done ? "block" : "none";
  }

  /* ============================================================
     8. UI: ルーン獲得ポップアップ
     ============================================================ */
  let pendingRune = null;

  function showRuneReward(rune) {
    pendingRune = rune;
    document.getElementById("rune-reward-desc").textContent =
      `ルーン獲得: ${CONFIG.statLabel[rune.stat]} +${rune.pct}%`;
    document.getElementById("rune-reward-slots").innerHTML = renderRuneSlots(state.runes, true);
    openOverlay("rune-overlay");
  }

  function equipPendingRune(slotIndex) {
    if (!pendingRune) return;
    state.runes[slotIndex] = pendingRune;
    pendingRune = null;
    saveState();
    closeOverlay("rune-overlay");
    renderCharacter();
    renderStages();
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
      <!-- 経験値ポップアップ -->
      <div class="game-overlay" id="xp-overlay">
        <div class="game-modal xp-modal">
          <button class="game-close" data-close="xp-overlay"><i class="ti ti-x"></i></button>
          <div class="xp-icon"><i class="ti ti-star"></i></div>
          <div class="xp-gain" id="xp-gain"></div>
          <div class="xp-levelup" id="xp-levelup"></div>
          <div class="xp-lv-row"><span>アカウントレベル</span><span class="xp-lv-badge" id="xp-lv-badge">Lv. 1</span></div>
          <div class="xp-bar-track"><div class="xp-bar-fill" id="xp-bar-fill"></div></div>
          <div class="xp-bar-val" id="xp-bar-val"></div>
          <div style="margin-top:20px;"><button class="game-btn" data-close="xp-overlay">とじる</button></div>
        </div>
      </div>

      <!-- キャラクター画面 -->
      <div class="game-overlay" id="char-overlay">
        <div class="game-modal">
          <button class="game-close" data-close="char-overlay"><i class="ti ti-x"></i></button>
          <div class="char-name-row">
            <div class="char-avatar" id="char-avatar">冒</div>
            <input type="text" class="char-name-input" id="char-name-input" maxlength="16" placeholder="キャラ名">
            <span class="char-lv-tag" id="char-lv-tag">Lv. 1</span>
          </div>
          <div class="section-label">ステータス</div>
          <div class="stat-grid" id="char-stat-grid"></div>
          <div class="section-label">ルーン（装備）</div>
          <div class="rune-grid" id="char-rune-grid"></div>
          <div class="game-sub" id="char-stage-info"></div>
          <div style="margin-top:8px;"><button class="game-btn" id="go-adventure-btn"><i class="ti ti-map-2"></i> 旅に出る</button></div>
        </div>
      </div>

      <!-- ステージ画面 -->
      <div class="game-overlay" id="stage-overlay">
        <div class="game-modal wide">
          <button class="game-close" data-close="stage-overlay"><i class="ti ti-x"></i></button>
          <div class="stage-grid" id="stage-grid"></div>
          <div class="stage-complete" id="stage-complete" style="display:none;">🎉 全10ステージを制覇しました！</div>
          <div style="margin-top:8px;"><button class="game-btn ghost" id="stage-back-btn">戻る</button></div>
        </div>
      </div>

      <!-- ルーン獲得 -->
      <div class="game-overlay" id="rune-overlay">
        <div class="game-modal rune-reward">
          <div class="rune-reward-icon"><i class="ti ti-diamond"></i></div>
          <div class="rune-reward-desc" id="rune-reward-desc"></div>
          <div class="rune-reward-sub">装備する枠を選んでください（埋まっている枠は上書き）</div>
          <div class="rune-reward-slots" id="rune-reward-slots"></div>
          <div class="rune-reward-actions">
            <button class="game-btn ghost" id="rune-discard-btn">受け取らない</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
  }

  /* ============================================================
     9. INIT — DOM参照・イベント結線
     ============================================================ */
  function init() {
    buildModals();

    // 参照をまとめる
    el.progWrap   = document.getElementById("hdr-progress");
    el.progFill   = document.getElementById("hdr-progress-fill");
    el.progLabel  = document.getElementById("hdr-progress-label");
    el.charBtn    = document.getElementById("character-btn");
    el.charBtnLv  = document.getElementById("char-btn-lv");
    el.charBtnName= document.getElementById("char-btn-name");

    // API紹介ページ(iframe)内のクリックを検知して進捗を進める（+20%、100%で経験値付与）
    const preview = document.getElementById("preview");
    if (preview) attachIframeClickTracking(preview);

    // ハッシュ付きURLでのリロード等、game.js の初期化前に app.js が
    // 既にページを選択済み（"apipage:shown" を発火済み）のケースを補う。
    // イベントの取りこぼしに頼らず、DOMの現在状態から直接判定する。
    if (preview && !preview.classList.contains("hidden")) showProgressBar(true);

    // サイドバーのキャラボタン → キャラクター画面
    if (el.charBtn) el.charBtn.addEventListener("click", () => {
      renderCharacter();
      openOverlay("char-overlay");
    });

    // キャラ名編集（即保存・アバター更新）
    const nameInput = document.getElementById("char-name-input");
    nameInput.addEventListener("input", () => {
      state.charName = nameInput.value.trim() || "冒険者";
      saveState();
      document.getElementById("char-avatar").textContent = state.charName.charAt(0);
      renderCharacterButton();
    });

    // 旅に出る → ステージ画面
    document.getElementById("go-adventure-btn").addEventListener("click", () => {
      closeOverlay("char-overlay");
      renderStages();
      openOverlay("stage-overlay");
    });
    document.getElementById("stage-back-btn").addEventListener("click", () => {
      closeOverlay("stage-overlay");
      renderCharacter();
      openOverlay("char-overlay");
    });

    //　ステージクリックで対応するゲームをゲーム用iframeに読み込む。ハッシュ更新で履歴に残す。
    // ゲーム用iframeはステージ画面の上に重ねて表示する。ゲーム終了後はステージ画面に戻る。
    //ゲームは 現在は固定でburroku.html を読み込む。
    function renderGame(stageNum) {
      // ゲームプレビュー用のオーバーレイと iframe を遅延生成（再利用可能）
      let ov = document.getElementById("game-preview-overlay");
      if (!ov) {
        ov = document.createElement("div");
        ov.id = "game-preview-overlay";
        ov.className = "game-overlay";
        ov.innerHTML = `
          <div class="game-preview-shell" style="position:fixed;inset:0;display:flex;align-items:stretch;justify-content:center;">
            <button class="game-close" data-close="game-preview-overlay" style="position:absolute;top:12px;right:12px;z-index:1010"><i class="ti ti-x"></i></button>
            <iframe id="game-preview-iframe" style="flex:1;width:100%;height:100%;border:0;background:#fff;" title="Game Preview"></iframe>
          </div>`;
        document.body.appendChild(ov);

        // 閉じる操作をフックしてゲーム終了処理（ステージクリア）を行う
        let handledClose = false;
        const iframe = () => document.getElementById("game-preview-iframe");
        function handleGameClosed() {
          if (handledClose) return; handledClose = true;
          const ifr = iframe(); if (ifr) ifr.src = "";
          const rune = clearCurrentStage();
          renderStages();
          renderCharacterButton();
          if (rune) showRuneReward(rune);
        }

        // iframe 側から postMessage で終了通知できるよう対応
        window.addEventListener("message", (ev) => {
          try {
            if (ev && ev.data && ev.data.type === "game:ended") {
              ov.classList.remove("open");
              handleGameClosed();
            }
          } catch (e) { /* ignore */ }
        });
      }

      // iframe にステージに対応するゲームを読み込む（現状は固定）
      const ifr = document.getElementById("game-preview-iframe");
      if (ifr) ifr.src = "../GAME/burroku.html";
      ov.classList.add("open");

      // ハッシュに残して履歴に残す（戻る操作で閉じることを想定）ことはせずゲームクリアかゲームオーバーで戻す
      // try { location.hash = `#game-${stageNum}`; } catch (e) { /* ignore */ }
    }

    // ステージのセルクリック
    document.getElementById("stage-grid").addEventListener("click", (e) => {
      const cell = e.target.closest("[data-stage]");
      if (!cell) return;
      renderGame(cell.dataset.stage);
    
      // const rune = clearCurrentStage();
      // renderStages();
      // renderCharacterButton();
      // if (rune) showRuneReward(rune);
    });

    // ルーン獲得: 枠クリックで装備 / 受け取らない
    document.getElementById("rune-reward-slots").addEventListener("click", (e) => {
      const slot = e.target.closest("[data-slot]");
      if (!slot) return;
      equipPendingRune(Number(slot.dataset.slot));
    });
    document.getElementById("rune-discard-btn").addEventListener("click", () => {
      pendingRune = null;
      closeOverlay("rune-overlay");
    });

    // 汎用: data-close / 背景クリック / Esc で閉じる
    document.querySelectorAll(".game-overlay").forEach(ov => {
      ov.addEventListener("click", (e) => {
        if (e.target === ov || e.target.closest("[data-close]")) ov.classList.remove("open");
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") document.querySelectorAll(".game-overlay.open").forEach(o => o.classList.remove("open"));
    });

    // API紹介ページ表示中だけ進捗バーを出す（app.js からの通知）
    document.addEventListener("apipage:shown", () => showProgressBar(true));

    // 初期描画
    renderProgress();
    renderCharacterButton();
  }

  init();
})();
