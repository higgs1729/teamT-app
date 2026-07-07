---
name: webapi-page-maker
description: Create WebAPI introduction pages for this teamT-app project from one or more API documentation URLs. Use when the user invokes $webapi-page-maker, asks to create templates from API URLs, or wants templates/, fronted-v2/js/catalog.js, README/specification docs kept consistent for new WebAPI pages.
---

# webapi-page-maker

Create one self-contained HTML page per supplied WebAPI URL, place it under the correct `templates/` category folder, and update the gallery metadata and docs in the same change.

## Inputs

- One or more API documentation URLs.
- Optional user hints: desired Japanese title, category, sample endpoint, whether API keys are allowed.

If the user supplies multiple URLs, process all of them in one pass and keep names, ids, categories, and documentation consistent.

## Required Preflight

1. Read `README.md`.
2. Read `docs/specification.md`.
3. Read `fronted-v2/README.md`.
4. Read `fronted-v2/js/catalog.js` and inspect existing ids, category names, `categoryPath` examples, and style of descriptions.
5. Check `docs/apis/free-webapis-not-implemented.md` when choosing or validating candidate APIs.

## Research Rules

- Browse each supplied URL. Prefer the official API docs for endpoints, auth, rate limits, CORS notes, and response examples.
- Use only APIs that can be demonstrated for free. Prefer no-auth endpoints for static HTML demos.
- If an API needs a key, do not hardcode secrets. Add a visible input field or a clear placeholder in the page.
- If CORS is blocked, still create a useful introduction page only when it can demonstrate via image URLs, static sample data, or graceful fallback. Clearly show the fallback state in the UI.

## Classification

Use existing folders:

- `templates/image/`: visual output, photos, generated images, animals, art, avatars.
- `templates/data/`: search, listings, reference data, books, countries, science, games, transport, finance data.
- `templates/tools/`: practical input-to-output tools, conversion, validation, maps, QR, time, currency, translation.
- `templates/fun/`: jokes, trivia, random facts, quotes, fortune, playful decision tools.

Set both:

- `category`: one of `画像・ビジュアル系`, `データ・検索系`, `為替・ツール系`, `エンタメ・おもしろ系`.
- `categoryPath`: two-level array such as `["データ・検索系", "宇宙・天気"]`.

Prefer existing subcategories from `catalog.js`. Create a new subcategory only when existing ones would be misleading, then document the decision in `docs/specification.md`.

## Page Requirements

For each API, create a single standalone HTML file:

- File path: `templates/<folder>/<kebab-id>.html`.
- Use UTF-8, Japanese UI text, and no build step.
- Include file-level comments summarizing purpose and structure.
- Provide a polished, usable first screen. Avoid a landing-page-only explanation.
- Include at least one real interaction: fetch/search/random/load/convert.
- Handle loading, empty, success, and error states.
- Link to the API documentation URL from the page.
- Never expose API keys. If a key is needed, read it from an input field in the page.
- Keep CSS and JS inside the HTML file unless the project already has a shared pattern for that API page.

## Catalog Update

Add one object per page to `fronted-v2/js/catalog.js`:

```js
{ id: "kebab-id", file: "<folder>/kebab-id.html", title: "日本語タイトル", category: "データ・検索系", categoryPath: ["データ・検索系", "小分類"],
  description: "一覧で伝わる短い説明", apiName: "Official API Name", apiUrl: "https://...", icon: "ti-icon-name" },
```

Rules:

- `id` must be unique and stable.
- `file` must resolve from `templates/`.
- `icon` must be a likely existing Tabler icon. Prefer known-safe icons used in the repo: `ti-book`, `ti-user`, `ti-trophy`, `ti-article`, `ti-language`, `ti-quote`, `ti-globe`, `ti-tools-kitchen-2`, `ti-mood-crazy-happy`, `ti-dog`, `ti-cat`, `ti-calendar`, `ti-qrcode`, `ti-currency-yen`, `ti-rocket`, `ti-device-gamepad-2`, `ti-map`, `ti-search`.
- Preserve existing ordering and add new entries near related subcategories.

## Documentation Update

Update all applicable docs:

- `docs/specification.md`: add each new page to the external API table. If a new subcategory or design rule is introduced, document it near the WebAPI Gallery spec.
- `README.md`: update only if the project-level description, folder structure, or operating instructions changed.
- `fronted-v2/README.md`: update if add-flow fields or category rules changed.
- `docs/apis/free-webapis-not-implemented.md`: remove or mark APIs that have just been implemented when practical.

## Verification

Run:

```bash
node -c fronted-v2/js/catalog.js
```

Then start or reuse the local server:

```bash
node fronted-v2/serve.cjs
```

Verify:

- `http://localhost:5500/fronted-v2/index.html` returns 200.
- Each new `http://localhost:5500/templates/<folder>/<file>.html` returns 200.
- `catalog.js` count matches the gallery count.
- New pages appear under the expected parent and child category.
- Each page has graceful behavior if the live API fails.

Report any API that could not be made fully live and why.
