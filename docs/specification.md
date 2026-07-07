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
  - 構成: サイドバー（ブランド / 検索 / 階層カテゴリ別一覧 / 下部にアカウント・設定ボタン）＋ メイン（最小限のヘッダー=サイドバー表示切替ボタンのみ ＋ iframeビューア）
  - 設定モーダル: 左ナビ（検索 + アカウント / 外観 / その他）＋ 右コンテンツ。サイドバー下部の「設定」「アカウント」から開く
    - アカウント: 表示名（localStorageに保存、サーバー認証なしのデモ）
    - 外観: テーマ(ライト/ダーク)とアクセント色(オレンジ/青)を独立して切替（アクセント変更で背景は不変）
    - その他: 収録API数・サイト情報・設定リセット
  - 一覧クリックで該当HTMLをiframe表示。検索・URLハッシュ復元に対応
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
    - 小分類例: 動物画像 / アート・デザイン / 3D・アバター / キャラクター画像 / アニメ・カード / ゲーム・キャラクター / 宇宙・天気 / 乗り物・交通 / ネットワーク・セキュリティ / 企業・公共データ / 金融・マーケット / ブロックチェーン・市場 / 日付・時刻 / 通貨・為替 / 地図・住所 / 翻訳・言語 / ジョーク・雑学 / クイズ・ゲーム / 意思決定・名言
    - 設計判断: Chainlink / Chainpoint / Helium / Steem / TWZRD Agent Intel / Walltime は、暗号資産・分散ネットワーク・市場情報を横断するため、既存の「金融・マーケット」ではなく `["データ・検索系", "ブロックチェーン・市場"]` にまとめる。APIキーやCORS制限があるサービスはキー入力欄を持ち、失敗時は仕様理解用のサンプル表示にフォールバックする。
    - 設計判断: MarkerAPI / Pick an Agency / Tenders Guru は企業・商標・公共調達の検索データであり、国・地域の基礎情報とは用途が異なるため `["データ・検索系", "企業・公共データ"]` にまとめる。DomainsDB はドメイン調査用途のため既存の `["データ・検索系", "ネットワーク・セキュリティ"]` に置く。

---

## 4. 機能一覧

機能名 : 説明


---

## 5. API・外部サービス

- キー管理はapplication.properties

サービス名 : 用途 

### 無料WebAPI候補台帳

`docs/apis/free-webapis-not-implemented.md` に、Public APIs の公開一覧から `Auth = No` のAPIを抽出し、既存 `fronted-v2/js/catalog.js` に未収録の候補を整理する。HTML化時は公式URLで現在の無料利用条件・CORS・エンドポイント仕様を再確認する。

### WebAPI紹介ページ作成スキル

`.agents/skills/webapi-page-maker/` は、複数のAPIドキュメントURLから `templates/` の自己完結HTML、`fronted-v2/js/catalog.js`、仕様書の外部API表を整合させて追加するためのプロジェクト専用スキル。新規API紹介ページをURLから作る場合は `$webapi-page-maker <URL...>` を使う。

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
| data | applemusic | iTunes Search API | 楽曲検索 |
| data | countrySearch | CountriesNow API | 国名から人口・首都を検索 |
| data | domainsdb | DomainsDB API | 登録済みドメイン名をキーワード検索 |
| data | markerapi | MarkerAPI | USPTO商標データを認証情報入力式で検索 |
| data | pick-an-agency | Pick an Agency API | サービスと地域からマーケティング代理店を検索 |
| data | tenders-guru-hu | Tenders Guru API | ハンガリーの公共調達データを取得 |
| data | tenders-guru-pl | Tenders Guru API | ポーランドの公共調達データを取得 |
| data | tenders-guru-ro | Tenders Guru API | ルーマニアの公共調達データを取得 |
| data | tenders-guru-es | Tenders Guru API | スペインの公共調達データを取得 |
| data | tenders-guru-ua | Tenders Guru API | ウクライナの公共調達データを取得 |
| data | ip | ローカルサンプルデータ | IPジオロケーション情報の表示サンプル |
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
| data | weather | 気象庁 予報JSON | 都道府県ごとの天気予報を取得 |
| data | utyu | NASA NeoWs | 近地天体(NEO)観測データ |
| data | wakusei | ローカルデータ(サンプル) | 太陽系の惑星情報 |
| data | burogu | JSONPlaceholder | ダミー記事のランダム表示 |
| data | game | RAWG API | 高評価ゲーム一覧 |
| data | hon | Open Library | 書籍・漫画検索 |
| data | index | Random User Generator | ランダムなプロフィール生成 |
| data | Cars | NHTSA Vehicle API / Wikipedia API / Argos Translate | メーカーとモデルを選んで車両情報と画像を検索 |
| data | Yugio | YGOPRODeck API / MyMemory Translation API | 遊戯王カードを検索して詳細表示 |
| tools | currency_converter | ExchangeRate-API | 通貨換算 |
| tools | calendar | Public Holidays API | 祝日付きカレンダー表示 |
| tools | time | ローカル時刻 | 現在時刻の表示 |
| tools | kawase | exchangerate.host | 為替レート |
| tools | QR | QR Server (goQR) | QRコード生成 |
| tools | genngohonnyaku | ローカル辞書(サンプル) | 日本語↔英語の簡易翻訳 |
| tools | tizu | Leaflet / OpenStreetMap | 地図表示とクリック位置マーカー追加 |
| tools | zipcode | ZipCloud API | 郵便番号から住所検索 |
| fun | joke | Official Joke API | 海外ジョーク |
| fun | animechan | Animechan API | アニメ引用をランダム取得して表示 |
| fun | anime-facts | Anime Facts REST API | アニメ作品の雑学と画像を取得 |
| fun | ohuzake | Useless Facts | ランダム雑学 |
| fun | OpenTrivia | Open Trivia DB | クイズ |
| fun | tai | Quotable API | 英文お題を使ったタイピングゲーム |
| fun | YesNo | yesno.wtf | Yes/No判定 |
| fun | meigenn | ローカルデータ(サンプル) | 名言をランダム表示 |
| fun | Useless | Useless Facts / MyMemory Translation API / Unsplash Source | ランダム雑学を翻訳付きで表示 |

※ 翻訳に MyMemory Translation API を併用するページあり（joke / ohuzake / Jikan / OpenTrivia / Yugio）。Cars は Argos Translate を併用。Useless は MyMemory Translation API と Unsplash Source を併用。NASA系・RAWG(game)はAPIキーが必要。wakusei / meigenn / genngohonnyaku は外部APIを使わないローカルデータのサンプル。

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


