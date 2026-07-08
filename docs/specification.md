# 仕様書 - teamT-app

> このファイルはチーム全員（および各メンバーが使用するAI）が参照する仕様書です。
> アプリ概要が決まり次第、以下の各項目を埋めてください。

---

## 1. アプリ概要

- 未定
---

## 2. 使用技術

| 区分 | 技術 |
|------|------|
| バックエンド | Java 21 / Spring Boot |
| フロントエンド | React / Vite |
| ビルドツール | Maven |
| DB | （未定） |

---

## 3. 画面一覧

画面名 : 説明 

### WebAPI紹介サイト（fronted-v2）

- WebAPI Gallery : `templates/`内の各WebAPI紹介ページ(自己完結型HTML)を選択して表示するギャラリー画面
  - 構成: サイドバー（ブランド / 検索 / おすすめ一覧 / ジャンルごとのAPI（階層カテゴリ別一覧） / footer（下部にアカウント・設定ボタン））＋ メイン（最小限のヘッダー=サイドバー表示切替ボタンのみ ＋ iframeビューア）
  - 設定モーダル: 左ナビ（検索 + アカウント / 外観 / その他）＋ 右コンテンツ。サイドバー下部の「設定」「アカウント」から開く
    - アカウント: 表示名（localStorageに保存、サーバー認証なしのデモ）
    - 外観: テーマ(ライト/ダーク)とアクセント色(オレンジ/青)を独立して切替（アクセント変更で背景は不変）
    - その他: 収録API数・サイト情報・設定リセット
  - 一覧クリックで該当HTMLをiframe表示。検索・URLハッシュ復元に対応
  - おすすめ一覧: 検索欄の直下に配置。「おすすめ一覧 ＞」（先頭に星アイコン）を開くと最上位カテゴリ見出しが並び、各カテゴリを開くと個々のHTML（推薦API）が出る折りたたみツリー。トップ・各カテゴリとも既定は閉じた状態で、検索中は一致項目を見せるため自動展開する。表示対象は `../おすすめ一覧.txt`（各メンバーが推薦するテンプレートのファイル名を1行ずつ記載）を起動時に読み込み、`.html`で終わる行だけを`CATALOG`の`file`（ディレクトリを除いたbasename・大小無視）と突き合わせて抽出し、最上位カテゴリ(categoryPath[0])単位でまとめる。名前欄やコメント行、一致しないファイル名は無視される。
  - サイドバー項目の行レイアウト: 見出し行（おすすめ一覧トップ・カテゴリ見出し・小分類見出し）は「アイコン／名称／右向き矢印(chevron-right、常に右向き固定・回転しない)」の形式。最上位カテゴリ見出しはカテゴリ別アイコン（画像=photo/データ=database/為替=tool/エンタメ=mood-smile）、小分類見出しは folder-open アイコン + 件数バッジ付き。最内アイテム（各HTML項目）は「アイコン／項目名」のみで＞を付けない。
  - サイドバーのスクロール: ブランド・検索は上部、アカウント等のフッターは下部に固定し、中央の `.sidebar-scroll`（おすすめ一覧＋ジャンル別一覧）だけをまとめて縦スクロールさせる。おすすめ件数が多くても全項目に到達できる。
  - ゲーム要素（`fronted-v2/js/game.js` / `css/game.css`。状態は localStorage 保存、app.jsとは疎結合）
    - 進捗バー: API紹介ページ表示中にヘッダーへ出現。ページ(iframe)内のボタン等をクリックするたびに20%ずつ上昇（専用の操作ボタンは無く、閲覧中の操作を自動検知）、100%で経験値100獲得
    - レベル: 必要経験値100（一律）。獲得時にポップアップで経験値バーが伸び、レベルアップを表示
    - キャラクター画面（サイドバーのキャラボタン→アカウントボタンの上。ボタンには現在のキャラ名とレベルを表示）: キャラ名（アカウント名とは別・自由変更）、ステータス（体力/攻撃力/防御力）、ルーン4枠を表示
    - ステージ: 「旅に出る」で全10ステージ（5・10がボス）に順次挑戦。※戦闘内容は未実装
    - ルーン: ステージクリアごとに1つ獲得。効果は体力/攻撃力/防御力のいずれか +5〜50%（ランダム）。装備枠は4
    - 成長: レベルアップで基礎ステータス上昇＋ルーンの%補正を加算して最終値を算出（数値は game.js の CONFIG に集約）
  - 設計判断: 素のHTML/CSS/JS（ビルド不要）。テンプレートは改変せず`../templates/`をiframe参照（単一の正）。
    UIは`design-spec-studio`の`ui_mockup.html`のデザインシステムに準拠。一覧データは`fronted-v2/js/catalog.js`に集約。
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


---

## 5. API・外部サービス

- キー管理はapplication.properties

サービス名 : 用途 

### 無料WebAPI候補台帳

`docs/apis/free-webapis-not-implemented.md` を未実装無料WebAPI候補のインデックスとし、Public APIs の公開一覧から `Auth = No` のAPIを抽出した候補を `docs/apis/free-webapis-not-implemented-1.md` 〜 `docs/apis/free-webapis-not-implemented-5.md` に分割して整理する。`docs/specification.md` の実装済み外部API表にある項目、および実装済み印のある項目は候補台帳から除外する。HTML化時は公式URLで現在の無料利用条件・CORS・エンドポイント仕様を再確認する。

### WebAPI紹介ページ作成スキル

`.agents/skills/webapi-page-maker/` は、5分割した未実装無料WebAPI候補台帳から候補を選び、`templates/` の自己完結HTML、`fronted-v2/js/catalog.js`、仕様書の外部API表を整合させて追加するためのプロジェクト専用スキル。呼び出しは `$webapi-page-maker (<fileNumber>,<topDown>)` とし、`fileNumber` は `docs/apis/free-webapis-not-implemented-<fileNumber>.md` の末尾番号、`topDown` は `true` のとき上から順、`false` のとき下から順に候補を実装する。各分割台帳の先頭には `control: continue` を置き、ユーザーが `control: stop` に変更した場合、スキルは1件の実装完了ごとのチェックポイントで次の候補へ進まず終了する。実装完了後は該当候補行を分割台帳から削除する。このスキル使用時は `no-test` を必ず適用し、テスト・ビルド・lint・プレビュー起動・ブラウザ確認などの検証は一切行わない。

### templates/ 各ページが利用する外部API（fronted-v2で紹介）

`templates/` はジャンル別フォルダ（`image/` 画像・ビジュアル系、`data/` データ・検索系、`tools/` 為替・ツール系、`fun/` エンタメ・おもしろ系）に整理。

| ジャンル | ページ | 外部API | 用途 |
|----------|--------|---------|------|
| image | dog-api | Dog API (dog.ceo) | 犬の画像・犬種一覧 |
| image | axolotl | Axolotl API | ウーパールーパーの写真と豆知識を表示 |
| data | cat-facts-legacy | Cat Facts | 猫に関する豆知識をランダム表示 |
| data | catfact-ninja | CatFact Ninja | 猫の豆知識を取得 |
| image | cataas | Cataas | 猫画像をランダム表示 |
| data | dog-facts-duke | Dog Facts API | 犬の豆知識をランダム表示 |
| data | dog-facts-kinduff | Dog API | 犬に関する豆知識を取得 |
| data | fishwatch | FishWatch | 魚種情報と画像を表示 |
| image | http-dog | HTTP Dog | HTTPステータスコードを犬画像で表示 |
| data | meowfacts | MeowFacts | 猫の豆知識を取得 |
| data | movebank | Movebank API | 動物の移動研究データAPIを紹介 |
| image | placebear | PlaceBear | クマ画像プレースホルダーを表示 |
| image | placedog | PlaceDog | 犬画像プレースホルダーを表示 |
| image | randomdog | RandomDog | 犬画像・動画URLをランダム表示 |
| data | rescuegroups | RescueGroups API | 保護動物・里親募集データAPIの概要 |
| image | shibe-online | Shibe.Online | 柴犬・猫・鳥のランダム画像を表示 |
| data | xeno-canto | xeno-canto | 野鳥の録音データを検索して再生 |
| image | 3D | Three.js GLTF サンプル | ランダムな3Dモデルを読み込み・閲覧 |
| image | dance-proto | Three.js GLTF サンプル | 3Dモデルのダンスアニメーション再生・切替 |
| image | oto | Three.js / Web Speech API | 3Dアバターのダンス再生と音声読み上げ |
| image | cat-api | The Cat API | 猫の画像・猫種データ |
| image | Fox | RandomFox | キツネ画像 |
| image | neko | HTTP Cat | HTTPステータスを猫画像で表示 |
| image | Necos | Nekos.best | ネコミミ画像 |
| image | Waifu | Waifu.im | アニメキャラ画像 |
| image | catboys | Catboys API | 画像と fact を取得 |
| image | waifu-pics | Waifu.pics | SFW の waifu / neko 画像をランダム表示 |
| image | kamo | Random-d.uk | アヒル画像 |
| image | food | Wikipedia API | 料理名で画像検索 |
| image | artic | Art Institute of Chicago API | シカゴ美術館の公開作品を検索して画像付きで表示 |
| image | colormind | Colormind | AIカラーパレットを生成して配色を確認 |
| image | colourlovers | ColourLovers | 人気パレットの色見本を表示 |
| image | dummyimage | DummyImage | サイズと色を指定してダミー画像を生成 |
| image | emojihub | EmojiHub | カテゴリ付きの絵文字データをランダム取得 |
| image | icon-horse | Icon Horse | ドメイン名からファビコンを取得 |
| image | icons8 | Icons8 | Icons8 CDN のアイコンURLを組み立てて表示 |
| image | lordicon | Lordicon | アニメーションアイコンをプレビュー |
| image | metmuseum | Metropolitan Museum of Art Collection API | メトロポリタン美術館の作品を検索して表示 |
| image | php-noise | PHP-Noise | ノイズ背景のパターンを生成して確認 |
| image | pixel-encounter | Pixel Encounter | ピクセル風モンスターSVGをランダム生成 |
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
| data | markerapi | MarkerAPI | USPTO商標データを認証情報入力式で検索 |
| data | pick-an-agency | Pick an Agency API | サービスと地域からマーケティング代理店を検索 |
| data | tenders-guru-hu | Tenders Guru API | ハンガリーの公共調達データを取得 |
| data | tenders-guru-pl | Tenders Guru API | ポーランドの公共調達データを取得 |
| data | tenders-guru-ro | Tenders Guru API | ルーマニアの公共調達データを取得 |
| data | tenders-guru-es | Tenders Guru API | スペインの公共調達データを取得 |
| data | tenders-guru-ua | Tenders Guru API | ウクライナの公共調達データを取得 |
| data | ip | ローカルサンプルデータ | IPジオロケーション情報の表示サンプル |
| data | brasilapi | BrasilAPI | CEP(郵便番号)とDDD(市外局番)からブラジルの住所・地域情報を検索 |
| data | food-hygiene-ratings | Food Hygiene Ratings API | 食品衛生評価の公開データを地域別に探索 |
| data | open-food-facts | Open Food Facts | 商品名で世界の食品データベースを検索してNutri-Score等を表示 |
| data | inei-portal | INEI 統計ポータル | INEI のテーマ別統計リンクを検索・参照 |
| data | bank-negara-malaysia-open-data | Bank Negara Malaysia Open Data | マレーシア中央銀行の公開データポータルを用途別に探索 |
| data | world-bank | World Bank Indicators API | 国と指標を選んで人口・GDP・平均寿命などの年次推移を取得 |
| data | interpol-red-notices | Interpol Notices API | Interpol赤手配の人物を条件検索して表示 |
| data | ibb-open-data | İBB Open Data Portal | İBB公開データをキーワードとカテゴリで検索 |
| data | kabu | Alpha Vantage | 銘柄コードで株価・騰落率を検索 |
| data | chainlink | Chainlink Data Feeds | Data Feeds種別と利用イメージを表示 |
| data | chainpoint | Chainpoint | ハッシュを使ったブロックチェーン証明フローを表示 |
| data | helium | Helium API | Heliumネットワーク情報APIの取得イメージを表示 |
| data | steem | Steem JSON-RPC API | Steem内部マーケット情報を取得 |
| data | twzrd-agent-intel | TWZRD Agent Intel | Solana上のAIエージェント信頼スコア取得をキー入力式で試す |
| data | walltime | Walltime API | 市場情報APIのレスポンスをカード形式で表示 |
| data | nasa | NASA APOD | 今日の天体写真 |
| data | radar | OpenSky Network API | 上空の航空機データを地図に表示 |
| data | saiba- | Shodan API | IPの公開アセット情報・ポート調査 |
| data | urlhaus | URLhaus API | URLhaus の recent URLs / payloads を Auth-Key 付きで閲覧 |
| data | seibetu | Genderize.io | 名前から性別と確率を推定 |
| data | agify | Agify.io | 名前から推定年齢と参照件数を取得 |
| data | weather | 気象庁 予報JSON | 都道府県ごとの天気予報を取得 |
| data | wttr-in | wttr.in | 世界の都市名で現在天気と3日間予報を取得 |
| data | 24-pull-requests | 24 Pull Requests API | OSS貢献促進サービスのプロジェクト一覧やPR統計を取得 |
| data | api-gratis | API Grátis | 公式URLの到達状況と仕様確認メモを表示 |
| data | digitalocean-status | DigitalOcean Status API | DigitalOceanの全体状態とコンポーネント状態を取得 |
| data | downstatus | DownStatus | 外部サービスの稼働状況確認API候補を表示 |
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
| data | game | RAWG API | 高評価ゲーム一覧 |
| data | amiibo | AmiiboAPI | Amiibo検索 |
| data | animal-crossing-new-horizons | Animal Crossing: New Horizons API | 住民や魚・虫・化石の図鑑 |
| data | astroworld | Astroworld API | Minecraft系データの検索 |
| data | autochess-vng | Autochess VNG API | 英雄・クラス・種族の図鑑 |
| data | magic-the-gathering | Magic The Gathering API | MTGカード検索 |
| data | minecraft-server-status | Minecraft Server Status API | Minecraftサーバーの状態確認 |
| data | mmo-games | MMOBomb MMO Games API | MMOゲーム・ニュース・配布情報 |
| data | monster-hunter-world | MHW DB API | モンハンワールドのモンスター図鑑 |
| data | playerdb | PlayerDB | Minecraft / Steam / Xbox / Hytale のプロフィール検索 |
| data | hon | Open Library | 書籍・漫画検索 |
| data | bhagavad-gita | Bhagavad Gita telugu API | バガヴァッド・ギーターの詩節をテルグ語・オディア語で検索表示 |
| data | index | Random User Generator | ランダムなプロフィール生成 |
| data | Cars | NHTSA Vehicle API / Wikipedia API / Argos Translate | メーカーとモデルを選んで車両情報と画像を検索 |
| data | Yugio | YGOPRODeck API / MyMemory Translation API | 遊戯王カードを検索して詳細表示 |
| data | zero-x | 0x API | DEXの価格見積もりやスワップAPIをAPIキー入力式で確認 |
| data | one-inch | 1inch API | DEX集約APIをBearerキー入力式で確認 |
| data | alpha-mossland | Alpha by Mossland | 韓国暗号資産チャンネル由来の正規化データを表示 |
| data | bitcambio | Bitcambio API | ブラジル取引所の公開アセット情報を確認 |
| data | bitcoincharts | BitcoinCharts | BitcoinChartsのマーケット一覧JSONを表示 |
| data | block-lottos | Block Lottos | オンチェーン抽選サービスのOpenAPI定義を表示 |
| data | btcnode-uk | btcnode.uk | Bitcoinデータとx402課金エンドポイントのURLを確認 |
| data | coincap | CoinCap | 暗号資産の価格・時価総額・取引所データを取得 |
| data | coindesk-bpi | CoinDesk BPI | Bitcoin Price Index系JSONを確認 |
| data | coingecko | CoinGecko API | BTC/ETHの複数通貨建て価格を取得 |
| data | coinlore | CoinLore | 公開ティッカーAPIから価格・出来高を一覧表示 |
| data | coinpaprika | Coinpaprika | 暗号資産マーケットデータをティッカー形式で表示 |
| data | coinstats | CoinStats | 暗号資産トラッカーAPIをキー入力式で確認 |
| data | cryptapi | CryptAPI | 暗号資産決済APIの公開情報エンドポイントを確認 |
| data | cryptingup | CryptingUp | 取引ペアやマーケットデータを取得 |
| data | cryptocompare | CryptoCompare | BTC/ETHの価格を複数通貨で比較 |
| data | cryptonator | Cryptonator | 暗号資産為替レートAPIを確認 |
| data | gemini | Gemini REST API | Gemini取引所の公開マーケットデータを取得 |
| data | localbitcoins | LocalBitcoins | 旧P2P取引API資料とサンプルデータを確認 |
| data | mempool-space | Mempool.space | Bitcoinの推奨手数料を取得 |
| data | mercado-bitcoin | Mercado Bitcoin | BTC/BRLの公開ティッカーを確認 |
| data | messari | Messari API | Messariの暗号資産データAPIをキー入力式で確認 |
| data | nexchange | Nexchange | 自動暗号資産交換サービスの通貨情報を確認 |
| data | solana-json-rpc | Solana JSON RPC | Solana JSON-RPCへPOSTしてヘルスチェック |
| data | zmok-ethereum-rpc | ZMOK | Ethereum JSON-RPCプロバイダーURLを入力して確認 |
| data | ai-dev-jobs | AI Dev Jobs | AI/MLエンジニア求人APIのOpenAPI定義を確認 |
| data | arbeitnow | Arbeitnow | Europe/Remote求人をキーワードで絞り込んで表示 |
| data | devitjobs-uk | DevITjobs UK | UK開発者求人のXMLフィードを読み込んで表示 |
| data | graphql-jobs | GraphQL Jobs | GraphQL求人APIへクエリをPOSTして確認 |
| data | open-skills | Open Skills | 職種名やスキル名の候補を検索 |
| data | deepcode-ai | DeepCode AI | AIコードレビューサービスの公開情報を確認 |
| data | exude-api | EXUDE-API | 英文テキストのストップワード除去を試す |
| data | not-human-search | Not Human Search | AIツール探索APIのOpenAPI定義を確認 |
| data | openvisionapi | OpenVisionAPI | 画像URLを渡すコンピュータビジョンAPIを確認 |
| data | tensorfeed | TensorFeed | AIニュース・モデル情報・サービス状態を取得 |
| tools | currency_converter | ExchangeRate-API | 通貨換算 |
| tools | calendar | Public Holidays API | 祝日付きカレンダー表示 |
| tools | caldays | CalDays API | APIキー入力式の祝日APIリクエスト確認 |
| tools | church-calendar | Church Calendar API | カトリック典礼暦の日付情報表示 |
| tools | czech-namedays | Svátky API | チェコ語・スロバキア語の名前日検索 |
| tools | hebcal-converter | Hebcal Developer APIs | グレゴリオ暦からヘブライ暦への変換 |
| tools | lectserve | LectServe | プロテスタント系朗読暦の見出し表示 |
| tools | nager-date | Nager.Date | 国コードと年から世界各国の祝日一覧を取得 |
| tools | namedays-calendar | International Nameday API | 国別の名前日を月日から検索 |
| tools | icsdb-non-working-days | icsdb | GitHub上の非稼働日ICSファイル候補を一覧 |
| tools | isdayoff | isDayOff | 稼働日・休日・短縮日のコード判定 |
| tools | russian-calendar | work-calendar | ロシア稼働日判定サービス実装例の確認 |
| tools | the-calendar-api | The Calendar | カレンダーJSONのURL組み立てと取得確認 |
| tools | uk-bank-holidays | GOV.UK Bank Holidays | 英国地域別バンクホリデーJSON表示 |
| tools | time | ローカル時刻 | 現在時刻の表示 |
| tools | kawase | exchangerate.host | 為替レート |
| tools | QR | QR Server (goQR) | QRコード生成 |
| tools | file-io | file.io | ファイルや短文の一時共有リンク生成 |
| tools | fileup | FileUp | 期限と閲覧回数を指定したファイル共有 |
| tools | pantry | Pantry | JSONをクラウドのバスケットに保存・取得 |
| tools | null-pointer | The Null Pointer (0x0.st) | ファイルやURLの使い捨て共有リンク生成 |
| tools | apicagent-checker | ApicAgent | User-Agent文字列から端末情報を解析 |
| tools | apis-guru-catalog | APIs.guru | 公開API定義の検索・一覧取得 |
| tools | beeceptor | Beeceptor | モックAPIの送受信テスト |
| tools | bored-tools | Bored | ランダムな退屈しのぎ提案 |
| tools | cdnjs-finder | CDNJS | CDN上のライブラリ情報検索 |
| tools | changelogs-md-checker | Changelogs.md | changelogメタデータの到達性確認 |
| tools | cloudflare-trace-tools | Cloudflare Trace | 接続情報とtrace文字列の表示 |
| tools | codex | CodeX | オンラインコンパイラの公開情報確認 |
| tools | genngohonnyaku | ローカル辞書(サンプル) | 日本語↔英語の簡易翻訳 |
| tools | tizu | Leaflet / OpenStreetMap | 地図表示とクリック位置マーカー追加 |
| tools | zipcode | ZipCloud API | 郵便番号から住所検索 |
| tools | postman-echo | Postman Echo | GETパラメータを返すテストAPIでリクエスト検証 |
| tools | purgomalum | PurgoMalum | 入力テキストの不適切語を検出・置換 |
| tools | beeceptor-echo | Beeceptor HTTP Echo | HTTPリクエストを送信しエコー内容を確認 |
| tools | brewpage | BrewPage API | HTML投稿で共有URLを取得（失敗時はcurl手順を表示） |
| tools | ciprand | Ciprand | セキュアなランダム文字列をAPIまたはWeb Cryptoで生成 |
| tools | passwordinator | Passwordinator | 条件を指定してランダムパスワードを生成 |
| tools | codex-compiler | CodeX | オンラインコンパイラAPIへのリクエスト形状を確認 |
| tools | cors-proxy | CORS Proxy | CORS回避用プロキシURLを生成し取得を試行 |
| tools | countapi | CountAPI | 名前空間とキーでシンプルなカウンターを操作 |
| tools | extendsclass-json-storage | ExtendsClass JSON Storage | JSON保存API候補を試し、失敗時はlocalStorageに保存 |
| tools | http2-pro | HTTP2.Pro | 指定URLのHTTP/2対応チェックAPI候補を試行 |
| tools | httpbin | Httpbin | HTTPリクエスト/レスポンス検証用APIを試す |
| tools | httpbin-cloudflare | Httpbin Cloudflare | Cloudflare版Httpbin互換API候補でGET echoを確認 |
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
| tools | kroki | Kroki | Mermaidなどのテキスト図を画像化 |
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


