# セットアップ手順書 - teamT-app

## 各自ローカルで用意するファイル

以下は `.gitignore` 対象のため、メンバー各自がローカルで作成する必要があります。

| ファイル | 作成方法 |
|---|---|
| `pom.xml` | `pom.xml.example` をコピーして作成 |
| `src/main/resources/application.properties` | `application.properties.example` をコピーして作成 |
| `frontend/node_modules/` | `npm install` で生成 |

---

## 手順1：前提ツールのインストール確認

以下がインストールされていることを確認してください。

```bash
java -version   # Java 21 以上が必要
node -version   # Node.js 18 以上が必要
npm -version
```

Java 21 が入っていない場合 → https://adoptium.net/ からダウンロード

---

## 手順2：リポジトリのクローン

```bash
git clone https://github.com/higgs1729/teamT-app.git
cd teamT-app
```

---

## 手順3：pom.xml の作成

```bash
# Windows (PowerShell)
Copy-Item pom.xml.example pom.xml

# Mac/Linux
cp pom.xml.example pom.xml
```

必要に応じて依存ライブラリを追加してください。

---

## 手順4：application.properties の作成

```bash
# Windows (PowerShell)
Copy-Item src\main\resources\application.properties.example src\main\resources\application.properties

# Mac/Linux
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

`application.properties` を開き、APIキーの欄を適切な値に書き換えてください。  
（使用しないAPIキー項目はそのままで起動可能です）

---

## 手順5：バックエンドの起動

```bash
# Windows
./mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```

起動確認 → http://localhost:8080 にアクセス

---

## 手順6：フロントエンドの起動

```bash
cd frontend
npm install
npm run dev
```

起動確認 → http://localhost:5173 にアクセス  
（バックエンドへの `/api` リクエストは自動的に localhost:8080 へプロキシされます）
