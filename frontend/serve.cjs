/* ============================================================
   fronted-v2 / serve.cjs
   追加インストール不要の簡易静的サーバー（Node標準モジュールのみ）。

   fronted-v2 は ../templates を参照するため、リポジトリのルート
   （teamT-app）を配信ルートにする必要がある。このスクリプトは
   自身の1つ上の階層（= リポジトリルート）を自動的にルートとして配信する。

   使い方:
     node fronted-v2/serve.cjs          … ポート5500で起動
     node fronted-v2/serve.cjs 8080     … ポート指定で起動
   停止: ターミナルで Ctrl + C
   ============================================================ */

const http = require("http");
const fs   = require("fs");
const path = require("path");
const os   = require("os");

// 同一LAN内の端末からアクセスできる自分のIPv4アドレス一覧を返す
function lanAddresses() {
  const nets = os.networkInterfaces();
  const list = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // 内部(ループバック)とIPv6を除外した実アドレスのみ
      if (net.family === "IPv4" && !net.internal) list.push(net.address);
    }
  }
  return list;
}

// 配信ルート = このファイルの親(fronted-v2)の、さらに親(リポジトリルート)
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.argv[2]) || 5500;

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath.endsWith("/")) urlPath += "index.html";

  // ルート外へのアクセスを防止
  const filePath = path.resolve(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("403 Forbidden"); }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("404 Not Found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
});

// host を "0.0.0.0" にして全ネットワークインターフェースで待ち受ける。
// これにより localhost だけでなく同一LAN内の他端末からもアクセスできる。
server.listen(PORT, "0.0.0.0", () => {
  const pagePath = "/fronted-v2/index.html";
  console.log("\n  fronted-v2 を起動しました。停止するには Ctrl + C。\n");
  console.log("  自分のPC:");
  console.log("    http://localhost:" + PORT + pagePath + "\n");
  const lans = lanAddresses();
  if (lans.length) {
    console.log("  同じLAN内のチームメンバー（このURLを共有）:");
    for (const ip of lans) console.log("    http://" + ip + ":" + PORT + pagePath);
    console.log("\n  ※ 初回は Windows ファイアウォールの許可ダイアログで「アクセスを許可」を選んでください。");
  } else {
    console.log("  （LANのIPv4アドレスが見つかりませんでした。ネットワーク接続を確認してください）\n");
  }
});

// ポートが使用中などの起動失敗を分かりやすく通知
server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error("\n  ポート " + PORT + " は使用中です。別のポートで起動してください:");
    console.error("    node fronted-v2/serve.cjs 8080\n");
  } else {
    console.error(e);
  }
  process.exit(1);
});
