/* ============================================================
   fronted-v2 / app.js
   サイト全体の動作を担うスクリプト。
     - CATALOG(catalog.js) からサイドバーをカテゴリ別に描画
     - 検索ボックスによる絞り込み
     - 一覧クリックで iframe にテンプレートを表示しヘッダーを更新
     - URLハッシュ連携（共有・リロードで選択を復元）
     - 表示テーマの切替と localStorage 保存
     - narrow 幅でのサイドバー開閉

   依存: window.CATALOG（catalog.js で定義）
   ============================================================ */

(function () {
  "use strict";

  /* ---- よく使う DOM 参照 ---- */
  const navList     = document.getElementById("nav-list");
  const searchInput = document.getElementById("search");
  const preview     = document.getElementById("preview");
  const welcome     = document.getElementById("welcome");
  const appWindow   = document.querySelector(".app-window");
  const mobileMQ    = window.matchMedia("(max-width: 760px)");

  const TEMPLATE_DIR = "../templates/";        // iframe が読む相対パス
  const THEME_KEY    = "fronted-v2-theme";     // localStorage キー（テーマ）
  const ACCENT_KEY   = "fronted-v2-accent";    // localStorage キー（アクセント色）
  let   currentId    = null;                   // 現在選択中テンプレートの id
  const openCats     = new Set();              // 開いているカテゴリ名（既定は全て閉じる）

  /* ============================================================
     一覧描画 — CATALOG を category 単位の折りたたみグループとして出力。
       - 既定は全カテゴリ閉じた状態。見出しクリックで開閉。
       - keyword 指定時は title / apiName / description で部分一致フィルタし、
         検索中はヒットを見せるため該当グループを自動展開する。
     ============================================================ */
  function renderList(keyword) {
    const kw = (keyword || "").trim().toLowerCase();
    const items = kw
      ? CATALOG.filter(t =>
          (t.title + " " + t.apiName + " " + t.description).toLowerCase().includes(kw))
      : CATALOG;

    navList.innerHTML = "";
    if (items.length === 0) {
      navList.innerHTML = '<div class="nav-empty">該当する API がありません</div>';
      return;
    }

    // category 単位にグルーピング（CATALOG の並び順を尊重）
    const groups = [];                         // [{ category, items: [] }]
    const index  = new Map();                  // category -> groups内の位置
    items.forEach(t => {
      if (!index.has(t.category)) { index.set(t.category, groups.length); groups.push({ category: t.category, items: [] }); }
      groups[index.get(t.category)].items.push(t);
    });

    groups.forEach(g => {
      // 検索中(kw あり)は展開、通常時は openCats の状態に従う
      const isOpen = kw ? true : openCats.has(g.category);

      const group = document.createElement("div");
      group.className = "nav-group" + (isOpen ? "" : " closed");
      group.dataset.category = g.category;

      // 見出し（クリックで開閉）。表示名は末尾の「系」を省く + 開閉キャレット
      const head = document.createElement("div");
      head.className = "nav-group-head";
      head.innerHTML =
        `<i class="ti ti-chevron-down nav-group-caret"></i>` +
        `<span class="nav-group-title">${g.category.replace(/系$/, "")}</span>`;
      head.addEventListener("click", () => toggleGroup(g.category, group));
      group.appendChild(head);

      // 本体（テンプレート項目）
      const body = document.createElement("div");
      body.className = "nav-group-body";
      g.items.forEach(t => {
        const item = document.createElement("div");
        item.className = "nav-item" + (t.id === currentId ? " active" : "");
        item.dataset.id = t.id;
        item.innerHTML = `<i class="ti ${t.icon}"></i><span>${t.title}</span>`;
        item.addEventListener("click", () => select(t.id, true));
        body.appendChild(item);
      });
      group.appendChild(body);

      navList.appendChild(group);
    });
  }

  // カテゴリの開閉をトグル（openCats に状態を保持し、DOM の closed を切替）
  function toggleGroup(category, groupEl) {
    if (openCats.has(category)) { openCats.delete(category); groupEl.classList.add("closed"); }
    else { openCats.add(category); groupEl.classList.remove("closed"); }
  }

  // 指定 id を含むカテゴリを開く（選択時に項目が隠れないようにする）
  function expandCategoryOf(id) {
    const t = CATALOG.find(x => x.id === id);
    if (!t) return;
    openCats.add(t.category);
    const g = navList.querySelector(`.nav-group[data-category="${t.category}"]`);
    if (g) g.classList.remove("closed");
  }

  /* ============================================================
     選択 — 指定 id のテンプレートを iframe に表示しヘッダーを更新。
     updateHash=true のときは location.hash も書き換える（共有用）。
     ============================================================ */
  function select(id, updateHash) {
    const t = CATALOG.find(x => x.id === id);
    if (!t) return;
    currentId = id;

    // iframe にテンプレートを読み込み、ウェルカムを隠す
    preview.src = TEMPLATE_DIR + t.file;
    preview.classList.remove("hidden");
    welcome.classList.add("hidden");

    // 選択項目を含むカテゴリを開いてからハイライトを付け替え
    expandCategoryOf(id);
    navList.querySelectorAll(".nav-item").forEach(el =>
      el.classList.toggle("active", el.dataset.id === id));

    if (updateHash) location.hash = id;
    // narrow 幅のときだけ、選択後にドロワーを閉じる（デスクトップは開いたまま）
    if (mobileMQ.matches) setSidebarCollapsed(true);
  }

  /* ============================================================
     表示設定 — テーマ(背景) と アクセント色 を独立して切替。
       - テーマ(data-theme): light / dark … 背景・文字
       - アクセント(data-accent): orange / blue … アクセント色のみ
     どちらも localStorage に保存。setTheme / setAccent / toggleThemeMenu
     はインライン onclick から呼ぶため window に公開する。
     ============================================================ */
  let themeLabel  = "ライト";   // トリガのラベル表示用（現在のテーマ名）
  let accentLabel = "オレンジ"; // 同上（現在のアクセント名）

  // トリガのラベルを「テーマ名 / アクセント名」で更新
  function updateSettingLabel() {
    const lbl = document.getElementById("theme-label");
    if (lbl) lbl.textContent = themeLabel + " / " + accentLabel;
  }

  function applyTheme(name, label) {
    document.documentElement.setAttribute("data-theme", name);
    themeLabel = label;
    updateSettingLabel();
    // アクティブ表示はテーマ選択肢グループ内だけで付け替える
    document.querySelectorAll("#theme-dropdown-float [data-theme-name]").forEach(i =>
      i.classList.toggle("active", i.dataset.themeName === name));
  }

  function applyAccent(name, label) {
    document.documentElement.setAttribute("data-accent", name);
    accentLabel = label;
    updateSettingLabel();
    // アクティブ表示はアクセント選択肢グループ内だけで付け替える
    document.querySelectorAll("#theme-dropdown-float [data-accent-name]").forEach(i =>
      i.classList.toggle("active", i.dataset.accentName === name));
  }

  // 選択してもメニューは閉じない（テーマとアクセントを続けて選べるように）
  window.setTheme = function (name, label) {
    applyTheme(name, label);
    localStorage.setItem(THEME_KEY, name);
  };
  window.setAccent = function (name, label) {
    applyAccent(name, label);
    localStorage.setItem(ACCENT_KEY, name);
  };

  // 表示設定メニューをトリガ直上にポップアップ表示
  window.toggleThemeMenu = function (event) {
    event.stopPropagation();
    const dd = document.getElementById("theme-dropdown-float");
    if (dd.style.display === "block") { dd.style.display = "none"; return; }
    const rect = event.currentTarget.getBoundingClientRect();
    // display:block 後は offsetWidth を同期的に取得できるので rAF は使わない
    // （非アクティブタブでは rAF が発火せず位置がずれるため）
    dd.style.display = "block";
    // ヘッダー右のボタン直下・右揃えで表示。左端が画面外に出ないよう調整
    let left = rect.right + window.scrollX - dd.offsetWidth;
    if (left < 8) left = 8;
    dd.style.left = left + "px";
    dd.style.top  = (rect.bottom + window.scrollY + 6) + "px";
  };

  // 起動時：保存済みのテーマ・アクセントを復元（ラベルは項目の文言から引く）
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      const el = document.querySelector(`#theme-dropdown-float [data-theme-name="${savedTheme}"]`);
      if (el) applyTheme(savedTheme, el.textContent.trim());
    }
    const savedAccent = localStorage.getItem(ACCENT_KEY);
    if (savedAccent) {
      const el = document.querySelector(`#theme-dropdown-float [data-accent-name="${savedAccent}"]`);
      if (el) applyAccent(savedAccent, el.textContent.trim());
    }
  }

  /* ============================================================
     サイドバー表示切替 — .app-window に .sidebar-collapsed を付与。
       デスクトップ: サイドバーを隠す/表示（メインが全幅に）
       narrow 幅  : オーバーレイのドロワーを開閉
     ============================================================ */
  function setSidebarCollapsed(collapsed) {
    appWindow.classList.toggle("sidebar-collapsed", collapsed);
  }
  // ヘッダーのボタン・スクリムから呼ぶため公開（引数なしでトグル）
  window.toggleSidebar = function () {
    appWindow.classList.toggle("sidebar-collapsed");
  };
  window.closeSidebar = function () { setSidebarCollapsed(true); };

  /* ============================================================
     初期化
     ============================================================ */
  function init() {
    // ウェルカムの件数表示
    const countEl = document.getElementById("welcome-count");
    if (countEl) countEl.textContent = CATALOG.length;

    initTheme();
    renderList("");

    // narrow 幅では初期状態でサイドバー（ドロワー）を閉じておく
    if (mobileMQ.matches) setSidebarCollapsed(true);

    // 検索入力で再描画
    searchInput.addEventListener("input", e => renderList(e.target.value));

    // メニュー外クリックでのみ閉じる（パネル内のテーマ/アクセント選択では閉じない）
    document.addEventListener("click", (e) => {
      if (e.target.closest("#theme-dropdown-float")) return;
      document.getElementById("theme-dropdown-float").style.display = "none";
    });

    // URLハッシュに id があれば復元、なければウェルカムのまま
    const hashId = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (hashId && CATALOG.some(t => t.id === hashId)) select(hashId, false);

    // ブラウザの戻る/進むでハッシュが変わったら追従
    window.addEventListener("hashchange", () => {
      const id = decodeURIComponent(location.hash.replace(/^#/, ""));
      if (id && id !== currentId && CATALOG.some(t => t.id === id)) select(id, false);
    });
  }

  init();
})();
