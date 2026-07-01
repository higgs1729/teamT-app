# fronted-v2 — WebAPI 紹介サイト

http://10.15.121.30:5500/fronted-v2/index.html

`templates/` に置かれた各メンバー作成の **外部 WebAPI 紹介ページ（自己完結型 HTML）** を、
1つのサイトから選択して表示できるギャラリーです。素の HTML/CSS/JS のみで動作し、ビルドは不要です。

## 特徴

- **サイドバー ＋ ビューア構成**：左の一覧から API を選ぶと、右の `<iframe>` に該当ページを表示
- **カテゴリ別一覧 ＋ 検索**：画像系／データ系／為替・ツール系／おもしろ系に分類、キーワード絞り込み対応
- **テーマ＋アクセント切替**：テーマ（ライト／ダーク）とアクセント色（オレンジ／青）を独立して選択。アクセントを変えても背景色は変わらない。選択は `localStorage` に保存
- **URLハッシュ連携**：`...#dog-api` のように選択状態を共有・リロード復元できる
- テンプレート本体は**改変せず** `../templates/` を参照（単一の正）

UI デザインは `design-spec-studio` の `ui_mockup.html` のデザインシステムに準拠しています。

## 構成

```
fronted-v2/
├── index.html        # サイドバー + ヘッダー + iframe ビューアの骨格
├── css/
│   └── style.css     # デザインシステム（テーマ変数・レイアウト・部品）
├── js/
│   ├── catalog.js    # テンプレート一覧メタデータ（window.CATALOG）。一覧の定義元
│   └── app.js        # 描画・検索・iframe切替・テーマ・ハッシュ連携
└── README.md
```

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

```
templates/...
```

1. 該当ジャンルの `../templates/<ジャンル>/` に自己完結型の HTML を追加する
2. `js/catalog.js` の `window.CATALOG` に1要素追加する（`id` / `file` / `title` / `category` / `description` / `apiName` / `apiUrl` / `icon`）
   - `file` は `templates/` からの相対パス（例 `image/dog-api.html`）
   - `icon` は [Tabler Icons](https://tabler.io/icons) のクラス名（例 `ti-dog`）。※フォントに存在しないクラスを指定すると空白表示になるため注意
   - `category` は上記4ジャンルのいずれか（末尾の「系」は見出しでは省略表示）

サイドバーは `CATALOG` の並び順・`category` 単位で自動グルーピングされます。
