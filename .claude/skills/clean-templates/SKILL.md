---
name: clean-templates
description: templates/ 直下にフォルダ分けされていない HTML を、ジャンル別フォルダ(image/data/tools/fun)へ整理し、fronted-v2 のカタログに反映する。/clean-templates のときに使う。
---

# clean-templates

`templates/` 直下に置かれた未分類の `*.html`（各メンバーが追加した WebAPI 紹介ページ）を
ジャンル別サブフォルダへ整理し、`fronted-v2` の一覧（サイドバー）に反映するタスク。

## 前提となる構成

```
templates/
├── image/   画像・ビジュアル系   （動物・キャラ・写真など画像を表示する）
├── data/    データ・検索系       （検索/一覧/詳細データ。書籍・ゲーム・音楽・宇宙・ランダムデータ等）
├── tools/   為替・ツール系       （入力→出力の実用ツール。通貨換算・QR・翻訳など）
└── fun/     エンタメ・おもしろ系 （ジョーク・雑学・クイズ・名言・Yes/No など）
```

一覧の定義元は `fronted-v2/js/catalog.js`（`window.CATALOG` 配列）。
iframe は `../templates/<file>` を読む（`file` は `templates/` からの相対パス）。

## 手順

1. **未分類ファイルを検出**
   - `templates/` 直下（サブフォルダを除く）にある `*.html` を列挙する。
   - なければ「未分類なし」と報告して終了。

2. **各ファイルを分類**
   - `<title>` と `fetch(` / `http(s)://` / 利用APIを確認して内容を把握する。
   - 上表のルーブリックに従い image / data / tools / fun のいずれかに割り当てる。
   - 迷う場合: 画像出力なら image、検索・一覧・データ取得なら data、入力→変換ツールなら tools、笑い・雑学・意思決定なら fun。
   - 外部APIを使わずローカルデータで動くサンプルもあり得る（その場合 apiName は「ローカルデータ」等）。

3. **内容の軽微な修正**（あれば）
   - 先頭/末尾に紛れ込んだ Markdown コードフェンス（` ```html ` / ` ``` `）など、表示を壊す明らかな混入を除去する。
   - テンプレート本体のロジックは書き換えない。

4. **フォルダへ移動**
   - git 追跡下なら履歴保持のため `git mv templates/<file>.html templates/<genre>/<file>.html`。
   - 未追跡なら通常の移動でよい。

5. **カタログへ反映**（`fronted-v2/js/catalog.js`）
   - 対応するジャンルのセクションに1要素追加:
     `{ id, file, title, category, description, apiName, apiUrl, icon }`
     - `id`: 一意なキー（ファイル名/タイトル由来のkebab）。既存と重複させない。
     - `file`: `"<genre>/<filename>.html"`。
     - `category`: 4ジャンルの正式名（末尾「系」付き。見出しでは自動で「系」を省いて表示）。
     - `apiUrl`: 公式/参考URL。ローカルデータのサンプルは `""` でよい（UIには非表示）。
     - `icon`: **Tabler Icons のクラス名**。必ず実在するものを使う（下記参照）。

6. **アイコンの実在チェック（重要）**
   - `@tabler/icons-webfont` に存在しないクラスは空白表示になる。
   - 静的サーバ起動後、ブラウザで次を評価し `content` が `none` でないことを確認する:
     ```js
     const i=document.createElement('i'); i.className='ti '+cls; document.body.appendChild(i);
     const ok = getComputedStyle(i,'::before').content !== 'none'; i.remove();
     ```
   - 過去に存在しなかった例: `ti-mood-laugh`, `ti-solar-system`, `ti-comedy-mask`, `ti-orbit`。
   - 実在する代表例: `ti-book` `ti-user` `ti-trophy` `ti-article` `ti-language` `ti-quote` `ti-globe` `ti-tools-kitchen-2` `ti-mood-crazy-happy`。

7. **動作確認**
   - リポジトリルートで `node fronted-v2/serve.cjs`（またはプレビュー）を起動。
   - `http://localhost:5500/fronted-v2/index.html` を開き、次を確認:
     - サイドバー件数 = カタログ件数（ウェルカムの件数表示も一致）。
     - 移動した各 `../templates/<genre>/<file>.html` が 200 で読める。
     - 全アイコンが実在（欠けなし）。
     - コンソールエラーなし。

8. **ドキュメント更新**（CLAUDE.md 準拠）
   - `docs/specification.md` の「templates/ 各ページが利用する外部API」表に新規ページを追記。
   - 追加ジャンルやフォルダが増えた場合は `README.md`・`fronted-v2/README.md` の構成図も更新。

## 注意
- テンプレートは表示崩れの修正を除き**改変しない**（iframe でそのまま見せる）。
- 既存の分類・id・並び順はできるだけ壊さない。追加は各ジャンルセクションの末尾へ。
