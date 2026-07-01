/* ============================================================
   fronted-v2 / catalog.js
   templates/ 内の各 WebAPI 紹介ページ(HTML)のメタデータ一覧。
   この配列が「一覧の唯一の定義元」。テンプレートを追加したら
   ここに1要素足すだけでサイドバーに反映される。

   テンプレートはジャンル別のサブフォルダに整理されている:
     templates/image/  画像・ビジュアル系
     templates/data/   データ・検索系
     templates/tools/  為替・ツール系
     templates/fun/    エンタメ・おもしろ系

   各要素のフィールド:
     id          … URLハッシュ・選択識別子に使う一意キー（ファイル名ベース）
     file        … templates/ からの相対パス（例 "image/dog-api.html"）。
                    iframe は ../templates/<file> を読む
     title       … サイドバー/ヘッダーに表示する名称
     category    … サイドバーのグループ見出し（末尾の「系」は表示時に省略）
     description … ヘッダーのサブテキスト（このページの説明）
     apiName     … 利用している外部API名
     apiUrl      … 関連する公式ページ（参考リンク）
     icon        … Tabler Icons のクラス名（例 "ti-dog"）
   ============================================================ */

window.CATALOG = [
  /* ---------- 画像・ビジュアル系（動物・キャラ・画像を取得） ---------- */
  { id: "dog-api", file: "image/dog-api.html", title: "Dog API", category: "画像・ビジュアル系",
    description: "ランダムな犬の画像を取得。犬種フィルターも搭載", apiName: "Dog API", apiUrl: "https://dog.ceo/dog-api/", icon: "ti-dog" },
  { id: "cat-api", file: "image/cat-api.html", title: "The Cat API", category: "画像・ビジュアル系",
    description: "ランダムな猫の画像と猫種データを取得", apiName: "The Cat API", apiUrl: "https://thecatapi.com/", icon: "ti-cat" },
  { id: "fox", file: "image/Fox.html", title: "Random Fox", category: "画像・ビジュアル系",
    description: "ランダムなキツネの画像を取得", apiName: "RandomFox", apiUrl: "https://randomfox.ca/", icon: "ti-paw" },
  { id: "neko", file: "image/neko.html", title: "HTTP Cat", category: "画像・ビジュアル系",
    description: "HTTPステータスコードを猫の画像で表示", apiName: "HTTP Cat", apiUrl: "https://http.cat/", icon: "ti-browser" },
  { id: "necos", file: "image/Necos.html", title: "Nekos.best", category: "画像・ビジュアル系",
    description: "アニメ風のネコミミ画像ビューア", apiName: "Nekos.best", apiUrl: "https://nekos.best/", icon: "ti-mood-smile" },
  { id: "waifu", file: "image/Waifu.html", title: "Waifu Gallery", category: "画像・ビジュアル系",
    description: "アニメキャラ画像のギャラリー", apiName: "Waifu.im", apiUrl: "https://waifu.im/", icon: "ti-sparkles" },
  { id: "kamo", file: "image/kamo.html", title: "アヒルで一息", category: "画像・ビジュアル系",
    description: "ランダムなアヒルの画像で気分転換", apiName: "Random-d.uk", apiUrl: "https://random-d.uk/", icon: "ti-feather" },
  { id: "food", file: "image/food.html", title: "食べ物画像検索", category: "画像・ビジュアル系",
    description: "料理名でWikipediaの画像を検索して表示", apiName: "Wikipedia API", apiUrl: "https://www.mediawiki.org/wiki/API:Main_page", icon: "ti-tools-kitchen-2" },

  /* ---------- データ・検索系（一覧/検索/詳細データを扱う） ---------- */
  { id: "anime", file: "data/anime.html", title: "アニメ図鑑", category: "データ・検索系",
    description: "アニメをキーワード検索・ランキング表示", apiName: "Jikan API", apiUrl: "https://jikan.moe/", icon: "ti-movie" },
  { id: "jikan", file: "data/Jikan.html", title: "アニメ掲示板", category: "データ・検索系",
    description: "アニメ情報を掲示板風に一覧表示", apiName: "Jikan API", apiUrl: "https://jikan.moe/", icon: "ti-message-circle" },
  { id: "poke", file: "data/Poke.html", title: "ポケモンガチャ", category: "データ・検索系",
    description: "ランダムにポケモンを引いて図鑑表示", apiName: "PokeAPI", apiUrl: "https://pokeapi.co/", icon: "ti-device-gamepad-2" },
  { id: "akusyonn", file: "data/akusyonn.html", title: "ゲーム図鑑", category: "データ・検索系",
    description: "無料PCゲームの一覧・情報を取得", apiName: "FreeToGame", apiUrl: "https://www.freetogame.com/api-doc", icon: "ti-device-gamepad" },
  { id: "applemusic", file: "data/applemusic.html", title: "Apple Music 検索", category: "データ・検索系",
    description: "iTunes の楽曲をキーワード検索", apiName: "iTunes Search API", apiUrl: "https://performance-partners.apple.com/search-api", icon: "ti-music" },
  { id: "nasa", file: "data/nasa.html", title: "NASA 今日の天体", category: "データ・検索系",
    description: "NASA APOD の天体写真をランダム表示", apiName: "NASA APOD", apiUrl: "https://api.nasa.gov/", icon: "ti-rocket" },
  { id: "utyu", file: "data/utyu.html", title: "NASA 近地天体", category: "データ・検索系",
    description: "地球近傍小惑星(NEO)の観測ダッシュボード", apiName: "NASA NeoWs", apiUrl: "https://api.nasa.gov/", icon: "ti-planet" },
  { id: "wakusei", file: "data/wakusei.html", title: "惑星情報", category: "データ・検索系",
    description: "太陽系の惑星データを選んで表示（サンプル）", apiName: "ローカルデータ", apiUrl: "https://ja.wikipedia.org/wiki/惑星", icon: "ti-globe" },

  /* ---------- 為替・ツール系（実用ツール） ---------- */
  { id: "currency", file: "tools/currency_converter.html", title: "通貨換算", category: "為替・ツール系",
    description: "指定した通貨間で金額を換算", apiName: "ExchangeRate-API", apiUrl: "https://www.exchangerate-api.com/", icon: "ti-currency-yen" },
  { id: "kawase", file: "tools/kawase.html", title: "為替レート", category: "為替・ツール系",
    description: "通貨ペアの為替レートを取得", apiName: "exchangerate.host", apiUrl: "https://exchangerate.host/", icon: "ti-arrows-exchange" },
  { id: "qr", file: "tools/QR.html", title: "QRコードおみくじ", category: "為替・ツール系",
    description: "ランダムなメッセージ入りQRコードを生成", apiName: "QR Server (goQR)", apiUrl: "https://goqr.me/api/", icon: "ti-qrcode" },
  { id: "zipcode", file: "tools/zipcode.html", title: "郵便番号検索", category: "為替・ツール系",
    description: "7桁の郵便番号から住所を検索", apiName: "zipcloud", apiUrl: "https://zipcloud.ibsnet.co.jp/doc/api", icon: "ti-map-pin" },

  /* ---------- エンタメ・おもしろ系（ジョーク/雑学/クイズ） ---------- */
  { id: "joke", file: "fun/joke.html", title: "海外ジョーク", category: "エンタメ・おもしろ系",
    description: "海外のジョークを取得して日本語訳付きで表示", apiName: "Official Joke API", apiUrl: "https://github.com/15Dkatz/official_joke_api", icon: "ti-mood-crazy-happy" },
  { id: "ohuzake", file: "fun/ohuzake.html", title: "ランダム雑学", category: "エンタメ・おもしろ系",
    description: "ランダムな豆知識(雑学)を取得して表示", apiName: "Useless Facts", apiUrl: "https://uselessfacts.jsph.pl/", icon: "ti-bulb" },
  { id: "opentrivia", file: "fun/OpenTrivia.html", title: "アニメ・ゲームクイズ", category: "エンタメ・おもしろ系",
    description: "ジャンル別の4択クイズに挑戦", apiName: "Open Trivia DB", apiUrl: "https://opentdb.com/", icon: "ti-help" },
  { id: "yesno", file: "fun/YesNo.html", title: "Yes / No ディサイダー", category: "エンタメ・おもしろ系",
    description: "Yes/No で迷いを決めてくれる意思決定器", apiName: "yesno.wtf", apiUrl: "https://yesno.wtf/", icon: "ti-thumb-up" },
];
