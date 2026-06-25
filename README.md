# teamT-app 

チームTによる最終課題アプリケーションです。

## アプリ概要

> 決定後に記入してください（`docs/specification.md` を参照）

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
```
- 追加でresources/application.propertiesを各自ローカルで作成し管理

## ブランチ命名規則

```
feature/機能名     # 新機能（例：feature/weather-api）
fix/バグ名         # バグ修正（例：fix/null-pointer-error）
```
