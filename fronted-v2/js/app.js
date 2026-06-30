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
  const pageTitle   = document.getElementById("page-title");
  const pageSub     = document.getElementById("page-sub");
  const liveChip    = document.getElementById("live-chip");
  const sidebar     = document.getElementById("sidebar");
  const sidebarScrim= document.getElementById("sidebar-scrim");

  const TEMPLATE_DIR = "../templates/";        // iframe が読む相対パス
  const THEME_KEY    = "fronted-v2-theme";     // localStorage キー
  let   currentId    = null;                   // 現在選択中テンプレートの id

  /* ============================================================
     一覧描画 — CATALOG を category 順にグルーピングして nav に出力。
     keyword 指定時は title / apiName / description で部分一致フィルタ。
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

    // カテゴリ見出し → 配下の項目、の順で描画（CATALOG の並び順を尊重）
    let lastCategory = null;
    items.forEach(t => {
      if (t.category !== lastCategory) {
        const label = document.createElement("div");
        label.className = "nav-label";
        label.textContent = t.category;
        navList.appendChild(label);
        lastCategory = t.category;
      }
      const item = document.createElement("div");
      item.className = "nav-item" + (t.id === currentId ? " active" : "");
      item.dataset.id = t.id;
      item.innerHTML = `<i class="ti ${t.icon}"></i><span>${t.title}</span>`;
      item.addEventListener("click", () => select(t.id, true));
      navList.appendChild(item);
    });
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

    // ヘッダー更新
    pageTitle.textContent = t.title;
    pageSub.textContent   = t.description + "（" + t.apiName + "）";
    liveChip.style.display = "inline-flex";

    // サイドバーの選択ハイライトを付け替え
    navList.querySelectorAll(".nav-item").forEach(el =>
      el.classList.toggle("active", el.dataset.id === id));

    if (updateHash) location.hash = id;
    // narrow 幅ではドロワーを閉じる
    toggleSidebar(false);
  }

  /* ============================================================
     テーマ — data-theme 切替 + localStorage 保存。
     setTheme / toggleThemeMenu はインライン onclick から呼ぶため
     window に公開する。
     ============================================================ */
  function applyTheme(name, label) {
    document.documentElement.setAttribute("data-theme", name);
    const lbl = document.getElementById("theme-label");
    if (lbl) lbl.textContent = "表示テーマ: " + label;
    document.querySelectorAll("#theme-dropdown-float .theme-item").forEach(i =>
      i.classList.toggle("active", i.dataset.themeName === name));
  }

  window.setTheme = function (name, label) {
    applyTheme(name, label);
    localStorage.setItem(THEME_KEY, name);
    document.getElementById("theme-dropdown-float").style.display = "none";
  };

  // テーマメニューをトリガ直上にポップアップ表示
  window.toggleThemeMenu = function (event) {
    event.stopPropagation();
    const dd = document.getElementById("theme-dropdown-float");
    if (dd.style.display === "block") { dd.style.display = "none"; return; }
    const rect = event.currentTarget.getBoundingClientRect();
    dd.style.display = "block";
    requestAnimationFrame(() => {
      dd.style.left = (rect.left + window.scrollX) + "px";
      dd.style.top  = (rect.top + window.scrollY - dd.offsetHeight - 6) + "px";
    });
  };

  // 起動時：保存済みテーマを復元（ラベルは theme-item の文言から引く）
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (!saved) return;
    const el = document.querySelector(`#theme-dropdown-float .theme-item[data-theme-name="${saved}"]`);
    const label = el ? el.textContent.trim().replace("（既定）", "") : saved;
    applyTheme(saved, label);
  }

  /* ============================================================
     サイドバー開閉（narrow 幅のドロワー） — onclick から呼ぶため公開
     ============================================================ */
  window.toggleSidebar = function (open) {
    sidebar.classList.toggle("open", open);
    sidebarScrim.classList.toggle("open", open);
  };

  /* ============================================================
     初期化
     ============================================================ */
  function init() {
    // ウェルカムの件数表示
    const countEl = document.getElementById("welcome-count");
    if (countEl) countEl.textContent = CATALOG.length;

    initTheme();
    renderList("");

    // 検索入力で再描画
    searchInput.addEventListener("input", e => renderList(e.target.value));

    // メニュー外クリックでテーマDDを閉じる
    document.addEventListener("click", () => {
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
