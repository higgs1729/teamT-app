# 仕様書 - teamT-app

> このファイルはチーム全員（および各メンバーが使用するAI）が参照する仕様書です。
> アプリ概要が決まり次第、以下の各項目を埋めてください。

---

## 1. アプリ概要

- WebAPI紹介　＋　ゲーム

teamT-app/fronted-v2 の設定モーダルの「外観」パネルを、
C:\Users\253207\Desktop\react-shadcn\components\studio-portfolio\settings-page.tsx の
テーマ設定UIに合わせて作り直してください。vanilla HTML/CSS/JS で実装します。

内容:
1. settings-page.tsx を読み、テーマ（ライト/ダーク）選択と7アクセント選択の UI
   （AccentPreview のようなプレビュー付き選択カード）を vanilla で再現する。
2. アクセント適用は tokens.css に定義済みの [data-accent="<id>"] を <html> に付け替える方式。
   選択は localStorage に保存し、既存の setTheme / setAccent / resetSettings（js/app.js）を
   7アクセント + 新UIに対応するよう改修する（旧 orange/blue の2択チップは廃止）。
3. アカウント/その他パネルも shadcn トーン（settings-section 風の行レイアウト）に整えるが、機能は変更しない。
4. 旧 data-accent="orange|blue" を localStorage に保存済みのユーザーがいるため、
   未知の値は既定アクセントへフォールバックさせる。

制約: game.css は変更しない。CLAUDE.md 規約に従いコメント・docs/specification.md・README.md の
テーマ仕様記述を更新。UI文言は「見れば分かることを書かない」規約に従うこと。
検証:私が行うので不要

## 2. 使用技術

| 区分 | 技術 |
|------|------|
| バックエンド | Java 21 / Spring Boot |
| フロントエンド | HTML / JavaScript |
| ビルドツール | Maven |

---

### WebAPI紹介サイト（fronted-v2）

- WebAPI Gallery : `templates/`内の各WebAPI紹介ページ(自己完結型HTML)を選択して表示するギャラリー画面
  - 構成: サイドバー（ブランド / 検索 / おすすめ一覧 / ジャンルごとのAPI（階層カテゴリ別一覧） / footer（下部にアカウント・設定ボタン））＋ メイン（最小限のヘッダー=サイドバー表示切替ボタンのみ ＋ iframeビューア）
  - シェルの見た目: react-shadcn の `app/dashboard-01`（inset レイアウト）を素の CSS で再現。サイドバー色の下地の上に、メイン領域を角丸・影付きのカードとして浮かせる。ヘッダーは高さ3remでトリガー+縦区切り線+コイン/進捗。サイドバー開閉はデスクトップ=横スライド(offcanvas)、narrow幅=固定ドロワー+スクリム（JSの `.sidebar-collapsed` 契約は従来のまま）
  - ナビツリーのマークアップ: `js/app.js` が描画する「おすすめ一覧」「ジャンルごとのAPI」は react-shadcn の Sidebar コンポーネント群（SidebarGroup/SidebarMenu/SidebarMenuItem/SidebarMenuButton/SidebarMenuSub）相当の `ul.sidebar-menu > li.sidebar-menu-item > button.sidebar-menu-button + ul.sidebar-menu-sub`（さらに子に `li.sidebar-menu-sub-item > button.sidebar-menu-sub-button (+ 入れ子の ul.sidebar-menu-sub.sidebar-menu-sub-nested)`）という3階層の入れ子構造で出力する。開閉は各 `li` の `closed` クラス、選択状態は最内 `button` の `active` クラスで制御（従来どおり）。行末の＞（chevron）は開閉に関わらず常に右向き固定で、開いたときだけ down アイコンに差し替える（CSS回転は使わない、既存仕様のまま）。カテゴリ/小分類の開閉状態を持つ要素は `data-category-key` 属性で、選択中の一覧行は main側 `data-leaf="nav-item"` / おすすめ側 `data-leaf="recommend-item"` 属性で識別する（class名は表示スタイル用、data属性はJSの検索・状態管理用に分離）
  - 設定モーダル: 左ナビ（検索 + アカウント / 外観 / その他）＋ 右コンテンツ。サイドバー下部の「設定」「アカウント」から開く
    - アカウント: 表示名（localStorageに保存、サーバー認証なしのデモ）
    - 外観: テーマ(ライト/ダーク)とアクセント色(indigo/violet/cyan/emerald/amberの5色、既定indigo)を独立して切替（アクセント変更で背景は不変）。デザイントークンは react-shadcn(globals.css / studio-portfolio/settings-page.tsx) から移植し、`css/tokens.css` に `:root` / `[data-theme="dark"]` / `[data-accent="..."]` として定義
      - UIは react-shadcn の `studio-portfolio/settings-page.tsx`（ThemePreview/AccentPreview）相当をvanillaで再現。テーマは背景のミニプレビュー付きカード（`.theme-preview-card`）2枚（ライト/ダーク。同コンポーネントの「システム」選択肢はOS連動の実装が無いため対象外）、アクセントは色ドット付きの選択チップ列（`.accent-chip`）5個＋選択色が反映されるプレビューカード（`.accent-preview-card`。色は `--primary` 経由で自動追従しJS側での個別更新は不要）
      - 旧仕様（`orange`/`blue` の2択チップ）は廃止。旧バージョンで `localStorage` に `orange`/`blue` を保存済みのユーザー向けに、`js/app.js` の `applyAccent` は `css/tokens.css` に定義の無いアクセント名を検知すると既定値(indigo)へフォールバックする（`ACCENT_IDS` 一覧との照合）
    - その他: 収録API数・サイト情報・設定リセット
  - 一覧クリックで該当HTMLをiframe表示。検索・URLハッシュ復元に対応
  - おすすめ一覧: 検索欄の直下に配置。「おすすめ一覧 ＞」（先頭に星アイコン）を開くと最上位カテゴリ見出しが並び、各カテゴリを開くと個々のHTML（推薦API）が出る折りたたみツリー。トップ・各カテゴリとも既定は閉じた状態で、検索中は一致項目を見せるため自動展開する。表示対象は `../おすすめ一覧.txt`（各メンバーが推薦するテンプレートのファイル名を1行ずつ記載）を起動時に読み込み、`.html`で終わる行だけを`CATALOG`の`file`（ディレクトリを除いたbasename・大小無視）と突き合わせて抽出し、最上位カテゴリ(categoryPath[0])単位でまとめる。名前欄やコメント行、一致しないファイル名は無視される。
  - サイドバー項目の行レイアウト: 見出し行（おすすめ一覧トップ・カテゴリ見出し・小分類見出し）は「アイコン／名称／右向き矢印(chevron-right、常に右向き固定・回転しない)」の形式。最上位カテゴリ見出しはカテゴリ別アイコン（画像=photo/データ=database/為替=tool/エンタメ=mood-smile）、小分類見出しは folder-open アイコン + 件数バッジ付き。最内アイテム（各HTML項目）は「アイコン／項目名」のみで＞を付けない。
  - サイドバーのスクロール: ブランド・検索は上部、アカウント等のフッターは下部に固定し、中央の `.sidebar-scroll`（おすすめ一覧＋ジャンル別一覧）だけをまとめて縦スクロールさせる。おすすめ件数が多くても全項目に到達できる。
  - ゲーム要素（`fronted-v2/js/game.js` / `css/game.css`。状態は localStorage 保存、app.jsとは疎結合）
    - コイン制: 体力/攻撃力/防御力・レベル・経験値・ルーン・ステージ画面は撤廃し、コインを消費して `GAME/` 内のミニゲームをプレイする方式（初期5枚・1プレイ1枚消費。数値は game.js の CONFIG に集約）
    - コイン表示: ヘッダー左（サイドバー切替ボタンの隣）とゲーム画面の2か所で常時確認できる
    - ゲーム画面: サイドバーの「ゲーム」ボタン（アカウントボタンの上）で開く単一画面。所持コインの確認と `GAME/` 内全8ゲームの一覧・プレイ開始をここで行う（旧キャラクター画面＋ステージ画面を統合）
    - 開始処理: プレイボタンで親側(game.js)がコインを消費してから対象ゲームを全画面 iframe で起動。残高不足時はプレイボタンを無効化
    - 終了処理: 各ゲームが `window.parent.postMessage({ type: 'game:ended', coin: 枚数 }, '*')` で通知（本番ビルド時は `'*'` を具体的なURLに差し替える）。coin 0 = ゲームオーバー、1以上 = クリアで獲得枚数として加算し、結果ポップアップを表示
    - クリア報酬: 難易度に応じて 易=1 / 普=2 / 難=3 枚（ゲーム内で難易度選択できる burroku / target は選択に応じて 1〜3 枚）。報酬枚数は各ゲームHTML側の定数（COIN_REWARD 等）で定義
    - 設計判断: プレイ中にオーバーレイを閉じた場合は中断扱いとし、消費済みコインは返却しない。target.html のようなスコア形式のゲームはスコア1点以上をクリア、0点以下をゲームオーバーと判定。pazuru.html は失敗が存在しないためゲームオーバー通知は送らない。旧RPG版の localStorage 保存データ（level/xp/runes等）はコイン制移行時に破棄する
    - 進捗バー: API紹介ページ表示中にヘッダーへ出現。ページ(iframe)内のボタン等をクリックするたびに20%ずつ上昇（専用の操作ボタンは無く、閲覧中の操作を自動検知）、100%でコイン1枚獲得
  - 設計判断: 素のHTML/CSS/JS（ビルド不要）。テンプレートは改変せず`../templates/`をiframe参照（単一の正）。
    UIは react-shadcn（`app/dashboard-01` の inset シェル + shadcn/ui デザイントークン）に準拠（旧: `design-spec-studio` の `ui_mockup.html`）。React は導入せず、`css/tokens.css`（トークン）と `css/style.css`（シェル）へ素の CSS で移植。`game.css` と JS が参照する旧変数名（`--accent` `--bg-card` 等）は style.css 内で shadcn トークンへの別名として維持。一覧データは`fronted-v2/js/catalog.js`に集約。
  - 分類設計: `category` は後方互換用の大分類、`categoryPath` はサイドバー表示用の階層分類（例: `["データ・検索系", "宇宙・天気"]`）。`categoryPath` が未指定の古い項目は `category` の1階層分類として扱う。
    - 大分類: 画像・ビジュアル系 / データ・検索系 / 為替・ツール系 / エンタメ・おもしろ系
    - 小分類例: 動物画像 / アート・デザイン / 3D・アバター / キャラクター画像 / アニメ・カード / ゲーム・キャラクター / 宇宙・天気 / 乗り物・交通 / ネットワーク・セキュリティ / 企業・公共データ / 金融・マーケット / 求人・スキル / AI・機械学習 / ブロックチェーン・市場 / 人名・属性推定 / 開発・OSS / 辞書・言語 / 日付・時刻 / 通貨・為替 / 地図・住所 / ファイル共有・保存 / 開発・検証 / 翻訳・言語 / 開発・検証 / テキスト検証 / ジョーク・雑学 / クイズ・ゲーム / 意思決定・名言
    - 追加の小分類例: 食品・生活 / 統計・公的データ / 都市・オープンデータ
    - 設計判断: Chainlink / Chainpoint / Helium / Steem / TWZRD Agent Intel / Walltime は、暗号資産・分散ネットワーク・市場情報を横断するため、既存の「金融・マーケット」ではなく `["データ・検索系", "ブロックチェーン・市場"]` にまとめる。APIキーやCORS制限があるサービスはキー入力欄を持ち、失敗時は仕様理解用のサンプル表示にフォールバックする。
    - 設計判断: MarkerAPI / Pick an Agency / Tenders Guru は企業・商標・公共調達の検索データであり、国・地域の基礎情報とは用途が異なるため `["データ・検索系", "企業・公共データ"]` にまとめる。DomainsDB はドメイン調査用途のため既存の `["データ・検索系", "ネットワーク・セキュリティ"]` に置く。
    - 設計判断: 複数メンバーが並行して同一APIの紹介ページを独立に作成した結果、`catalog.js` の `id` が重複するケースが発生した（例: apicagent / apis-guru / cdnjs / changelogs-md / cloudflare-trace / bored が `data/` と `tools/` の双方に存在）。`id` はURLハッシュでの一意識別に使うため重複させない。既存ファイルを両方活かす場合はジャンルが分かる接尾辞を付けて一意化する（例: `apicagent` → データ側はそのまま、ツール側は `apicagent-checker`）。同一ファイルを指す完全な重複エントリ（例: 旧 `brewpage` / `ciprand` の tools内二重登録）は片方を削除する。`domainsdb.html` のように2つの独立実装が1ファイルに連結されてしまっていたケースは、内容を1つに統合してから重複エントリを解消する。

---

## 4. 機能一覧

機能名 : 説明

- 簡易RPG: `GAME/game.html` で魔王を倒すとゲームクリア画面を表示し、再挑戦できる。
- ミニゲーム集: `GAME/` 内の全8ゲーム（Tilegame / burroku / game / pazuru / picross / syuuthingu / target / undertale）は fronted-v2 のゲーム画面からコイン消費でプレイでき、終了時に `game:ended` メッセージ（coin 0=ゲームオーバー / 1以上=クリア報酬）を親へ通知する。


---

## 5. API・外部サービス

- キー管理はapplication.properties

サービス名 : 用途 

### 無料WebAPI候補台帳

`docs/apis/free-webapis-not-implemented.md` を未実装無料WebAPI候補のインデックスとし、Public APIs の公開一覧から `Auth = No` のAPIを抽出した候補を `docs/apis/free-webapis-not-implemented-1.md` 〜 `docs/apis/free-webapis-not-implemented-5.md` に分割して整理する。`docs/specification.md` の実装済み外部API表にある項目、および実装済み印のある項目は候補台帳から除外する。HTML化時は公式URLで現在の無料利用条件・CORS・エンドポイント仕様を再確認する。

### WebAPI紹介ページ作成スキル

`.agents/skills/webapi-page-maker/` は、5分割した未実装無料WebAPI候補台帳から候補を選び、`templates/` の自己完結HTML、`fronted-v2/js/catalog.js`、仕様書の外部API表を整合させて追加するためのプロジェクト専用スキル。呼び出しは `$webapi-page-maker (<fileNumber>,<topDown>)` とし、`fileNumber` は `docs/apis/free-webapis-not-implemented-<fileNumber>.md` の末尾番号、`topDown` は `true` のとき上から順、`false` のとき下から順に候補を実装する。各分割台帳の先頭には `control: continue` を置き、ユーザーが `control: stop` に変更した場合、スキルは1件の実装完了ごとのチェックポイントで次の候補へ進まず終了する。実装完了後は該当候補行を分割台帳から削除する。このスキル使用時は `no-test` を必ず適用し、テスト・ビルド・lint・プレビュー起動・ブラウザ確認などの検証は一切行わない。

### templates/ 各ページが利用する外部API（fronted-v2で紹介）

`templates/` はジャンル別フォルダ（`image/` 画像・ビジュアル系、`data/` データ・検索系、`tools/` 為替・ツール系、`fun/` エンタメ・おもしろ系、`other/` その他）に整理。

| ジャンル | ページ | 外部API | 用途 |
|----------|--------|---------|------|
| image | dog-api | Dog API (dog.ceo) | 犬の画像・犬種一覧 |
| data | catfact-ninja | CatFact Ninja | 猫の豆知識を取得 |
| image | cataas | Cataas | 猫画像をランダム表示 |
| data | dog-facts-kinduff | Dog API | 犬に関する豆知識を取得 |
| image | http-dog | HTTP Dog | HTTPステータスコードを犬画像で表示 |
| data | meowfacts | MeowFacts | 猫の豆知識を取得 |
| image | placebear | PlaceBear | クマ画像プレースホルダーを表示 |
| image | placedog | PlaceDog | 犬画像プレースホルダーを表示 |
| image | randomdog | RandomDog | 犬画像・動画URLをランダム表示 |
| image | 3D | Three.js GLTF サンプル | ランダムな3Dモデルを読み込み・閲覧 |
| image | dance-proto | Three.js GLTF サンプル | 3Dモデルのダンスアニメーション再生・切替 |
| image | cat-api | The Cat API | 猫の画像・猫種データ |
| image | Fox | RandomFox | キツネ画像 |
| image | neko | HTTP Cat | HTTPステータスを猫画像で表示 |
| image | Waifu | Waifu.im | アニメキャラ画像 |
| image | kamo | Random-d.uk | アヒル画像 |
| image | food | Wikipedia API | 料理名で画像検索 |
| image | colormind | Colormind | AIカラーパレットを生成して配色を確認 |
| image | dummyimage | DummyImage | サイズと色を指定してダミー画像を生成 |
| image | emojihub | EmojiHub | カテゴリ付きの絵文字データをランダム取得 |
| image | icons8 | Icons8 | Icons8 CDN のアイコンURLを組み立てて表示 |
| image | lordicon | Lordicon | アニメーションアイコンをプレビュー |
| image | metmuseum | Metropolitan Museum of Art Collection API | メトロポリタン美術館の作品を検索して表示 |
| image | php-noise | PHP-Noise | ノイズ背景のパターンを生成して確認 |
| image | xcolors | xColors | ランダムカラーと補色系の配色を取得 || data | anime / Jikan | Jikan API | アニメ検索・一覧 |
| data | anime-news-network | Anime News Network Encyclopedia API | ANN のアニメ記事・レポート見出し一覧 |
| data | ghibli | Studio Ghibli API | ジブリ作品一覧・詳細 |
| data | trace-moe | trace.moe API | 画像URLからアニメの出典候補を検索 |
| data | Poke | PokeAPI | ポケモン情報 |
| data | akusyonn | FreeToGame | 無料ゲーム一覧 |
| data | cheapshark | CheapShark | PCゲームの現在セール情報をタイトル検索 |
| data | applemusic | iTunes Search API | 楽曲検索 |
| data | verome | Verome API | 楽曲検索と歌詞(LRCLib経由)の表示 |
| data | countrySearch | CountriesNow API | 国名から人口・首都を検索 |
| data | ziptastic | Ziptastic API | 米国ZIPコードから国・州・都市を検索 |
| data | domainsdb | DomainsDB API | 登録済みドメイン名をキーワード検索 |
| data | ip | ローカルサンプルデータ | IPジオロケーション情報の表示サンプル |
| data | brasilapi | BrasilAPI | CEP(郵便番号)とDDD(市外局番)からブラジルの住所・地域情報を検索 |
| data | food-hygiene-ratings | Food Hygiene Ratings API | 食品衛生評価の公開データを地域別に探索 |
| data | open-food-facts | Open Food Facts | 商品名で世界の食品データベースを検索してNutri-Score等を表示 |
| data | inei-portal | INEI 統計ポータル | INEI のテーマ別統計リンクを検索・参照 |
| data | bank-negara-malaysia-open-data | Bank Negara Malaysia Open Data | マレーシア中央銀行の公開データポータルを用途別に探索 |
| data | interpol-red-notices | Interpol Notices API | Interpol赤手配の人物を条件検索して表示 |
| data | ibb-open-data | İBB Open Data Portal | İBB公開データをキーワードとカテゴリで検索 |
| data | kabu | Alpha Vantage | 銘柄コードで株価・騰落率を検索 |
| data | chainlink | Chainlink Data Feeds | Data Feeds種別と利用イメージを表示 |
| data | chainpoint | Chainpoint | ハッシュを使ったブロックチェーン証明フローを表示 |
| data | steem | Steem JSON-RPC API | Steem内部マーケット情報を取得 |
| data | radar | OpenSky Network API | 上空の航空機データを地図に表示 |
| data | saiba- | Shodan API | IPの公開アセット情報・ポート調査 |
| data | urlhaus | URLhaus API | URLhaus の recent URLs / payloads を Auth-Key 付きで閲覧 |
| data | agify | Agify.io | 名前から推定年齢と参照件数を取得 |
| data | weather | 気象庁 予報JSON | 都道府県ごとの天気予報を取得 |
| data | wttr-in | wttr.in | 世界の都市名で現在天気と3日間予報を取得 |
| data | 24-pull-requests | 24 Pull Requests API | OSS貢献促進サービスのプロジェクト一覧やPR統計を取得 |
| data | api-gratis | API Grátis | 公式URLの到達状況と仕様確認メモを表示 |
| data | digitalocean-status | DigitalOcean Status API | DigitalOceanの全体状態とコンポーネント状態を取得 |
| data | host-t-dns | host-t.com | HTTP GETでDNS問い合わせURLを作成し取得を試行 |
| data | icanhazip | Icanhazip | アクセス元のグローバルIPアドレスを取得 |
| data | ip-fast | ip-fast.com | IPアドレス・国・都市情報を取得 |
| data | ipify | IPify | 現在のグローバルIPアドレスをJSONで取得 |
| data | ipinfo | IPinfo | IPの地域・組織情報を取得 |
| data | iplogs | IPLogs | IPアドレスのVPN・プロキシ・Tor判定をスコア付きで表示 |
| data | my-ip | MY IP | IPアドレス情報を取得 |
| data | isitdownstatus | isitdownstatus | Webサイトやサービスのダウン状態確認API候補 |
| data | jsdelivr | jsDelivr Data API | npmパッケージのCDNファイル情報を取得 |
| data | npm-registry | npm Registry | npmパッケージ情報と最新バージョンを取得 |
| data | sonar-search | Sonar | Project Sonar DNS列挙API候補の検索例を表示 |
| data | reqres | ReqRes | REST API練習用のユーザー一覧を取得 |
| data | rss-to-json | RSS feed to JSON | RSSフィードURLをJSONへ変換して取得 |
| data | license-api | License-API | OSSライセンス情報API候補を取得またはフォールバック表示 |
| data | nationalize | Nationalize.io | 名前から国籍候補と確率を推定 |
| data | chinese-character-web | Chinese Character Web | 漢字の定義・発音API候補の検索例を表示 |
| data | chinese-text-project | Chinese Text Project | 中国古典テキストAPI候補の検索例を表示 |
| data | free-dictionary | Free Dictionary | 英単語の定義・発音・品詞を取得 |
| data | indonesia-dictionary | Indonesia Dictionary | インドネシア語辞書API候補の検索例を表示 |
| data | wiktionary | Wiktionary | MediaWiki APIから辞書ページを検索 |
| data | utyu | NASA NeoWs | 近地天体(NEO)観測データ |
| data | wakusei | ローカルデータ(サンプル) | 太陽系の惑星情報 |
| data | burogu | JSONPlaceholder | ダミー記事のランダム表示 |
| data | amiibo | AmiiboAPI | Amiibo検索 |
| data | animal-crossing-new-horizons | Animal Crossing: New Horizons API | 住民や魚・虫・化石の図鑑 |
| data | astroworld | Astroworld API | Minecraft系データの検索 |
| data | magic-the-gathering | Magic The Gathering API | MTGカード検索 |
| data | minecraft-server-status | Minecraft Server Status API | Minecraftサーバーの状態確認 |
| data | mmo-games | MMOBomb MMO Games API | MMOゲーム・ニュース・配布情報 |
| data | monster-hunter-world | MHW DB API | モンハンワールドのモンスター図鑑 |
| data | playerdb | PlayerDB | Minecraft / Steam / Xbox / Hytale のプロフィール検索 |
| data | hon | Open Library | 書籍・漫画検索 |
| data | bhagavad-gita | Bhagavad Gita telugu API | バガヴァッド・ギーターの詩節をテルグ語・オディア語で検索表示 |
| data | index | Random User Generator | ランダムなプロフィール生成 |
| data | Cars | NHTSA Vehicle API / Wikipedia API / Argos Translate | メーカーとモデルを選んで車両情報と画像を検索 |
| data | alpha-mossland | Alpha by Mossland | 韓国暗号資産チャンネル由来の正規化データを表示 |
| data | block-lottos | Block Lottos | オンチェーン抽選サービスのOpenAPI定義を表示 |
| data | btcnode-uk | btcnode.uk | Bitcoinデータとx402課金エンドポイントのURLを確認 |
| data | coingecko | CoinGecko API | BTC/ETHの複数通貨建て価格を取得 |
| data | coinlore | CoinLore | 公開ティッカーAPIから価格・出来高を一覧表示 |
| data | coinpaprika | Coinpaprika | 暗号資産マーケットデータをティッカー形式で表示 |
| data | cryptapi | CryptAPI | 暗号資産決済APIの公開情報エンドポイントを確認 |
| data | cryptingup | CryptingUp | 取引ペアやマーケットデータを取得 |
| data | gemini | Gemini REST API | Gemini取引所の公開マーケットデータを取得 |
| data | mempool-space | Mempool.space | Bitcoinの推奨手数料を取得 |
| data | mercado-bitcoin | Mercado Bitcoin | BTC/BRLの公開ティッカーを確認 |
| data | nexchange | Nexchange | 自動暗号資産交換サービスの通貨情報を確認 |
| data | solana-json-rpc | Solana JSON RPC | Solana JSON-RPCへPOSTしてヘルスチェック |
| data | ai-dev-jobs | AI Dev Jobs | AI/MLエンジニア求人APIのOpenAPI定義を確認 |
| data | arbeitnow | Arbeitnow | Europe/Remote求人をキーワードで絞り込んで表示 |
| data | devitjobs-uk | DevITjobs UK | UK開発者求人のXMLフィードを読み込んで表示 |
| data | deepcode-ai | DeepCode AI | AIコードレビューサービスの公開情報を確認 |
| data | not-human-search | Not Human Search | AIツール探索APIのOpenAPI定義を確認 |
| data | tensorfeed | TensorFeed | AIニュース・モデル情報・サービス状態を取得 |
| tools | currency_converter | ExchangeRate-API | 通貨換算 |
| tools | calendar | Public Holidays API | 祝日付きカレンダー表示 |
| tools | church-calendar | Church Calendar API | カトリック典礼暦の日付情報表示 |
| tools | hebcal-converter | Hebcal Developer APIs | グレゴリオ暦からヘブライ暦への変換 |
| tools | lectserve | LectServe | プロテスタント系朗読暦の見出し表示 |
| tools | nager-date | Nager.Date | 国コードと年から世界各国の祝日一覧を取得 |
| tools | icsdb-non-working-days | icsdb | GitHub上の非稼働日ICSファイル候補を一覧 |
| tools | russian-calendar | work-calendar | ロシア稼働日判定サービス実装例の確認 |
| tools | uk-bank-holidays | GOV.UK Bank Holidays | 英国地域別バンクホリデーJSON表示 |
| tools | time | ローカル時刻 | 現在時刻の表示 |
| tools | kawase | exchangerate.host | 為替レート |
| tools | file-io | file.io | ファイルや短文の一時共有リンク生成 |
| tools | fileup | FileUp | 期限と閲覧回数を指定したファイル共有 |
| tools | pantry | Pantry | JSONをクラウドのバスケットに保存・取得 |
| tools | null-pointer | The Null Pointer (0x0.st) | ファイルやURLの使い捨て共有リンク生成 |
| tools | apicagent-checker | ApicAgent | User-Agent文字列から端末情報を解析 |
| tools | apis-guru-catalog | APIs.guru | 公開API定義の検索・一覧取得 |
| tools | bored-tools | Bored | ランダムな退屈しのぎ提案 |
| tools | cdnjs-finder | CDNJS | CDN上のライブラリ情報検索 |
| tools | changelogs-md-checker | Changelogs.md | changelogメタデータの到達性確認 |
| tools | cloudflare-trace-tools | Cloudflare Trace | 接続情報とtrace文字列の表示 |
| tools | codex | CodeX | オンラインコンパイラの公開情報確認 |
| tools | genngohonnyaku | ローカル辞書(サンプル) | 日本語↔英語の簡易翻訳 |
| tools | tizu | Leaflet / OpenStreetMap | 地図表示とクリック位置マーカー追加 |
| tools | postman-echo | Postman Echo | GETパラメータを返すテストAPIでリクエスト検証 |
| tools | purgomalum | PurgoMalum | 入力テキストの不適切語を検出・置換 |
| tools | beeceptor-echo | Beeceptor HTTP Echo | HTTPリクエストを送信しエコー内容を確認 |
| tools | brewpage | BrewPage API | HTML投稿で共有URLを取得（失敗時はcurl手順を表示） |
| tools | passwordinator | Passwordinator | 条件を指定してランダムパスワードを生成 |
| tools | httpbin | Httpbin | HTTPリクエスト/レスポンス検証用APIを試す |
| tools | icanhazepoch | Icanhazepoch | 現在のUnix epoch秒を表示 |
| tools | ifttt-connect | IFTTT Connect API | 認証が必要なConnect APIのリクエスト構造を確認 |
| tools | image-charts | Image-Charts | URLパラメータで棒グラフ画像を生成 |
| tools | oyyi | oyyi | Fake Dataや変換系API候補の利用メモを表示 |
| tools | qr-barcode | QR & Barcode | QRコードやバーコード画像生成API候補を試す |
| tools | qrtag | QRTag | QR画像URLを生成 |
| tools | qrcode-monkey | Qrcode Monkey | カスタムQR作成APIのPOSTリクエスト例を表示 |
| tools | quickchart | QuickChart | Chart.js設定からグラフ画像を生成 |
| tools | json2jsonp | JSON 2 JSONP | JSON URLをJSONP呼び出し用URLへ変換 |
| tools | keyvalue | Keyvalue | 簡易key-valueストレージAPI候補を試す |
| tools | lua-decompiler | Lua Decompiler | Lua 5.1デコンパイラAPI候補のリクエスト形状を確認 |
| tools | serialif-color | Serialif Color | 色変換・補色・コントラストAPI候補を紹介 |
| tools | statically | Statically | GitHubや画像URLをCDN配信用URLへ変換 |
| tools | thunder-client | Thunder Client | APIテストツールの利用メモを表示 |
| tools | wandbox | Wandbox | オンラインコンパイラAPI候補のリクエスト形状を表示 |
| tools | microenv | MicroENV | Fake REST API候補のリクエスト例を表示 |
| tools | mocky | Mocky | 任意JSONを返すモックURL作成手順を確認 |
| tools | networkcalc | NetworkCalc | サブネットなどのネットワーク計算API候補を紹介 |
| tools | india-pincode | Indian Pincode | インド郵便番号のサンプルデータで住所検索 |
| fun | joke | Official Joke API | 海外ジョーク |
| fun | animechan | Animechan API | アニメ引用をランダム取得して表示 |
| fun | anime-facts | Anime Facts REST API | アニメ作品の雑学と画像を取得 |
| fun | ohuzake | Useless Facts | ランダム雑学 |
| fun | OpenTrivia | Open Trivia DB | クイズ |
| fun | tai | Quotable API | 英文お題を使ったタイピングゲーム |
| fun | bored | Bored API | 気分転換アクティビティを提案（応答不可時はローカル候補） |
| fun | hipsum | Hipsum | ヒップスター風ダミーテキストを生成 |
| fun | shoutcloud | SHOUTCLOUD | 入力テキストを大文字化するAPI候補 |
| fun | YesNo | yesno.wtf | Yes/No判定 |
| fun | florida-man | Florida Man API | 月日を指定して実在のFlorida Man見出しを表示 |
| fun | meigenn | ローカルデータ(サンプル) | 名言をランダム表示 |
| fun | Useless | Useless Facts / MyMemory Translation API / Unsplash Source | ランダム雑学を翻訳付きで表示 |
| other | itiran | MusicBrainz / Open Disease / Radio Browser / Lyrics.ovh | 複数の外部APIを検索・選択してレスポンス(JSON)を一括表示 |
| other | itiran2 | Fun Fact API / JokeAPI / Imgflip / Foodish / JSONPlaceholder / Advice Slip API / CatFact Ninja / Bible-api / PoetryDB / Quran Cloud / Quran-api / Wizard World API / Currency-api / Frankfurter / chucknorris.io | サイドバーから複数の外部APIを選んでレスポンス(JSON)を表示 |
| data | Dictionary | Free Dictionary API | 英単語を検索し発音・品詞・意味を日本語訳付きで表示 |
| fun | omikuzi | ローカルデータ(サンプル) | おみくじで運勢・ラッキーカラー等を表示 |
| fun | quiz | ローカルデータ(サンプル) | カテゴリ付き4択クイズをランダム出題 |

※ 翻訳に MyMemory Translation API を併用するページあり（joke / ohuzake / Jikan / OpenTrivia / Yugio）。Cars は Argos Translate を併用。Useless は MyMemory Translation API と Unsplash Source を併用。`zyouku` は Google Translate を利用する。NASA系・RAWG(game)はAPIキーが必要。wakusei / meigenn / genngohonnyaku / sindan は外部APIを使わないローカルデータのサンプル。`minecraft-server-status` はブラウザの User-Agent 制約で live fetch が失敗する場合があるため、icon endpoint とサンプル fallback を併用する。`autochess-vng` は公開リポジトリ由来のサンプル図鑑として扱い、ライブ API が使えない場合はサンプル表示を行う。

---

## 6. データモデル

> クラス図・ER図など、決まり次第ここに追記してください。

---

## 7. 未決定事項・TODO

- [ ] アプリ名を決める
- [ ] 使用する外部APIを決める
- [ ] 画面構成を決める
- [ ] データモデルを設計する

---

## 8. Account Authentication

- Authentication method: Spring Security form login.
- Login URL: `/auth/login`
- Registration URL: `/auth/register`
- Logout URL: `/auth/logout`
- Protected pages: all routes except authentication pages and static assets require login.
- User data is stored in the `users` table through Spring Data JPA.
- Passwords are stored as BCrypt hashes. Plain text passwords must never be saved.
- Email addresses are unique and are used as the login identifier.
- Default role for newly registered users: `USER`.
- Development DB: H2 in-memory database. A production DB can replace this by changing `application.properties`.

### Security configuration (profile-based)

- `SecurityConfig` は2本のセキュリティチェーンに分離:
  - `appSecurityFilterChain` (常時有効): 認証ページ・静的アセットのみ許可、他は認証必須。CSRF 有効、フレームは既定の DENY。
  - `h2ConsoleSecurityFilterChain` (`dev` プロファイル限定): `/h2-console/**` のみ無認証・CSRF無効・同一オリジンフレーム許可。
- H2 コンソールの有効化 (`spring.h2.console.*`) は `application-dev.properties` に分離。`dev` プロファイル起動時のみ利用可能:
  `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`
- 本番(dev無し)では H2 コンソールの緩和は一切適用されない。**公開環境で H2 コンソールを有効化しないこと。**
- `application.properties` は APIキー等の秘密情報を含むため Git 追跡対象外（各自 `application.properties.example` からローカル作成）。秘密情報を含まない `application-dev.properties` のみ追跡対象。
- 起動クラスは `TeamTAppApplication` に一本化（`@SpringBootApplication` の重複を解消）。

### Authentication folder responsibilities

- `controller/`: screen routing and registration endpoint.
- `service/`: registration workflow, password hashing, duplicate email checks.
- `model/`: JPA entities and role enum.
- `repository/`: database access for user accounts.
- `dto/`: form input objects for login and registration.
- `security/`: Spring Security user loading and authentication support.
- `config/`: Spring Security configuration.
- `resources/templates/auth/`: login and registration templates.
- `resources/static/css/auth/`: authentication page styles.
- `test/java/com/example/app/auth/`: authentication flow tests.


