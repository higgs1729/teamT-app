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
     category    … 旧形式のグループ名（後方互換用）
     categoryPath… サイドバーの階層分類（例 ["データ・検索系", "宇宙・天気"]）
     description … ヘッダーのサブテキスト（このページの説明）
     apiName     … 利用している外部API名
     apiUrl      … 関連する公式ページ（参考リンク）
     icon        … Tabler Icons のクラス名（例 "ti-dog"）
   ============================================================ */

window.CATALOG = [
  /* ---------- 画像・ビジュアル系（動物・キャラ・画像を取得） ---------- */
  { id: "3d", file: "image/3D.html", title: "多ジャンル3Dモデル召喚API", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "3D・アバター"],
    description: "ランダムな3Dモデルを読み込み、回転操作しながら閲覧できる", apiName: "Three.js GLTF サンプル", apiUrl: "https://threejs.org/", icon: "ti-cube" },
  { id: "dog-api", file: "image/dog-api.html", title: "Dog API", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "動物画像"],
    description: "ランダムな犬の画像を取得。犬種フィルターも搭載", apiName: "Dog API", apiUrl: "https://dog.ceo/dog-api/", icon: "ti-dog" },
  { id: "cat-api", file: "image/cat-api.html", title: "The Cat API", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "動物画像"],
    description: "ランダムな猫の画像と猫種データを取得", apiName: "The Cat API", apiUrl: "https://thecatapi.com/", icon: "ti-cat" },
  { id: "fox", file: "image/Fox.html", title: "Random Fox", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "動物画像"],
    description: "ランダムなキツネの画像を取得", apiName: "RandomFox", apiUrl: "https://randomfox.ca/", icon: "ti-paw" },
  { id: "neko", file: "image/neko.html", title: "HTTP Cat", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "HTTP・ステータス画像"],
    description: "HTTPステータスコードを猫の画像で表示", apiName: "HTTP Cat", apiUrl: "https://http.cat/", icon: "ti-browser" },
  { id: "necos", file: "image/Necos.html", title: "Nekos.best", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "キャラクター画像"],
    description: "アニメ風のネコミミ画像ビューア", apiName: "Nekos.best", apiUrl: "https://nekos.best/", icon: "ti-mood-smile" },
  { id: "waifu", file: "image/Waifu.html", title: "Waifu Gallery", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "キャラクター画像"],
    description: "アニメキャラ画像のギャラリー", apiName: "Waifu.im", apiUrl: "https://waifu.im/", icon: "ti-sparkles" },
  { id: "kamo", file: "image/kamo.html", title: "アヒルで一息", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "動物画像"],
    description: "ランダムなアヒルの画像で気分転換", apiName: "Random-d.uk", apiUrl: "https://random-d.uk/", icon: "ti-feather" },
  { id: "food", file: "image/food.html", title: "食べ物画像検索", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "食べ物画像"],
    description: "料理名でWikipediaの画像を検索して表示", apiName: "Wikipedia API", apiUrl: "https://www.mediawiki.org/wiki/API:Main_page", icon: "ti-tools-kitchen-2" },
  { id: "dance-proto", file: "image/dance-proto.html", title: "Dance Prototype", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "3D・アバター"],
    description: "GLTFモデルを読み込み、アニメーションを切り替えて再生", apiName: "Three.js GLTF サンプル", apiUrl: "https://threejs.org/", icon: "ti-cube" },
  { id: "oto", file: "image/oto.html", title: "Avatar Studio", category: "画像・ビジュアル系", categoryPath: ["画像・ビジュアル系", "3D・アバター"],
    description: "3DアバターにBGMとTTSを組み合わせたダンスビューア", apiName: "Three.js / Web Speech API", apiUrl: "https://threejs.org/", icon: "ti-sparkles" },

  /* ---------- データ・検索系（一覧/検索/詳細データを扱う） ---------- */
  { id: "anime", file: "data/anime.html", title: "アニメ図鑑", category: "データ・検索系", categoryPath: ["データ・検索系", "アニメ・カード"],
    description: "アニメをキーワード検索・ランキング表示", apiName: "Jikan API", apiUrl: "https://jikan.moe/", icon: "ti-movie" },
  { id: "jikan", file: "data/Jikan.html", title: "アニメ掲示板", category: "データ・検索系", categoryPath: ["データ・検索系", "アニメ・カード"],
    description: "アニメ情報を掲示板風に一覧表示", apiName: "Jikan API", apiUrl: "https://jikan.moe/", icon: "ti-message-circle" },
  { id: "poke", file: "data/Poke.html", title: "ポケモンガチャ", category: "データ・検索系", categoryPath: ["データ・検索系", "ゲーム・キャラクター"],
    description: "ランダムにポケモンを引いて図鑑表示", apiName: "PokeAPI", apiUrl: "https://pokeapi.co/", icon: "ti-device-gamepad-2" },
  { id: "akusyonn", file: "data/akusyonn.html", title: "ゲーム図鑑", category: "データ・検索系", categoryPath: ["データ・検索系", "ゲーム・キャラクター"],
    description: "無料PCゲームの一覧・情報を取得", apiName: "FreeToGame", apiUrl: "https://www.freetogame.com/api-doc", icon: "ti-device-gamepad" },
  { id: "applemusic", file: "data/applemusic.html", title: "Apple Music 検索", category: "データ・検索系", categoryPath: ["データ・検索系", "音楽・書籍"],
    description: "iTunes の楽曲をキーワード検索", apiName: "iTunes Search API", apiUrl: "https://performance-partners.apple.com/search-api", icon: "ti-music" },
  { id: "nasa", file: "data/nasa.html", title: "NASA 今日の天体", category: "データ・検索系", categoryPath: ["データ・検索系", "宇宙・天気"],
    description: "NASA APOD の天体写真をランダム表示", apiName: "NASA APOD", apiUrl: "https://api.nasa.gov/", icon: "ti-rocket" },
  { id: "utyu", file: "data/utyu.html", title: "NASA 近地天体", category: "データ・検索系", categoryPath: ["データ・検索系", "宇宙・天気"],
    description: "地球近傍小惑星(NEO)の観測ダッシュボード", apiName: "NASA NeoWs", apiUrl: "https://api.nasa.gov/", icon: "ti-planet" },
  { id: "wakusei", file: "data/wakusei.html", title: "惑星情報", category: "データ・検索系", categoryPath: ["データ・検索系", "宇宙・天気"],
    description: "太陽系の惑星データを選んで表示（サンプル）", apiName: "ローカルデータ", apiUrl: "https://ja.wikipedia.org/wiki/惑星", icon: "ti-globe" },
  { id: "burogu", file: "data/burogu.html", title: "ランダム記事ローダー", category: "データ・検索系", categoryPath: ["データ・検索系", "記事・プロフィール"],
    description: "ダミーの記事データをランダムに読み込んで表示", apiName: "JSONPlaceholder", apiUrl: "https://jsonplaceholder.typicode.com/", icon: "ti-article" },
  { id: "game", file: "data/game.html", title: "高評価ゲーム一覧", category: "データ・検索系", categoryPath: ["データ・検索系", "ゲーム・キャラクター"],
    description: "評価の高いゲームを一覧表示（APIキー必要）", apiName: "RAWG API", apiUrl: "https://rawg.io/apidocs", icon: "ti-trophy" },
  { id: "hon", file: "data/hon.html", title: "現代漫画検索", category: "データ・検索系", categoryPath: ["データ・検索系", "音楽・書籍"],
    description: "キーワードで書籍・漫画を検索して表紙を表示", apiName: "Open Library", apiUrl: "https://openlibrary.org/developers/api", icon: "ti-book" },
  { id: "randomuser", file: "data/index.html", title: "ランダムユーザー生成器", category: "データ・検索系", categoryPath: ["データ・検索系", "記事・プロフィール"],
    description: "ランダムなプロフィール(氏名/写真/住所)を生成", apiName: "Random User Generator", apiUrl: "https://randomuser.me/", icon: "ti-user" },
  { id: "cars", file: "data/Cars.html", title: "Car Explorer", category: "データ・検索系", categoryPath: ["データ・検索系", "乗り物・交通"],
    description: "メーカーとモデルを選んで車両情報と画像を検索", apiName: "NHTSA Vehicle API / Wikipedia API", apiUrl: "https://vpic.nhtsa.dot.gov/api/", icon: "ti-car" },
  { id: "yugio", file: "data/Yugio.html", title: "遊戯王カード図鑑", category: "データ・検索系", categoryPath: ["データ・検索系", "アニメ・カード"],
    description: "カード名・属性・種族で検索してランダム表示", apiName: "YGOPRODeck API / MyMemory Translation API", apiUrl: "https://db.ygoprodeck.com/api-guide/", icon: "ti-cards" },
  { id: "countrysearch", file: "data/countrySearch.html", title: "国情報検索", category: "データ・検索系", categoryPath: ["データ・検索系", "国・地域"],
    description: "国名から人口と首都情報を検索して表示", apiName: "CountriesNow API", apiUrl: "https://countriesnow.space/", icon: "ti-globe" },
  { id: "ip", file: "data/ip.html", title: "IP Geolocation Dashboard", category: "データ・検索系", categoryPath: ["データ・検索系", "ネットワーク・セキュリティ"],
    description: "IP位置情報データをダッシュボード形式で表示（サンプル）", apiName: "ローカルサンプルデータ", apiUrl: "", icon: "ti-user" },
  { id: "kabu", file: "data/kabu.html", title: "株価検索", category: "データ・検索系", categoryPath: ["データ・検索系", "金融・マーケット"],
    description: "銘柄コードを入力して株価と騰落率を取得", apiName: "Alpha Vantage", apiUrl: "https://www.alphavantage.co/documentation/", icon: "ti-currency-yen" },
  { id: "radar", file: "data/radar.html", title: "ADS-B Flight Radar", category: "データ・検索系", categoryPath: ["データ・検索系", "乗り物・交通"],
    description: "地図範囲内の航空機データを取得して可視化", apiName: "OpenSky Network API", apiUrl: "https://opensky-network.org/apidoc/rest.html", icon: "ti-rocket" },
  { id: "saiba", file: "data/saiba-.html", title: "Shodan Intelligence Terminal", category: "データ・検索系", categoryPath: ["データ・検索系", "ネットワーク・セキュリティ"],
    description: "IPアドレスの公開情報と開放ポートを調査", apiName: "Shodan API", apiUrl: "https://developer.shodan.io/api", icon: "ti-browser" },
  { id: "seibetu", file: "data/seibetu.html", title: "名前から性別を自動判別", category: "データ・検索系", categoryPath: ["データ・検索系", "人名・属性推定"],
    description: "ローマ字名から性別と確率を推定して表示", apiName: "Genderize.io", apiUrl: "https://genderize.io/", icon: "ti-user" },
  { id: "weather", file: "data/weather.html", title: "天気アプリ（気象庁版）", category: "データ・検索系", categoryPath: ["データ・検索系", "宇宙・天気"],
    description: "都道府県名から最新の天気予報を取得", apiName: "気象庁 予報JSON", apiUrl: "https://www.jma.go.jp/bosai/forecast/", icon: "ti-planet" },

  /* ---------- 為替・ツール系（実用ツール） ---------- */
  { id: "calendar", file: "tools/calendar.html", title: "カレンダー（祝日API付き）", category: "為替・ツール系", categoryPath: ["為替・ツール系", "日付・時刻"],
    description: "祝日APIを参照して月間カレンダーを表示する", apiName: "Public Holidays API", apiUrl: "https://date.nager.at/", icon: "ti-calendar" },
  { id: "time", file: "tools/time.html", title: "時計", category: "為替・ツール系", categoryPath: ["為替・ツール系", "日付・時刻"],
    description: "現在時刻を大きく表示するシンプルな時計", apiName: "ローカル時刻", apiUrl: "", icon: "ti-clock" },
  { id: "currency", file: "tools/currency_converter.html", title: "通貨換算", category: "為替・ツール系", categoryPath: ["為替・ツール系", "通貨・為替"],
    description: "指定した通貨間で金額を換算", apiName: "ExchangeRate-API", apiUrl: "https://www.exchangerate-api.com/", icon: "ti-currency-yen" },
  { id: "kawase", file: "tools/kawase.html", title: "為替レート", category: "為替・ツール系", categoryPath: ["為替・ツール系", "通貨・為替"],
    description: "通貨ペアの為替レートを取得", apiName: "exchangerate.host", apiUrl: "https://exchangerate.host/", icon: "ti-arrows-exchange" },
  { id: "qr", file: "tools/QR.html", title: "QRコードおみくじ", category: "為替・ツール系", categoryPath: ["為替・ツール系", "生成・変換"],
    description: "ランダムなメッセージ入りQRコードを生成", apiName: "QR Server (goQR)", apiUrl: "https://goqr.me/api/", icon: "ti-qrcode" },
  { id: "translate", file: "tools/genngohonnyaku.html", title: "簡易翻訳", category: "為替・ツール系", categoryPath: ["為替・ツール系", "翻訳・言語"],
    description: "内蔵辞書で日本語↔英語を簡易翻訳（サンプル）", apiName: "ローカル辞書", apiUrl: "", icon: "ti-language" },
  { id: "tizu", file: "tools/tizu.html", title: "地図アプリ", category: "為替・ツール系", categoryPath: ["為替・ツール系", "地図・住所"],
    description: "地図を表示し、クリック地点にマーカーを追加", apiName: "Leaflet / OpenStreetMap", apiUrl: "https://leafletjs.com/", icon: "ti-globe" },
  { id: "zipcode", file: "tools/zipcode.html", title: "郵便番号検索", category: "為替・ツール系", categoryPath: ["為替・ツール系", "地図・住所"],
    description: "郵便番号から住所を検索して表示", apiName: "ZipCloud API", apiUrl: "https://zipcloud.ibsnet.co.jp/doc/api", icon: "ti-qrcode" },

  /* ---------- エンタメ・おもしろ系（ジョーク/雑学/クイズ） ---------- */
  { id: "joke", file: "fun/joke.html", title: "海外ジョーク", category: "エンタメ・おもしろ系", categoryPath: ["エンタメ・おもしろ系", "ジョーク・雑学"],
    description: "海外のジョークを取得して日本語訳付きで表示", apiName: "Official Joke API", apiUrl: "https://github.com/15Dkatz/official_joke_api", icon: "ti-mood-crazy-happy" },
  { id: "ohuzake", file: "fun/ohuzake.html", title: "ランダム雑学", category: "エンタメ・おもしろ系", categoryPath: ["エンタメ・おもしろ系", "ジョーク・雑学"],
    description: "ランダムな豆知識(雑学)を取得して表示", apiName: "Useless Facts", apiUrl: "https://uselessfacts.jsph.pl/", icon: "ti-bulb" },
  { id: "opentrivia", file: "fun/OpenTrivia.html", title: "アニメ・ゲームクイズ", category: "エンタメ・おもしろ系", categoryPath: ["エンタメ・おもしろ系", "クイズ・ゲーム"],
    description: "ジャンル別の4択クイズに挑戦", apiName: "Open Trivia DB", apiUrl: "https://opentdb.com/", icon: "ti-help" },
  { id: "yesno", file: "fun/YesNo.html", title: "Yes / No ディサイダー", category: "エンタメ・おもしろ系", categoryPath: ["エンタメ・おもしろ系", "意思決定・名言"],
    description: "Yes/No で迷いを決めてくれる意思決定器", apiName: "yesno.wtf", apiUrl: "https://yesno.wtf/", icon: "ti-thumb-up" },
  { id: "meigenn", file: "fun/meigenn.html", title: "名言メーカー", category: "エンタメ・おもしろ系", categoryPath: ["エンタメ・おもしろ系", "意思決定・名言"],
    description: "カテゴリ別の名言をランダム表示（サンプル）", apiName: "ローカルデータ", apiUrl: "", icon: "ti-quote" },
  { id: "useless", file: "fun/Useless.html", title: "ランダム雑学", category: "エンタメ・おもしろ系", categoryPath: ["エンタメ・おもしろ系", "ジョーク・雑学"],
    description: "雑学を取得して翻訳付きで表示", apiName: "Useless Facts / MyMemory Translation API / Unsplash Source", apiUrl: "https://uselessfacts.jsph.pl/", icon: "ti-bulb" },
  { id: "tai", file: "fun/tai.html", title: "Dynamic Typing Challenge", category: "エンタメ・おもしろ系", categoryPath: ["エンタメ・おもしろ系", "クイズ・ゲーム"],
    description: "ランダムな英文お題でタイピングに挑戦", apiName: "Quotable API", apiUrl: "https://api.quotable.io/", icon: "ti-device-gamepad-2" },
];
