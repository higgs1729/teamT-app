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
  - 構成: サイドバー（ブランド / 検索 / カテゴリ別一覧 / 下部にアカウント・設定ボタン）＋ メイン（最小限のヘッダー=サイドバー表示切替ボタンのみ ＋ iframeビューア）
  - 設定モーダル: 左ナビ（検索 + アカウント / 外観 / その他）＋ 右コンテンツ。サイドバー下部の「設定」「アカウント」から開く
    - アカウント: 表示名（localStorageに保存、サーバー認証なしのデモ）
    - 外観: テーマ(ライト/ダーク)とアクセント色(オレンジ/青)を独立して切替（アクセント変更で背景は不変）
    - その他: 収録API数・サイト情報・設定リセット
  - 一覧クリックで該当HTMLをiframe表示。検索・URLハッシュ復元に対応
  - 設計判断: 素のHTML/CSS/JS（ビルド不要）。テンプレートは改変せず`../templates/`をiframe参照（単一の正）。
    UIは`design-spec-studio`の`ui_mockup.html`のデザインシステムに準拠。一覧データは`fronted-v2/js/catalog.js`に集約。

---

## 4. 機能一覧

機能名 : 説明


---

## 5. API・外部サービス

- キー管理はapplication.properties

サービス名 : 用途 

### templates/ 各ページが利用する外部API（fronted-v2で紹介）

`templates/` はジャンル別フォルダ（`image/` 画像・ビジュアル系、`data/` データ・検索系、`tools/` 為替・ツール系、`fun/` エンタメ・おもしろ系）に整理。

| ジャンル | ページ | 外部API | 用途 |
|----------|--------|---------|------|
| image | dog-api | Dog API (dog.ceo) | 犬の画像・犬種一覧 |
| image | 3D | Three.js GLTF サンプル | ランダムな3Dモデルを読み込み・閲覧 |
| image | cat-api | The Cat API | 猫の画像・猫種データ |
| image | Fox | RandomFox | キツネ画像 |
| image | neko | HTTP Cat | HTTPステータスを猫画像で表示 |
| image | Necos | Nekos.best | ネコミミ画像 |
| image | Waifu | Waifu.im | アニメキャラ画像 |
| image | kamo | Random-d.uk | アヒル画像 |
| image | food | Wikipedia API | 料理名で画像検索 |
| data | anime / Jikan | Jikan API | アニメ検索・一覧 |
| data | Poke | PokeAPI | ポケモン情報 |
| data | akusyonn | FreeToGame | 無料ゲーム一覧 |
| data | applemusic | iTunes Search API | 楽曲検索 |
| data | nasa | NASA APOD | 今日の天体写真 |
| data | utyu | NASA NeoWs | 近地天体(NEO)観測データ |
| data | wakusei | ローカルデータ(サンプル) | 太陽系の惑星情報 |
| data | burogu | JSONPlaceholder | ダミー記事のランダム表示 |
| data | game | RAWG API | 高評価ゲーム一覧 |
| data | hon | Open Library | 書籍・漫画検索 |
| data | index | Random User Generator | ランダムなプロフィール生成 |
| tools | currency_converter | ExchangeRate-API | 通貨換算 |
| tools | calendar | Public Holidays API | 祝日付きカレンダー表示 |
| tools | time | ローカル時刻 | 現在時刻の表示 |
| tools | kawase | exchangerate.host | 為替レート |
| tools | QR | QR Server (goQR) | QRコード生成 |
| tools | genngohonnyaku | ローカル辞書(サンプル) | 日本語↔英語の簡易翻訳 |
| fun | joke | Official Joke API | 海外ジョーク |
| fun | ohuzake | Useless Facts | ランダム雑学 |
| fun | OpenTrivia | Open Trivia DB | クイズ |
| fun | YesNo | yesno.wtf | Yes/No判定 |
| fun | meigenn | ローカルデータ(サンプル) | 名言をランダム表示 |

※ 翻訳に MyMemory Translation API を併用するページあり（joke / ohuzake / Jikan / OpenTrivia）。NASA系・RAWG(game)はAPIキーが必要。wakusei / meigenn / genngohonnyaku は外部APIを使わないローカルデータのサンプル。

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
- Protected pages: all routes except authentication pages, static assets, and the H2 console require login.
- User data is stored in the `users` table through Spring Data JPA.
- Passwords are stored as BCrypt hashes. Plain text passwords must never be saved.
- Email addresses are unique and are used as the login identifier.
- Default role for newly registered users: `USER`.
- Development DB: H2 in-memory database. A production DB can replace this by changing `application.properties`.

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
