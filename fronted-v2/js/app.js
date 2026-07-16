/* ============================================================
   fronted-v2 / app.js
   サイト全体の動作を担うスクリプト。
     - CATALOG(catalog.js) からサイドバーをカテゴリ階層別に描画
       （マークアップは react-shadcn の Sidebar コンポーネント群
       ＝ SidebarGroup/SidebarMenu/SidebarMenuItem/SidebarMenuButton/
       SidebarMenuSub 相当の ul/li/button 構造で出力する）
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
  const recommendRoot = document.getElementById("recommend-root");
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

     マークアップ構造（SidebarGroup配下）:
       <ul class="sidebar-menu">                       … SidebarMenu
         <li class="sidebar-menu-item" data-category-key>  … SidebarMenuItem（最上位カテゴリ）
           <button class="sidebar-menu-button">…</button>  … SidebarMenuButton（開閉トリガー）
           <ul class="sidebar-menu-sub">                   … SidebarMenuSub
             <li class="sidebar-menu-sub-item" data-category-key> … 小分類
               <button class="sidebar-menu-sub-button sidebar-menu-sub-trigger">…</button>
               <ul class="sidebar-menu-sub sidebar-menu-sub-nested">
                 <li class="sidebar-menu-sub-item">          … 個々のAPI（最内・子なし）
                   <button class="sidebar-menu-sub-button" data-leaf="nav-item" data-id>…</button>
     開閉状態は各 li に付く "closed" クラス、選択状態は leaf button の "active" クラスで表す。
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

  // カテゴリ見出し（最上位カテゴリ）の先頭アイコン。未定義カテゴリは汎用フォルダ
  const CATEGORY_ICONS = {
    "画像・ビジュアル系": "ti-photo",
    "データ・検索系":     "ti-database",
    "為替・ツール系":     "ti-tool",
    "エンタメ・おもしろ系": "ti-mood-smile",
  };
  const CATEGORY_ICON_FALLBACK = "ti-folder";       // 未定義の最上位カテゴリ
  const SUBCATEGORY_ICON       = "ti-folder-open";  // 小分類見出しの先頭アイコン
  function getCategoryIcon(name) { return CATEGORY_ICONS[name] || CATEGORY_ICON_FALLBACK; }

  const RECOMMEND_FILE = "../おすすめ一覧.txt";  // 各メンバーが推薦するテンプレートのファイル名一覧（1行1ファイル名）
  let recommendedItems = [];                    // 起動時に一度読み込み・突き合わせてキャッシュ

  function matchesKeyword(item, keyword) {
    const kw = (keyword || "").trim().toLowerCase();
    if (!kw) return true;
    return (item.title + " " + item.apiName + " " + item.description + " " + getCategoryPath(item).join(" "))
      .toLowerCase()
      .includes(kw);
  }

  /* ============================================================
     おすすめ一覧.txt を読み込み、行末が .html の行だけをファイル名として
     取り出し、CATALOG の file（ディレクトリ抜きの basename・大小無視）と
     突き合わせて表示対象を決める。メンバー名やコメント行はそのまま無視される。
     ============================================================ */
  async function loadRecommendations() {
    try {
      const res = await fetch(RECOMMEND_FILE);
      const text = await res.text();
      const wanted = new Set(
        text.split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => /\.html$/i.test(line))
          .map(line => line.toLowerCase())
      );

      const seen = new Set();
      recommendedItems = CATALOG.filter(item => {
        const basename = item.file.split("/").pop().toLowerCase();
        if (!wanted.has(basename) || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    } catch (err) {
      recommendedItems = [];
    }
    renderRecommendations(searchInput.value);
  }

  /* ============================================================
     おすすめ一覧の描画 — 「おすすめ一覧 ＞」を開くとカテゴリ見出し、
     さらに各カテゴリを開くと個々のHTML(推薦API)が出る折りたたみ構造。
       - トップ(recommendOpen)・各カテゴリ(openRecCats)の開閉状態を保持
       - 見出しは「アイコン 文字 ＞」（＞は右向き固定→開くとdown。回転はさせない）、
         最内アイテムは「アイコン 文字」
       - 検索中(kw)はトップ・カテゴリを自動展開して一致項目を見せる
     ============================================================ */
  let recommendOpen = false;              // 「おすすめ一覧」トップの開閉
  const openRecCats = new Set();          // 開いているおすすめ内カテゴリ名

  function renderRecommendations(keyword) {
    if (!recommendRoot) return;
    const kw = (keyword || "").trim().toLowerCase();
    const items = recommendedItems.filter(item => matchesKeyword(item, kw));

    recommendRoot.innerHTML = "";

    const menu = document.createElement("ul");
    menu.className = "sidebar-menu";

    // トップ「おすすめ一覧」（SidebarMenuItem 相当・開閉可能）。検索中は強制展開
    const topOpen = kw ? true : recommendOpen;
    const topItem = document.createElement("li");
    topItem.className = "sidebar-menu-item" + (topOpen ? "" : " closed");

    const topButton = document.createElement("button");
    topButton.type = "button";
    topButton.className = "sidebar-menu-button recommend-trigger";
    topButton.innerHTML =
      `<i class="ti ti-star sidebar-menu-icon"></i>` +
      `<span class="sidebar-menu-label">おすすめ一覧</span>` +
      `<i class="ti ${topOpen ? "ti-chevron-down" : "ti-chevron-right"} sidebar-menu-chevron"></i>`;
    topButton.addEventListener("click", () => {
      recommendOpen = !recommendOpen;
      topItem.classList.toggle("closed", !recommendOpen);
      setGroupCaretOpen(topItem, recommendOpen);
    });
    topItem.appendChild(topButton);

    const sub = document.createElement("ul");
    sub.className = "sidebar-menu-sub";

    if (items.length === 0) {
      const empty = document.createElement("li");
      empty.innerHTML = '<div class="recommend-empty">一致するおすすめはありません</div>';
      sub.appendChild(empty);
    } else {
      // 最上位カテゴリ(path[0])単位でグルーピング（CATALOG の並び順を尊重）
      const cats = [];
      const idx  = new Map();
      items.forEach(it => {
        const cat = getCategoryPath(it)[0] || "その他";
        if (!idx.has(cat)) { idx.set(cat, cats.length); cats.push({ cat, items: [] }); }
        cats[idx.get(cat)].items.push(it);
      });

      cats.forEach(c => {
        const catOpen = kw ? true : openRecCats.has(c.cat);
        const catItem = document.createElement("li");
        catItem.className = "sidebar-menu-sub-item" + (catOpen ? "" : " closed");

        const catButton = document.createElement("button");
        catButton.type = "button";
        catButton.className = "sidebar-menu-sub-button sidebar-menu-sub-trigger";
        catButton.innerHTML =
          `<i class="ti ${getCategoryIcon(c.cat)} sidebar-menu-sub-icon"></i>` +
          `<span class="sidebar-menu-sub-label">${getCategoryLabel(c.cat)}</span>` +
          `<i class="ti ${catOpen ? "ti-chevron-down" : "ti-chevron-right"} sidebar-menu-chevron"></i>`;
        catButton.addEventListener("click", () => {
          const nowOpen = !openRecCats.has(c.cat);
          if (nowOpen) openRecCats.add(c.cat); else openRecCats.delete(c.cat);
          catItem.classList.toggle("closed", !nowOpen);
          setGroupCaretOpen(catItem, nowOpen);
        });
        catItem.appendChild(catButton);

        const leafList = document.createElement("ul");
        leafList.className = "sidebar-menu-sub sidebar-menu-sub-nested";
        c.items.forEach(it => {
          const leafItem = document.createElement("li");
          leafItem.className = "sidebar-menu-sub-item";

          const leafButton = document.createElement("button");
          leafButton.type = "button";
          leafButton.className = "sidebar-menu-sub-button" + (it.id === currentId ? " active" : "");
          leafButton.dataset.id = it.id;
          leafButton.dataset.leaf = "recommend-item";
          // 最内アイテムは「アイコン 文字」のみ（＞なし）
          leafButton.innerHTML =
            `<i class="ti ${it.icon}"></i>` +
            `<span class="sidebar-menu-sub-label">${it.title}</span>`;
          // おすすめ一覧からの選択では、下の「ジャンルごとに探す」側のカテゴリは開かない
          leafButton.addEventListener("click", () => select(it.id, true, false));
          leafItem.appendChild(leafButton);
          leafList.appendChild(leafItem);
        });
        catItem.appendChild(leafList);
        sub.appendChild(catItem);
      });
    }

    topItem.appendChild(sub);
    menu.appendChild(topItem);
    recommendRoot.appendChild(menu);
  }

  function renderList(keyword) {
    const kw = (keyword || "").trim().toLowerCase();
    const items = kw
      ? CATALOG.filter(t => matchesKeyword(t, kw))
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

    const menu = document.createElement("ul");
    menu.className = "sidebar-menu";

    groups.forEach(g => {
      // 検索中(kw あり)は展開、通常時は openCats の状態に従う
      const isOpen = kw ? true : openCats.has(g.key);

      const item = document.createElement("li");
      item.className = "sidebar-menu-item" + (isOpen ? "" : " closed");
      item.dataset.categoryKey = g.key;

      // 見出し（クリックで開閉）。表示名は末尾の「系」を省く。
      // 最内でない行（カテゴリ）は「文字 ＞」の形式：開いている(=選択中)ときは下矢印に変わる
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sidebar-menu-button";
      button.innerHTML =
        `<i class="ti ${getCategoryIcon(g.category)} sidebar-menu-icon"></i>` +
        `<span class="sidebar-menu-label">${getCategoryLabel(g.category)}</span>` +
        `<i class="ti ${isOpen ? "ti-chevron-down" : "ti-chevron-right"} sidebar-menu-chevron"></i>`;
      button.addEventListener("click", () => toggleGroup(g.key, item));
      item.appendChild(button);

      // 本体（小分類 + テンプレート項目）
      const sub = document.createElement("ul");
      sub.className = "sidebar-menu-sub";
      g.children.forEach(child => {
        const childOpen = kw ? true : openCats.has(child.key);
        const subItem = document.createElement("li");
        subItem.className = "sidebar-menu-sub-item" + (childOpen ? "" : " closed");
        subItem.dataset.categoryKey = child.key;

        const subButton = document.createElement("button");
        subButton.type = "button";
        subButton.className = "sidebar-menu-sub-button sidebar-menu-sub-trigger";
        // 小分類も最内でない行なので「文字 件数 ＞」の形式（開いている(=選択中)ときは下矢印）
        subButton.innerHTML =
          `<i class="ti ${SUBCATEGORY_ICON} sidebar-menu-sub-icon"></i>` +
          `<span class="sidebar-menu-sub-label">${getCategoryLabel(child.category)}</span>` +
          `<span class="sidebar-menu-badge">${child.items.length}</span>` +
          `<i class="ti ${childOpen ? "ti-chevron-down" : "ti-chevron-right"} sidebar-menu-chevron"></i>`;
        subButton.addEventListener("click", (event) => {
          event.stopPropagation();
          toggleGroup(child.key, subItem);
        });
        subItem.appendChild(subButton);

        const leafList = document.createElement("ul");
        leafList.className = "sidebar-menu-sub sidebar-menu-sub-nested";
        child.items.forEach(t => {
          const leafItem = document.createElement("li");
          leafItem.className = "sidebar-menu-sub-item";

          const leafButton = document.createElement("button");
          leafButton.type = "button";
          leafButton.className = "sidebar-menu-sub-button" + (t.id === currentId ? " active" : "");
          leafButton.dataset.id = t.id;
          leafButton.dataset.leaf = "nav-item";
          // 最内アイテム（個々のAPI）は ＞ を付けない（アイコン + 文字のみ）
          leafButton.innerHTML = `<i class="ti ${t.icon}"></i><span class="sidebar-menu-sub-label">${t.title}</span>`;
          leafButton.addEventListener("click", () => select(t.id, true));
          leafItem.appendChild(leafButton);
          leafList.appendChild(leafItem);
        });
        subItem.appendChild(leafList);
        sub.appendChild(subItem);
      });
      item.appendChild(sub);

      menu.appendChild(item);
    });

    navList.appendChild(menu);
  }

  // カテゴリ階層の開閉をトグル（openCats に状態を保持し、DOM の closed を切替）。
  // 開閉に合わせて見出し行末の＞も下矢印/右矢印に切り替える（選択=展開中は下矢印）。
  function toggleGroup(categoryKey, groupEl) {
    const nowOpen = !openCats.has(categoryKey);
    if (nowOpen) openCats.add(categoryKey); else openCats.delete(categoryKey);
    groupEl.classList.toggle("closed", !nowOpen);
    setGroupCaretOpen(groupEl, nowOpen);
  }

  // groupEl（.sidebar-menu-item または .sidebar-menu-sub-item）の直下の見出しにある
  // キャレットだけを切り替える。querySelector だと入れ子の小分類のキャレットまで
  // 拾ってしまうため :scope で直下の見出しに限定する。
  function setGroupCaretOpen(groupEl, open) {
    const caret = groupEl.querySelector(
      ":scope > .sidebar-menu-button .sidebar-menu-chevron, :scope > .sidebar-menu-sub-button .sidebar-menu-chevron"
    );
    if (!caret) return;
    caret.classList.toggle("ti-chevron-right", !open);
    caret.classList.toggle("ti-chevron-down", open);
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
    navList.querySelectorAll("[data-category-key]").forEach(el => {
      if (el.dataset.categoryKey === parentKey || el.dataset.categoryKey === childKey) {
        el.classList.remove("closed");
        setGroupCaretOpen(el, true);
      }
    });
  }

  /* ============================================================
     選択 — 指定 id のテンプレートを iframe に表示しヘッダーを更新。
     updateHash=true のときは location.hash も書き換える（共有用）。
     ============================================================ */
  // expandNav: 下の「ジャンルごとに探す」側で選択項目のカテゴリを自動展開するか。
  // 通常一覧のクリックやハッシュ復元では true のまま、おすすめ一覧からの選択では false を渡す
  // （おすすめから選んだだけで下の一覧まで連動して開くと、意図せず一覧が広がってしまうため）。
  function select(id, updateHash, expandNav = true) {
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
    if (expandNav) expandCategoryOf(id);
    navList.querySelectorAll('[data-leaf="nav-item"]').forEach(el =>
      el.classList.toggle("active", el.dataset.id === id));
    if (recommendRoot) {
      recommendRoot.querySelectorAll('[data-leaf="recommend-item"]').forEach(el =>
        el.classList.toggle("active", el.dataset.id === id));
    }

    if (updateHash) location.hash = id;
    // narrow 幅のときだけ、選択後にドロワーを閉じる（デスクトップは開いたまま）
    if (mobileMQ.matches) setSidebarCollapsed(true);
  }

  /* ============================================================
     表示設定 — テーマ(背景) と アクセント色 を独立して切替。
       - テーマ(data-theme): light / dark … 背景・文字
       - アクセント(data-accent): indigo/violet/cyan/emerald/amber（css/tokens.css の
         [data-accent="..."] 定義。react-shadcn の studio-portfolio/settings-page.tsx
         accents 配列を移植したもの）… アクセント色のみ、既定は indigo
     どちらも localStorage に保存。setTheme / setAccent はインライン onclick から
     呼ぶため window に公開する。
     ============================================================ */
  const ACCENT_IDS    = ["indigo", "violet", "cyan", "emerald", "amber"];
  const DEFAULT_ACCENT = "indigo";

  function applyTheme(name) {
    document.documentElement.setAttribute("data-theme", name);
    document.querySelectorAll("[data-theme-name]").forEach(i =>
      i.classList.toggle("active", i.dataset.themeName === name));
  }

  // 旧バージョン（orange/blue の2択）を保存済みのユーザーがいるため、
  // tokens.css に定義の無いアクセント名は既定(indigo)へフォールバックする
  function applyAccent(name) {
    const resolved = ACCENT_IDS.includes(name) ? name : DEFAULT_ACCENT;
    document.documentElement.setAttribute("data-accent", resolved);
    document.querySelectorAll("[data-accent-name]").forEach(i =>
      i.classList.toggle("active", i.dataset.accentName === resolved));
  }

  // 選択してもモーダルは閉じない（テーマとアクセントを続けて選べる）
  window.setTheme  = function (name) { applyTheme(name);  localStorage.setItem(THEME_KEY, name); };
  window.setAccent = function (name) { applyAccent(name); localStorage.setItem(ACCENT_KEY, name); };

  // 起動時：保存済みのテーマ・アクセントを復元
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) applyTheme(savedTheme);
    applyAccent(localStorage.getItem(ACCENT_KEY));
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
    applyAccent(DEFAULT_ACCENT);
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
    loadRecommendations();
    renderList("");

    // narrow 幅では初期状態でサイドバー（ドロワー）を閉じておく
    if (mobileMQ.matches) setSidebarCollapsed(true);

    // 検索入力で再描画
    searchInput.addEventListener("input", e => {
      renderRecommendations(e.target.value);
      renderList(e.target.value);
    });

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

localStorage.clear();
