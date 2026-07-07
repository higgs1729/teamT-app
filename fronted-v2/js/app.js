/* ============================================================
   fronted-v2 / app.js
   サイト全体の動作を担うスクリプト。
     - CATALOG(catalog.js) からサイドバーをカテゴリ階層別に描画
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
  const openCats     = new Set();              // 開いているカテゴリ階層キー（既定は全て閉じる）

  /* ============================================================
     一覧描画 — CATALOG を categoryPath に沿った2階層グループとして出力。
       - 既定は全カテゴリ閉じた状態。見出しクリックで開閉。
       - keyword 指定時は title / apiName / description / categoryPath で部分一致フィルタし、
         検索中はヒットを見せるため該当グループを自動展開する。
     ============================================================ */
  function getCategoryPath(item) {
    if (Array.isArray(item.categoryPath) && item.categoryPath.length) return item.categoryPath;
    return [item.category || "その他"];
  }

  function getCategoryKey(path) {
    return path.join(" > ");
  }

  function getCategoryLabel(name) {
    return String(name).replace(/系$/, "");
  }

  function renderList(keyword) {
    const kw = (keyword || "").trim().toLowerCase();
    const items = kw
      ? CATALOG.filter(t =>
          (t.title + " " + t.apiName + " " + t.description + " " + getCategoryPath(t).join(" ")).toLowerCase().includes(kw))
      : CATALOG;

    navList.innerHTML = "";
    if (items.length === 0) {
      navList.innerHTML = '<div class="nav-empty">該当する API がありません</div>';
      return;
    }

    // categoryPath 単位にグルーピング（CATALOG の並び順を尊重）
    const groups = [];                         // [{ category, key, children: [{ category, key, items: [] }] }]
    const index  = new Map();                  // 親カテゴリkey -> groups内の位置
    items.forEach(t => {
      const path = getCategoryPath(t);
      const parentName = path[0] || "その他";
      const childName = path[1] || "その他";
      const parentKey = getCategoryKey([parentName]);
      const childKey = getCategoryKey([parentName, childName]);

      if (!index.has(parentKey)) {
        index.set(parentKey, groups.length);
        groups.push({ category: parentName, key: parentKey, children: [], childIndex: new Map() });
      }

      const parent = groups[index.get(parentKey)];
      if (!parent.childIndex.has(childKey)) {
        parent.childIndex.set(childKey, parent.children.length);
        parent.children.push({ category: childName, key: childKey, items: [] });
      }
      parent.children[parent.childIndex.get(childKey)].items.push(t);
    });

    groups.forEach(g => {
      // 検索中(kw あり)は展開、通常時は openCats の状態に従う
      const isOpen = kw ? true : openCats.has(g.key);

      const group = document.createElement("div");
      group.className = "nav-group" + (isOpen ? "" : " closed");
      group.dataset.categoryKey = g.key;

      // 見出し（クリックで開閉）。表示名は末尾の「系」を省く + 開閉キャレット
      const head = document.createElement("div");
      head.className = "nav-group-head";
      head.innerHTML =
        `<i class="ti ti-chevron-down nav-group-caret"></i>` +
        `<span class="nav-group-title">${getCategoryLabel(g.category)}</span>`;
      head.addEventListener("click", () => toggleGroup(g.key, group));
      group.appendChild(head);

      // 本体（小分類 + テンプレート項目）
      const body = document.createElement("div");
      body.className = "nav-group-body";
      g.children.forEach(child => {
        const childOpen = kw ? true : openCats.has(child.key);
        const subgroup = document.createElement("div");
        subgroup.className = "nav-subgroup" + (childOpen ? "" : " closed");
        subgroup.dataset.categoryKey = child.key;

        const subhead = document.createElement("div");
        subhead.className = "nav-subgroup-head";
        subhead.innerHTML =
          `<i class="ti ti-chevron-down nav-subgroup-caret"></i>` +
          `<span class="nav-subgroup-title">${getCategoryLabel(child.category)}</span>` +
          `<span class="nav-subgroup-count">${child.items.length}</span>`;
        subhead.addEventListener("click", (event) => {
          event.stopPropagation();
          toggleGroup(child.key, subgroup);
        });
        subgroup.appendChild(subhead);

        const subbody = document.createElement("div");
        subbody.className = "nav-subgroup-body";
        child.items.forEach(t => {
          const item = document.createElement("div");
          item.className = "nav-item" + (t.id === currentId ? " active" : "");
          item.dataset.id = t.id;
          item.innerHTML = `<i class="ti ${t.icon}"></i><span>${t.title}</span>`;
          item.addEventListener("click", () => select(t.id, true));
          subbody.appendChild(item);
        });
        subgroup.appendChild(subbody);
        body.appendChild(subgroup);
      });
      group.appendChild(body);

      navList.appendChild(group);
    });
  }

  // カテゴリ階層の開閉をトグル（openCats に状態を保持し、DOM の closed を切替）
  function toggleGroup(categoryKey, groupEl) {
    if (openCats.has(categoryKey)) { openCats.delete(categoryKey); groupEl.classList.add("closed"); }
    else { openCats.add(categoryKey); groupEl.classList.remove("closed"); }
  }

  // 指定 id を含むカテゴリを開く（選択時に項目が隠れないようにする）
  function expandCategoryOf(id) {
    const t = CATALOG.find(x => x.id === id);
    if (!t) return;
    const path = getCategoryPath(t);
    const parentKey = getCategoryKey([path[0]]);
    const childKey = getCategoryKey([path[0], path[1] || "その他"]);
    openCats.add(parentKey);
    openCats.add(childKey);
    navList.querySelectorAll(".nav-group, .nav-subgroup").forEach(el => {
      if (el.dataset.categoryKey === parentKey || el.dataset.categoryKey === childKey) {
        el.classList.remove("closed");
      }
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

    // ゲーム(game.js)へ「API紹介ページを表示した」通知（疎結合フック）
    document.dispatchEvent(new CustomEvent("apipage:shown", { detail: { id } }));

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
  function applyTheme(name) {
    document.documentElement.setAttribute("data-theme", name);
    document.querySelectorAll("[data-theme-name]").forEach(i =>
      i.classList.toggle("active", i.dataset.themeName === name));
  }

  function applyAccent(name) {
    document.documentElement.setAttribute("data-accent", name);
    document.querySelectorAll("[data-accent-name]").forEach(i =>
      i.classList.toggle("active", i.dataset.accentName === name));
  }

  // 選択してもモーダルは閉じない（テーマとアクセントを続けて選べる）
  window.setTheme  = function (name) { applyTheme(name);  localStorage.setItem(THEME_KEY, name); };
  window.setAccent = function (name) { applyAccent(name); localStorage.setItem(ACCENT_KEY, name); };

  // 起動時：保存済みのテーマ・アクセントを復元
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) applyTheme(savedTheme);
    const savedAccent = localStorage.getItem(ACCENT_KEY);
    if (savedAccent) applyAccent(savedAccent);
  }

  /* ============================================================
     アカウント — サーバー認証は無く、表示名を localStorage に保持するだけ
     ============================================================ */
  const ACCOUNT_KEY   = "fronted-v2-account-name";
  const EMAIL_KEY     = "fronted-v2-account-email";
  const LOGIN_KEY     = "fronted-v2-logged-in";
  const DEFAULT_NAME  = "ゲスト";
  // fronted-v2(5500)とSpring Boot(8080)は別オリジンのため相対パスでは繋がらない。
  // 認証は将来的に外部のSSOサーバーへ切り出す予定。今はこのURLを差し替えるだけで移行できるようにしておく
  const AUTH_LOGIN_URL = "http://localhost:8080/auth/login";

  function isLoggedIn() { return localStorage.getItem(LOGIN_KEY) === "1"; }

  function setAccountName(name) {
    const n = (name && name.trim()) || DEFAULT_NAME;
    const initial = n.charAt(0).toUpperCase();
    document.getElementById("account-avatar").textContent = initial;
    document.getElementById("account-avatar-lg").textContent = initial;
    document.getElementById("account-head-name").textContent = n;
  }

  // サイドバー下部のボタン表示・設定パネルのログイン/ログアウト導線を切り替える
  function applyLoginState() {
    const loggedIn = isLoggedIn();
    const name = localStorage.getItem(ACCOUNT_KEY) || DEFAULT_NAME;
    document.getElementById("account-name").textContent = loggedIn ? name : DEFAULT_NAME;
    document.getElementById("login-hint").style.display = loggedIn ? "none" : "flex";
    document.getElementById("account-login-btn").style.display = loggedIn ? "none" : "flex";
    document.getElementById("account-logout-btn").style.display = loggedIn ? "flex" : "none";
    document.getElementById("account-head-sub").textContent = loggedIn
      ? (localStorage.getItem(EMAIL_KEY) || "")
      : "ログインするとアカウント機能が使えます";
  }

  window.goToLogin = function () { window.location.href = AUTH_LOGIN_URL; };

  window.logout = function () {
    localStorage.removeItem(LOGIN_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setAccountName(DEFAULT_NAME);
    applyLoginState();
  };

  // サイドバーのアカウントボタン: ログイン状態に関わらず設定のアカウントパネルを開く
  // （ログイン画面への遷移は設定内の「ログイン」項目から行う）
  window.handleAccountClick = function () {
    openSettings("account");
  };

  // ログイン画面からの戻り（?login=表示名&email=メールアドレス）を検知し、ログイン済み状態として保存する
  function consumeLoginCallback() {
    const params = new URLSearchParams(location.search);
    const loginName = params.get("login");
    if (!loginName) return;
    localStorage.setItem(LOGIN_KEY, "1");
    localStorage.setItem(ACCOUNT_KEY, loginName);
    const email = params.get("email");
    if (email) localStorage.setItem(EMAIL_KEY, email);
    params.delete("login");
    params.delete("email");
    const rest = params.toString();
    history.replaceState(null, "", location.pathname + (rest ? "?" + rest : "") + location.hash);
  }

  function initAccount() {
    consumeLoginCallback();
    const saved = localStorage.getItem(ACCOUNT_KEY) || DEFAULT_NAME;
    setAccountName(saved);
    applyLoginState();
  }

  /* ============================================================
     設定モーダル — 開閉・パネル切替・ナビ検索・リセット
     ============================================================ */
  function switchPanel(panel) {
    document.querySelectorAll(".settings-nav-item").forEach(i =>
      i.classList.toggle("active", i.dataset.panel === panel));
    document.querySelectorAll(".settings-panel").forEach(p =>
      p.classList.toggle("active", p.dataset.panel === panel));
  }
  window.switchSettingsPanel = switchPanel;

  window.openSettings = function (panel) {
    if (panel) switchPanel(panel);
    document.getElementById("settings-overlay").classList.add("open");
  };
  window.closeSettings = function () {
    document.getElementById("settings-overlay").classList.remove("open");
  };

  // ナビ検索: ラベル部分一致で項目を絞り込み
  function initSettingsSearch() {
    const input = document.getElementById("settings-search-input");
    const empty = document.getElementById("settings-nav-empty");
    input.addEventListener("input", () => {
      const kw = input.value.trim().toLowerCase();
      let shown = 0;
      document.querySelectorAll(".settings-nav-item").forEach(item => {
        const hit = item.textContent.toLowerCase().includes(kw);
        item.style.display = hit ? "" : "none";
        if (hit) shown++;
      });
      empty.style.display = shown === 0 ? "block" : "none";
    });
  }

  // 保存内容（テーマ/アクセント/表示名）を消して既定に戻す
  window.resetSettings = function () {
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem(ACCENT_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    localStorage.removeItem(LOGIN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    applyTheme("light");
    applyAccent("orange");
    setAccountName(DEFAULT_NAME);
    applyLoginState();
  };

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
    initAccount();
    initSettingsSearch();
    const apiCount = document.getElementById("settings-api-count");
    if (apiCount) apiCount.textContent = CATALOG.length;
    renderList("");

    // narrow 幅では初期状態でサイドバー（ドロワー）を閉じておく
    if (mobileMQ.matches) setSidebarCollapsed(true);

    // 検索入力で再描画
    searchInput.addEventListener("input", e => renderList(e.target.value));

    // Esc キーで設定モーダルを閉じる
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSettings();
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
