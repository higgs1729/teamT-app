# ?????Web API????????

???: 2026-07-07

Public APIs ??????? `Auth = No` ?????????????`docs/specification.md` ???????API??????????????????????????????????5?????????????

- ??????????: 103?
- ????????: 525?

## ??????

- [free-webapis-not-implemented-1.md](free-webapis-not-implemented-1.md) - 80?: Books, Currency Exchange, Documents & Productivity, Email, Entertainment, Environment, Finance, Food & Drink
- [free-webapis-not-implemented-2.md](free-webapis-not-implemented-2.md) - 94?: Games & Comics, Geocoding
- [free-webapis-not-implemented-3.md](free-webapis-not-implemented-3.md) - 102?: Government, Health, Music
- [free-webapis-not-implemented-4.md](free-webapis-not-implemented-4.md) - 97?: News, Open Data, Open Source Projects, Patent, Personality, Phone, Photography, Programming, Science & Math
- [free-webapis-not-implemented-5.md](free-webapis-not-implemented-5.md) - 152?: Security, Social, Sports & Fitness, Test Data, Text Analysis, Tracking, Transportation, URL Shorteners, Vehicle, Video, Weather

## ????

1. `docs/apis/free-webapis-not-implemented-*.md` の末尾番号を選ぶ
2. `$webapi-page-maker (<fileNumber>,<topDown>)` で候補台帳から順に `templates/` へHTMLを作る
3. 実装完了後、該当候補行を分割台帳から削除し、`fronted-v2/js/catalog.js` と `docs/specification.md` を更新する
