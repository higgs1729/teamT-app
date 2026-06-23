# CLAUDE.md - チーム開発プロジェクト共有設定

## プロジェクト概要

- **アプリ名**：〇〇〇〇（チームで決定後に記入）
- **チーム人数**：6人
- **GitHubリポジトリ**：https://github.com/higgs1729/teamT-app

---

## 🤖 AI支援開発体制

このプロジェクトはチームメンバー全員がAIアシスタントを活用して開発します。

- **竹内（リーダー）→ Claude**（このファイルを読んでいるAI）
- 他のメンバーはそれぞれ異なるAIを使用

### Claudeへの指示

- 仕様の詳細は必ず `docs/specification.md` を参照すること
- 実装前に仕様書に該当する機能が記載されているか確認すること
- 仕様書に未記載の設計判断をした場合は `docs/specification.md` に追記すること
- 他のAIが書いたコードと整合性が取れるよう、既存コードを必ず確認してから実装すること
- コーディング規約（下記）を厳守すること

---

## 👥 担当分け

| 名前 | 役割 | 担当ディレクトリ |
|------|------|----------------|
| 竹内（リーダー） | 設計・統合・レビュー | 全体 |
| 〇〇 | フロントエンド | `/src/main/resources/templates/` |
| 〇〇 | フロントエンド | `/src/main/resources/templates/` |
| 〇〇 | バックエンド | `/src/main/java/.../service/`, `/controller/` |
| 〇〇 | バックエンド | `/src/main/java/.../service/`, `/controller/` |
| 〇〇 | テスト・発表資料 | `/src/test/` |

---

## 📁 ディレクトリ構成

```
src/
├── main/
│   ├── java/com/example/app/
│   │   ├── controller/     # APIエンドポイント（バックエンド担当）
│   │   ├── service/        # ビジネスロジック（バックエンド担当）
│   │   ├── model/          # データクラス
│   │   └── config/         # 設定クラス
│   └── resources/
│       ├── templates/      # HTMLファイル（フロントエンド担当）
│       ├── static/
│       │   ├── css/        # スタイルシート
│       │   └── js/         # JavaScriptファイル
│       └── application.properties
└── test/
    └── java/               # テストコード（テスト担当）
```

---

## 📏 コーディング規約

### 命名規則
- クラス名：`PascalCase`（例：`WeatherController`）
- メソッド名・変数名：`camelCase`（例：`getWeatherData`）
- 定数：`UPPER_SNAKE_CASE`（例：`API_BASE_URL`）
- HTMLファイル名：`kebab-case`（例：`weather-detail.html`）

### コメント
- クラスとpublicメソッドには必ずJavadocを書く(日本語で)
- TODO・FIXMEコメントは必ず名前を添える（例：`// TODO(山田): エラー処理追加`）

### その他
- 1メソッドは50行以内を目安にする
- APIキーは`application.properties`に書き、Gitにはコミットしない（`.gitignore`で除外）
- マジックナンバーはstaticな定数として定義する

---

## Git運用ルール

### ブランチ命名規則
```
feature/機能名     # 新機能（例：feature/weather-api）
fix/バグ名         # バグ修正（例：fix/null-pointer-error）
```

---

## 🔐 APIキーの管理

**絶対にAPIキーをGitにコミットしない！**

`application.properties`（Gitに含めない）に記述：
```properties
weather.api.key=YOUR_KEY_HERE
maps.api.key=YOUR_KEY_HERE
```

`.gitignore`に必ず追加：
```
application.properties
*.env
```

代わりに`application.properties.example`（ダミー値）をGitに含める。

