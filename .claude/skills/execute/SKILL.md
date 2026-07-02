---
name: execute
description: Spring Boot バックエンドと fronted-v2 静的サイトの両方を起動して動作確認できる状態にする。/execute のときに使う。
---

# execute

このプロジェクトは2つの独立したサーバーで構成されている:

- `springboot` — Spring Boot バックエンド（認証・API本体）。ポート `8080`。
- `static` — fronted-v2（WebAPI紹介ギャラリー、Node製の静的サーバー）。ポート `5500`。

両方の設定は [`.claude/launch.json`](../../launch.json) に定義済み。

## 手順

1. `preview_start` で `springboot` を起動する。
2. `preview_start` で `static`（fronted-v2）を起動する。
   - 2つは別プロセス・別ポートなので、同時に起動してよい（順序に依存しない）。
3. それぞれの `preview_logs` を確認し、起動失敗（ビルドエラー・ポート競合など）がないかチェックする。
   - Spring Boot 側は `Started TeamTAppApplication` のようなログが出れば起動完了。
   - static 側は `fronted-v2 を起動しました` が出れば起動完了。
4. 動作確認したい内容に応じて開くURLを使い分ける:
   - fronted-v2 ギャラリー: `http://localhost:5500/fronted-v2/index.html`
   - Spring Boot 側の画面（ログイン/ホーム等）: `http://localhost:8080/`
5. 両方確認できたら、起動状況をユーザーに簡潔に報告する。

## 注意

- H2 コンソールを使った動作確認が必要な場合は、`springboot` を dev プロファイルで起動する必要がある（`.claude/launch.json` の `springboot` は既定でプロファイル指定なし）。dev プロファイルでの起動が必要なら、その場で `runtimeArgs` に `-Dspring-boot.run.profiles=dev` を加えた一時起動を検討する。
- fronted-v2 は Spring Boot 側とは別配信であり、認証状態は共有されない（`fronted-v2/js/app.js` の `AUTH_LOGIN_URL` 経由でリンクしているのみ）。両方起動していても、ログイン後に fronted-v2 へ自動反映はされない。
