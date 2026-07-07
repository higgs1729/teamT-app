const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "templates", "data");

const pages = [
  ["zero-x", "0x API", "https://0x.org/api", "DEXの価格見積もりやスワップAPIを試すページです。APIキーが必要なため入力欄から渡します。", "https://api.0x.org/swap/permit2/price?chainId=1&sellToken=USDC&buyToken=WETH&sellAmount=1000000", true, "GET", "", [{ name: "USDC -> WETH price quote", date: "Ethereum", note: "APIキー入力後に取得" }]],
  ["one-inch", "1inch API", "https://1inch.io/api/", "1inchのDEX集約API用に、Developer PortalのBearerキーを入力してリクエストできます。", "https://api.1inch.dev/swap/v6.1/1/tokens", true, "GET", "", [{ name: "Ethereum token list", date: "1inch", note: "Bearerキー入力後に取得" }]],
  ["alpha-mossland", "Alpha by Mossland", "https://alpha.moss.land/developers", "韓国暗号資産チャンネルやニュースを正規化したAlphaの公開APIを表示します。", "https://alpha.moss.land/api/canonical/entities.json", false, "GET", "", [{ name: "bitcoin", date: "canonical entity", note: "free no-auth HTTPS CORS" }]],
  ["bitcambio", "Bitcambio Public API", "https://nova.bitcambio.com.br/api/v3/docs#a-public", "ブラジル取引所Bitcambioの公開アセット情報を確認するためのページです。", "https://nova.bitcambio.com.br/api/v3/public/assets", false, "GET", "", [{ name: "BTC", date: "asset", note: "公開APIドキュメントのpublic領域" }]],
  ["bitcoincharts", "BitcoinCharts Markets", "https://bitcoincharts.com/about/exchanges/", "BitcoinChartsのマーケット一覧JSONを読み込み、取引所ごとの価格データを確認します。", "https://api.bitcoincharts.com/v1/markets.json", false, "GET", "", [{ name: "bitstampUSD", date: "market", note: "last price / volume" }]],
  ["block-lottos", "Block Lottos OpenAPI", "https://blocklottos.com/openapi.json", "オンチェーン抽選サービスのOpenAPI定義を読み込み、公開エンドポイントの概要を確認します。", "https://blocklottos.com/openapi.json", false, "GET", "", [{ name: "OpenAPI paths", date: "schema", note: "抽選履歴やジャックポットの定義" }]],
  ["btcnode-uk", "btcnode.uk", "https://btcnode.uk", "Bitcoin関連データや一部x402課金エンドポイントを持つbtcnode.ukのURL確認ページです。", "https://btcnode.uk", false, "GET", "", [{ name: "Bitcoin fees / mempool", date: "btcnode.uk", note: "有料エンドポイントはフォールバック表示" }]],
  ["coincap", "CoinCap API", "https://docs.coincap.io/", "CoinCapの暗号資産価格・時価総額・取引所データを取得します。", "https://rest.coincap.io/v3/assets?limit=10", true, "GET", "", [{ name: "bitcoin", date: "asset", note: "real-time priceUsd / marketCapUsd" }]],
  ["coindesk-bpi", "CoinDesk BPI", "https://old.coindesk.com/coindesk-api/", "CoinDeskのBitcoin Price Index系JSONを確認します。古いAPIのため失敗時はサンプルを表示します。", "https://api.coindesk.com/v1/bpi/currentprice.json", false, "GET", "", [{ name: "BTC USD", date: "BPI", note: "Bitcoin Price Index" }]],
  ["coingecko", "CoinGecko API", "http://www.coingecko.com/api", "CoinGeckoの価格APIでBTC/ETHの複数通貨建て価格を取得します。", "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,jpy", false, "GET", "", [{ name: "bitcoin", date: "USD/JPY", note: "無料デモ枠あり" }]],
  ["coinlore", "CoinLore API", "https://www.coinlore.com/cryptocurrency-data-api", "CoinLoreの公開ティッカーAPIから暗号資産の価格・出来高を一覧表示します。", "https://api.coinlore.net/api/tickers/?start=0&limit=10", false, "GET", "", [{ name: "Bitcoin", date: "ticker", note: "price_usd / percent_change_24h" }]],
  ["coinpaprika", "Coinpaprika API", "https://api.coinpaprika.com", "CoinpaprikaのティッカーAPIで暗号資産マーケットデータを表示します。", "https://api.coinpaprika.com/v1/tickers?limit=10", false, "GET", "", [{ name: "btc-bitcoin", date: "ticker", note: "quotes.USD.price" }]],
  ["coinstats", "CoinStats API", "https://documenter.getpostman.com/view/5734027/RzZ6Hzr3?version=latest", "CoinStatsの暗号資産トラッカーAPIを、APIキー入力式で試せるページです。", "https://openapiv1.coinstats.app/coins", true, "GET", "", [{ name: "Bitcoin", date: "coin", note: "APIキーが必要な場合があります" }]],
  ["cryptapi", "CryptAPI", "https://docs.cryptapi.io/", "CryptAPIの暗号資産決済処理APIについて、公開情報エンドポイントを確認します。", "https://api.cryptapi.io/btc/info/", false, "GET", "", [{ name: "BTC payment info", date: "CryptAPI", note: "決済導入向けAPI" }]],
  ["cryptingup", "CryptingUp", "https://www.cryptingup.com/apidoc/#introduction", "CryptingUpのマーケットデータAPIから取引ペア情報を取得します。", "https://www.cryptingup.com/api/markets", false, "GET", "", [{ name: "BTC-USDT", date: "market", note: "exchange / price / volume" }]],
  ["cryptocompare", "CryptoCompare", "https://www.cryptocompare.com/api#", "CryptoCompare系の価格比較APIでBTC/ETHの価格をまとめて表示します。", "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH&tsyms=USD,JPY", false, "GET", "", [{ name: "BTC", date: "USD/JPY", note: "複数通貨価格" }]],
  ["cryptonator", "Cryptonator", "https://www.cryptonator.com/api/", "Cryptonatorの暗号資産為替レートAPIを確認します。サービス停止時はサンプルを表示します。", "https://api.cryptonator.com/api/ticker/btc-usd", false, "GET", "", [{ name: "BTC/USD", date: "ticker", note: "price / volume / change" }]],
  ["gemini", "Gemini REST API", "https://docs.gemini.com/rest-api/", "Gemini取引所の公開マーケットデータからBTC/USDティッカーを取得します。", "https://api.gemini.com/v1/pubticker/btcusd", false, "GET", "", [{ name: "btcusd", date: "pubticker", note: "bid / ask / last" }]],
  ["localbitcoins", "LocalBitcoins API", "https://localbitcoins.com/api-docs/", "LocalBitcoinsの旧P2P取引API資料を参照し、利用不可時は終了済みサービスとしてサンプル表示します。", "https://localbitcoins.com/bitcoinaverage/ticker-all-currencies/", false, "GET", "", [{ name: "LocalBitcoins", date: "legacy", note: "サービス終了によりライブ取得できない可能性" }]],
  ["mempool-space", "Mempool.space API", "https://mempool.space/api", "Bitcoinの推奨手数料をMempool.space APIから取得します。", "https://mempool.space/api/v1/fees/recommended", false, "GET", "", [{ name: "fastestFee", date: "fee", note: "sat/vB" }]],
  ["mercado-bitcoin", "Mercado Bitcoin API", "https://www.mercadobitcoin.com.br/api-doc/", "ブラジルのMercado Bitcoin公開ティッカーAPIでBTC/BRL情報を確認します。", "https://www.mercadobitcoin.net/api/BTC/ticker/", false, "GET", "", [{ name: "BTC/BRL", date: "ticker", note: "last / buy / sell" }]],
  ["messari", "Messari API", "https://messari.io/api", "Messariの機関投資家向け暗号資産データAPIをAPIキー入力式で確認します。", "https://api.messari.io/api/v1/assets/bitcoin/metrics", true, "GET", "", [{ name: "Bitcoin metrics", date: "Messari", note: "x-messari-api-keyが必要" }]],
  ["nexchange", "Nexchange API", "https://nexchange2.docs.apiary.io/", "自動暗号資産交換サービスNexchangeの通貨情報エンドポイントを確認します。", "https://api.n.exchange/en/api/v1/currency/", false, "GET", "", [{ name: "BTC", date: "currency", note: "交換対応通貨" }]],
  ["solana-json-rpc", "Solana JSON RPC", "https://docs.solana.com/developing/clients/jsonrpc-api", "SolanaのJSON-RPCへPOSTし、getHealthなどの結果を確認します。", "https://api.mainnet-beta.solana.com", false, "POST", "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getHealth\"}", [{ name: "getHealth", date: "JSON-RPC", note: "ok" }]],
  ["zmok-ethereum-rpc", "ZMOK Ethereum RPC", "https://zmok.io", "Ethereum JSON-RPCプロバイダーとしてのZMOK向けに、RPC URLを入力してPOSTできます。", "https://zmok.io/YOUR_KEY", false, "POST", "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_blockNumber\",\"params\":[]}", [{ name: "eth_blockNumber", date: "Ethereum RPC", note: "プロバイダーURLを入力して取得" }]]
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function html([id, title, apiUrl, summary, endpoint, needsKey, method, body, sample]) {
  const keyField = needsKey ? `
          <label>
            <span>APIキー</span>
            <input id="apiKey" type="password" placeholder="必要な場合だけ入力">
          </label>` : "";
  const bodyField = method === "POST" ? `
          <label class="wide">
            <span>POSTボディ</span>
            <textarea id="body" rows="5">${esc(body)}</textarea>
          </label>` : "";

  return `<!DOCTYPE html>
<!--
  ${title}
  目的: ${summary}
  構成: API概要、リクエスト入力、取得結果、失敗時サンプルを1ファイルにまとめた暗号資産API紹介ページ。
-->
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <style>
    :root { --bg:#f4f7fb; --card:#fff; --ink:#14213d; --muted:#64748b; --line:#d8e0ec; --accent:#0f766e; --accent2:#f59e0b; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; font-family:"Yu Gothic","Meiryo",sans-serif; color:var(--ink); background:linear-gradient(180deg,#f8fbff 0%,var(--bg) 100%); }
    main { width:min(1120px,calc(100% - 28px)); margin:0 auto; padding:28px 0 38px; }
    .hero { display:grid; grid-template-columns:1.25fr .75fr; gap:18px; margin-bottom:18px; }
    .panel { background:var(--card); border:1px solid var(--line); border-radius:8px; box-shadow:0 16px 34px rgba(15,23,42,.08); }
    .intro { padding:26px; border-top:5px solid var(--accent); }
    .eyebrow { margin:0 0 8px; color:var(--accent); font-size:13px; font-weight:700; letter-spacing:0; }
    h1 { margin:0 0 12px; font-size:clamp(28px,4vw,42px); line-height:1.12; letter-spacing:0; }
    p { margin:0; color:var(--muted); line-height:1.8; }
    .meta { display:grid; gap:10px; padding:18px; }
    .meta div { border:1px solid var(--line); border-radius:8px; padding:12px; background:#fbfdff; }
    .meta strong { display:block; margin-bottom:4px; font-size:12px; color:var(--muted); }
    .meta a { color:var(--accent); overflow-wrap:anywhere; }
    .controls { padding:20px; margin-bottom:18px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; }
    label span { display:block; margin-bottom:6px; font-size:13px; font-weight:700; color:#334155; }
    input, textarea { width:100%; border:1px solid var(--line); border-radius:8px; padding:10px 12px; font:inherit; color:var(--ink); background:#fff; }
    input { height:42px; }
    textarea { resize:vertical; font-family:Consolas,"Courier New",monospace; }
    .wide { grid-column:1 / -1; }
    .actions { display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-top:16px; }
    button { min-height:42px; border:0; border-radius:8px; padding:0 18px; font:inherit; font-weight:700; color:#fff; background:var(--accent); cursor:pointer; }
    button.secondary { background:#e2e8f0; color:#172033; }
    .status { font-size:14px; color:var(--muted); }
    .url { margin-top:14px; padding:12px; border-radius:8px; background:#111827; color:#d1fae5; font-family:Consolas,"Courier New",monospace; font-size:13px; overflow-wrap:anywhere; }
    .results { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; }
    .item { padding:16px; border-top:4px solid var(--accent2); }
    .item time { display:block; margin-bottom:8px; color:var(--accent); font-weight:700; }
    .item h2 { margin:0 0 8px; font-size:19px; line-height:1.35; letter-spacing:0; }
    .item pre { max-height:190px; overflow:auto; margin:10px 0 0; padding:10px; border-radius:8px; background:#f1f5f9; font-size:12px; white-space:pre-wrap; }
    .empty { padding:22px; text-align:center; color:var(--muted); }
    @media (max-width:760px) { main { width:min(100% - 22px,1120px); padding-top:18px; } .hero { grid-template-columns:1fr; } .intro { padding:20px; } }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="panel intro">
        <p class="eyebrow">${esc(title)}</p>
        <h1>${esc(title)}</h1>
        <p>${esc(summary)}</p>
      </div>
      <aside class="panel meta">
        <div><strong>公式URL</strong><a href="${esc(apiUrl)}" target="_blank" rel="noreferrer">${esc(apiUrl)}</a></div>
        <div><strong>リクエスト方式</strong>${method}${needsKey ? " / APIキー入力式" : " / 公開エンドポイントまたはサンプル表示"}</div>
      </aside>
    </section>

    <section class="panel controls">
      <div class="grid">
        <label class="wide">
          <span>取得URL</span>
          <input id="endpoint" type="url" value="${esc(endpoint)}">
        </label>${keyField}${bodyField}
      </div>
      <div class="actions">
        <button id="loadBtn" type="button">取得する</button>
        <button id="sampleBtn" class="secondary" type="button">サンプル表示</button>
        <span id="status" class="status">暗号資産APIを試せます。</span>
      </div>
      <div id="requestUrl" class="url">${esc(endpoint)}</div>
    </section>

    <section id="results" class="results" aria-live="polite"></section>
  </main>

  <script>
    const sampleItems = ${JSON.stringify(sample, null, 6)};
    const method = "${method}";
    const needsKey = ${needsKey};

    function render(items, message) {
      document.getElementById("status").textContent = message;
      const box = document.getElementById("results");
      if (!items.length) {
        box.innerHTML = '<div class="panel empty">結果が空でした。URLやキーを確認してください。</div>';
        return;
      }
      box.innerHTML = items.map((item) => \`
        <article class="panel item">
          <time>\${escapeHtml(item.date || "crypto")}</time>
          <h2>\${escapeHtml(item.name || "結果")}</h2>
          <p>\${escapeHtml(item.note || "詳細はJSONを確認してください。")}</p>
          <pre>\${escapeHtml(JSON.stringify(item.raw || item, null, 2))}</pre>
        </article>
      \`).join("");
    }

    function normalize(data) {
      if (Array.isArray(data)) return data.slice(0, 24).map(toItem);
      if (data && Array.isArray(data.data)) return data.data.slice(0, 24).map(toItem);
      if (data && Array.isArray(data.assets)) return data.assets.slice(0, 24).map(toItem);
      if (data && Array.isArray(data.coins)) return data.coins.slice(0, 24).map(toItem);
      if (data && data.bpi) return Object.entries(data.bpi).map(([key, value]) => toItem({ symbol:key, ...value }));
      if (data && data.paths) return Object.keys(data.paths).slice(0, 24).map((path) => toItem({ name:path, note:"OpenAPI path" }));
      if (data && typeof data === "object") return Object.entries(data).slice(0, 24).map(([key, value]) => toItem({ name:key, note: typeof value === "object" ? JSON.stringify(value).slice(0, 140) : value, raw:value }));
      if (typeof data === "string") return [{ name:data.slice(0, 80), date:"text", note:data.slice(0, 180), raw:data }];
      return [];
    }

    function toItem(item) {
      const quote = item.quotes && (item.quotes.USD || item.quotes.usd);
      return {
        name: item.name || item.id || item.symbol || item.pair || item.market || item.code || item.title || "結果",
        date: item.rank || item.price_usd || item.priceUsd || item.last || (quote && quote.price) || item.currency || "",
        note: item.note || item.market_cap_usd || item.marketCapUsd || item.volume_usd || item.percent_change_24h || item.description || item.url || "",
        raw: item.raw || item
      };
    }

    async function loadData() {
      const endpoint = document.getElementById("endpoint").value.trim();
      document.getElementById("requestUrl").textContent = endpoint;
      document.getElementById("status").textContent = "取得中...";
      try {
        const headers = new Headers();
        if (needsKey) {
          const key = document.getElementById("apiKey").value.trim();
          if (key) {
            headers.set("Authorization", "Bearer " + key);
            headers.set("x-api-key", key);
            headers.set("x-messari-api-key", key);
          }
        }
        let options = { method, headers };
        if (method === "POST") {
          headers.set("Content-Type", "application/json");
          options.body = document.getElementById("body").value;
        }
        const response = await fetch(endpoint, options);
        if (!response.ok) throw new Error("HTTP " + response.status);
        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("json") ? await response.json() : await response.text();
        render(normalize(data), "取得できました。");
      } catch (error) {
        render(sampleItems, "取得に失敗したためサンプルを表示しています: " + error.message);
      }
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char]));
    }

    document.getElementById("loadBtn").addEventListener("click", loadData);
    document.getElementById("sampleBtn").addEventListener("click", () => render(sampleItems, "サンプルを表示しています。"));
    render(sampleItems, "サンプルを表示しています。");
  </script>
</body>
</html>
`;
}

for (const page of pages) {
  fs.writeFileSync(path.join(outDir, `${page[0]}.html`), html(page), "utf8");
}

console.log(`Generated ${pages.length} crypto API pages.`);
