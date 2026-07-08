---
name: webapi-page-maker
description: Create WebAPI introduction pages for this teamT-app project from the split free WebAPI candidate ledger. Use when the user invokes $webapi-page-maker with a file number and direction flag, or wants templates/, fronted-v2/js/catalog.js, README/specification docs kept consistent for new WebAPI pages.
---

# webapi-page-maker

Create self-contained HTML pages from the split free WebAPI candidate ledger, place them under the correct `templates/` category folder, update gallery metadata and docs in the same change, then remove completed candidate rows from the ledger.

## Inputs

- Required invocation format: `$webapi-page-maker (<fileNumber>,<topDown>)`
  - `fileNumber`: the final digit of `docs/apis/free-webapis-not-implemented-<fileNumber>.md`. Valid values are `1` through `5`.
  - `topDown`: boolean direction flag. `true` means implement from the top candidate row downward. `false` means implement from the bottom candidate row upward.
- Optional user hints: number of candidates to implement, desired Japanese title/category, sample endpoint, whether API keys are allowed.

If the user does not specify a count, implement the first practical candidate in the selected direction. If a selected candidate cannot be implemented after reasonable research, leave its row in the ledger and continue to the next candidate only when the user requested multiple implementations.

## Required Preflight

1. Read `README.md`.
2. Read `docs/specification.md`.
3. Read `fronted-v2/README.md`.
4. Read `fronted-v2/js/catalog.js` and inspect existing ids, category names, `categoryPath` examples, and style of descriptions.
5. Read `.agents/skills/no-test/SKILL.md` and follow it for this run.
6. Open `docs/apis/free-webapis-not-implemented.md` to confirm the split-file index, then open `docs/apis/free-webapis-not-implemented-<fileNumber>.md`.
7. Read the control line near the top of the chosen split file before selecting work. If it is `control: stop`, do not implement anything; finish immediately and report that the stop control was detected.
8. Select candidate rows from the chosen split file according to `topDown`.

## Stop Control

Each split ledger file must keep a control line near the top:

```md
control: continue
```

To stop an in-progress batch at the next safe checkpoint, the user may edit that line to:

```md
control: stop
```

Rules:

- Check the chosen split file's control line before starting work and again after each single API page is fully implemented, documented, and removed from the ledger.
- If the control line is `control: stop`, stop before selecting or starting the next API.
- Report that `control: stop` was detected and which file contained it.
- Do not change `control: stop` back to `control: continue` unless the user explicitly asks.
- Treat a missing control line as `control: continue`, but add the line when editing that ledger file.

## Research Rules

- Browse each selected candidate URL. Prefer the official API docs for endpoints, auth, rate limits, CORS notes, and response examples.
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
- `docs/apis/free-webapis-not-implemented-<fileNumber>.md`: after a candidate is fully implemented and documented, delete that candidate row from the split ledger. Do not merely mark it as implemented.
- `docs/apis/free-webapis-not-implemented.md`: update counts or split-file summaries when the row deletion changes them.

## Verification

Because this skill always uses the `no-test` workflow, do not run tests, builds, lint, `node -c`, preview servers, browser checks, or any other verification commands after making changes.

Before finishing, report:

- Which split file and direction were used.
- Which candidate row(s) were implemented and removed.
- That verification was intentionally skipped because `no-test` is mandatory for this skill.
- Any API that could not be made fully live and why.
