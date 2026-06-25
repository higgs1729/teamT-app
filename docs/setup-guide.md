# セットアップ手順書 - teamT-app

## 現状の問題点

リポジトリをそのまま起動しようとすると以下が不足しているため実行できません。

| 不足しているもの | 理由 |
|---|---|
| `pom.xml` | Mavenプロジェクトの定義ファイルが存在しない |
| `mvnw` / `mvnw.cmd` | Mavenラッパーが存在しない |
| `src/main/resources/application.properties` | `.gitignore` 対象のため各自作成が必要 |
| `frontend/node_modules/` | `.gitignore` 対象のため `npm install` が必要 |

---

## 手順1：前提ツールのインストール確認

以下がインストールされていることを確認してください。

```bash
java -version   # Java 21 以上が必要
mvn -version    # Maven がある場合（なければ手順2でラッパーを使う）
node -version   # Node.js 18 以上が必要
npm -version
```

Java 21 が入っていない場合 → https://adoptium.net/ からダウンロード

---

## 手順2：pom.xml と mvnw の作成

`pom.xml` がないため Spring Boot プロジェクトとして機能しません。  
**リーダー（竹内）が `pom.xml` を作成してリポジトリにプッシュする必要があります。**

### pom.xml の最小構成（リーダー作業）

プロジェクトルート（`teamT-app/`）に以下の内容で `pom.xml` を作成してください。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>app</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>teamT-app</name>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### エントリーポイントクラスの作成（リーダー作業）

`src/main/java/com/example/app/AppApplication.java` を作成してください。

```java
package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AppApplication {
    public static void main(String[] args) {
        SpringApplication.run(AppApplication.class, args);
    }
}
```

### Mavenラッパーの生成（リーダー作業・pom.xml 作成後）

```bash
mvn wrapper:wrapper
```

`mvnw`, `mvnw.cmd`, `.mvn/` が生成されたらコミット・プッシュしてください。

---

## 手順3：リポジトリのクローン（メンバー全員）

```bash
git clone https://github.com/higgs1729/teamT-app.git
cd teamT-app
```

---

## 手順4：application.properties の作成（メンバー全員）

```bash
# Windows (PowerShell)
Copy-Item src\main\resources\application.properties.example src\main\resources\application.properties

# Mac/Linux
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

`application.properties` を開き、APIキーの欄を適切な値に書き換えてください。  
（使用しないAPIキー項目はそのままで起動可能です）

---

## 手順5：バックエンドの起動（手順2完了後）

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

---

## まとめ：やることリスト

### リーダーが先にやること

- [ ] `pom.xml` を作成してプッシュ
- [ ] `src/main/java/com/example/app/AppApplication.java` を作成してプッシュ
- [ ] `mvn wrapper:wrapper` でラッパーを生成してプッシュ

### メンバーがやること

- [ ] `git pull` で最新を取得
- [ ] `application.properties` を作成（手順4）
- [ ] バックエンド起動確認（手順5）
- [ ] フロントエンド起動確認（手順6）
