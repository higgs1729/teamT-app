# teamT-app 

チームTによる最終課題アプリケーションです。

## アプリ概要

> 決定後に記入してください（`docs/specification.md` を参照）

## コマンドについて
/<コマンド名> のプロンプトがあった場合以下のファイルを参照して処理を実行
(.claude/skills/<コマンド名>)

## 仕様書

詳細な仕様は [`docs/specification.md`](docs/specification.md) を参照してください。

## 開発体制

- 各メンバーが仕様を把握できるよう、`docs/specification.md` に仕様をまとめています
- リーダー（竹内）が全体の統合・レビューを担当します

| 担当 | 役割 | 使用AI |
|------|------|--------|
| 竹内（リーダー） | 設計・統合・レビュー | Claude |
| 〇〇 | フロントエンド | 〇〇 |
| 〇〇 | フロントエンド | 〇〇 |
| 〇〇 | バックエンド | 〇〇 |
| 〇〇 | バックエンド | 〇〇 |
| 〇〇 | テスト・発表資料 | 〇〇 |

## セットアップ手順

`docs/setup-guide.md`を参照

## ディレクトリ構成

```
src/
├── main/
│   ├── java/com/example/app/
│   │   ├── controller/     # APIエンドポイント
│   │   ├── service/        # 処理のロジック
│   │   ├── model/          # データクラス
│   │   └── config/         # 設定クラス
│   └── resources/
│       ├── templates/      # HTMLテンプレート
│       ├── static/
│       │   ├── css/
│       │   └── js/
│       └── application.properties.example
└── test/
    └── java/               # テストコード
docs/
└── specification.md        # 仕様書
templates/                  # 各メンバー作成の外部WebAPI紹介ページ(自己完結型HTML)。ジャンル別に整理
├── image/                  #   画像・ビジュアル系
├── data/                   #   データ・検索系
├── tools/                  #   為替・ツール系
└── fun/                    #   エンタメ・おもしろ系
fronted-v2/                 # WebAPI紹介サイト(templatesを選択表示するギャラリー / 素のHTML/CSS/JS)
```
- 追加でresources/application.propertiesを各自ローカルで作成し管理

### fronted-v2（WebAPI紹介サイト）

`templates/`内の各WebAPI紹介ページを一覧から選択して表示できるギャラリーサイト。ビルド不要。
リポジトリルートで`node fronted-v2/serve.cjs`を実行し、`http://localhost:5500/fronted-v2/index.html`を開く（停止は Ctrl+C）。
起動・停止の詳細は[`fronted-v2/README.md`](fronted-v2/README.md)を参照。

## ブランチ命名規則

```
feature/機能名     # 新機能（例：feature/weather-api）
fix/バグ名         # バグ修正（例：fix/null-pointer-error）
```
