# fronted-v2 — WebAPI 紹介サイト

http://10.15.121.30:5500/fronted-v2/index.html

`templates/` に置かれた各メンバー作成の **外部 WebAPI 紹介ページ（自己完結型 HTML）** を、
1つのサイトから選択して表示できるギャラリーです。素の HTML/CSS/JS のみで動作し、ビルドは不要です。

## 特徴

- **サイドバー ＋ ビューア構成**：左の一覧から API を選ぶと、右の `<iframe>` に該当ページを表示
- **階層カテゴリ別一覧 ＋ 検索**：画像系／データ系／為替・ツール系／おもしろ系を大分類にし、動物画像・宇宙/天気・通貨/為替・ファイル共有/保存・開発/検証などの小分類まで折りたたみ表示。公開データ系は必要に応じて 食品・生活 / 統計・公的データ / 都市・オープンデータ も追加する。キーワード絞り込み対応
- **設定モーダル**：サイドバー下部の「設定」「アカウント」から開く。左ナビ（検索＋アカウント／外観／その他）構成
  - 外観：テーマ（ライト／ダーク、ミニプレビュー付きカードから選択）とアクセント色（indigo／violet／cyan／emerald／amber、色ドット付きチップ＋反映プレビューカードから選択）を独立して選択（アクセントを変えても背景は不変）。react-shadcn の `studio-portfolio/settings-page.tsx`（ThemePreview/AccentPreview）相当のUI
  - アカウント：表示名を `localStorage` に保存（サーバー認証なしのデモ）
  - 設定内容（テーマ／アクセント／表示名）は `localStorage` に保存
- **URLハッシュ連携**：`...#dog-api` のように選択状態を共有・リロード復元できる
- **ゲーム要素**（`js/game.js`）：API紹介ページを見るとヘッダーに進捗バーが出現し、ページ内のボタン等をクリックするたびに20%ずつ上がる（自動検知・専用ボタンはなし）。100%で経験値100を獲得＝アカウントレベルが上がる（必要経験値も100）。サイドバーのキャラクターボタン（現在のキャラ名とレベルを表示）からステータス（体力/攻撃力/防御力）・ルーン・キャラ名変更を確認でき、「旅に出る」で全10ステージ（5・10がボス）に挑戦。クリアごとにルーン（体力/攻撃力/防御力 +5〜50%）を1つ獲得（装備枠4）。※戦闘の中身は未実装。状態は `localStorage` に保存
- テンプレート本体は**改変せず** `../templates/` を参照（単一の正）

UI デザインは react-shadcn（`app/dashboard-01` の inset シェル + shadcn/ui デザイントークン）に準拠しています。React は導入せず、`css/tokens.css` と `css/style.css` に素の CSS で移植しています。サイドバーのナビツリー（`js/app.js` が描画）も shadcn の Sidebar コンポーネント群（SidebarGroup/SidebarMenu/SidebarMenuItem/SidebarMenuButton/SidebarMenuSub）相当の ul/li/button 構造で出力しています。

## 構成

```
fronted-v2/
├── index.html        # サイドバー + ヘッダー + iframe ビューアの骨格
├── css/
│   ├── tokens.css    # react-shadcn から移植したデザイントークン（テーマ/アクセント）
│   ├── style.css     # アプリシェル（dashboard-01 の inset レイアウトを素のCSSで再現）
│   └── game.css      # ゲーム要素のスタイル
├── js/
│   ├── catalog.js    # テンプレート一覧メタデータ（window.CATALOG）。一覧の定義元
│   ├── app.js        # 描画・検索・iframe切替・テーマ・アカウント・設定モーダル
│   └── game.js       # ゲーム要素（進捗/経験値/レベル/キャラ/ステージ/ルーン）
└── README.md
```

### ゲームのバランス調整

ゲームの数値（経験値量・レベル成長・ステージ数・ルーン効果範囲など）は `js/game.js` 冒頭の
`CONFIG` に集約しています。調整はここだけを編集すれば完結します。app.js とは疎結合で、
API表示の通知だけ `CustomEvent("apipage:shown")` で受け取ります。

## ローカルサーバーの起動・停止

Node.js だけで動く簡易サーバー（`serve.cjs`）

### 起動

リポジトリのルート（`teamT-app`）でターミナルを開き、次を実行します。

```bash
node fronted-v2/serve.cjs
```

起動するとURLが表示されるので、ブラウザで開きます:
<http://localhost:5500/fronted-v2/index.html>

### 停止

起動したターミナルで **Ctrl + C** を押します。

### 補足

- ポート 5500 が使用中の場合は、ポートを指定して起動できます: `node fronted-v2/serve.cjs 8080`
- `file://` で HTML を直接開くと一部 API が CORS で失敗し `../templates/` も解決できないため、必ず上記のサーバー経由で開いてください。
- `serve.cjs` は自動的に1つ上の階層（リポジトリルート）を配信ルートにします。実行ディレクトリがルートでなくてもパス指定で動きます（例: `node ./fronted-v2/serve.cjs`）。

## LAN内で共有する（同じネットワークのチームに見せる）

`serve.cjs` は全ネットワークインターフェースで待ち受けるため、**同一LAN内の端末**からも閲覧できます。
外部公開（インターネット公開）はしません。社内ネットワーク内で完結する共有方法です。

### 手順

1. 共有する人が、いつも通りサーバーを起動します。

   ```bash
   node fronted-v2/serve.cjs
   ```

2. 起動時に表示される **「同じLAN内のチームメンバー」のURL** を共有

3. 同じネットワークにつないだ各メンバーが、ブラウザでそのURLを開きます。

## テンプレートを追加するには

テンプレートはジャンル別のサブフォルダに整理されています。
候補台帳から追加する場合は、プロジェクトスキル `.agents/skills/webapi-page-maker/`（`$webapi-page-maker (<fileNumber>,<topDown>)`）を使うと、HTML・カタログ・仕様書更新・実装済み候補行の削除をまとめて進められます。`topDown` は `true` のとき上から順、`false` のとき下から順です。このスキル使用時は `no-test` を適用し、検証は行いません。

```
templates/...
```

1. 該当ジャンルの `../templates/<ジャンル>/` に自己完結型の HTML を追加する
2. `js/catalog.js` の `window.CATALOG` に1要素追加する（`id` / `file` / `title` / `category` / `categoryPath` / `description` / `apiName` / `apiUrl` / `icon`）
   - `file` は `templates/` からの相対パス（例 `image/dog-api.html`）
   - `icon` は [Tabler Icons](https://tabler.io/icons) のクラス名（例 `ti-dog`）。※フォントに存在しないクラスを指定すると空白表示になるため注意
   - `category` は後方互換用の大分類名。既存の大分類（画像・ビジュアル系／データ・検索系／為替・ツール系／エンタメ・おもしろ系）のいずれかを指定
   - `categoryPath` はサイドバー用の階層分類。例: `["データ・検索系", "宇宙・天気"]`

サイドバーは `CATALOG` の並び順・`categoryPath` 単位で自動グルーピングされます。`categoryPath` がない古い項目は `category` だけの分類として表示されます。
# サイドバー構成メモ

サイドバーは、検索欄の下に「おすすめ一覧」を表示し、その下に「ジャンルごとのAPI」の階層カテゴリ一覧、最後に footer（キャラクター・アカウント操作）を配置します。おすすめ一覧は `fronted-v2/js/app.js` の固定IDリストから `CATALOG` の実在項目を抜粋して描画します。
