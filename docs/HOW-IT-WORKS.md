# How it works

```
Google Drive                 Apps Script (server)                   Browser (the page)
people pipeline.xlsx  ──►  server/Code.js + XlsxReader.js ── getData() ──►  app/ (page)
                           read, link on accountid,                  build accounts, filter,
                           compress                                  draw maps / table / details
```

## 1. The server (`server/Code.js`, `server/XlsxReader.js`)

1. **`doGet()`** runs when someone opens the web app URL. It opens `app/index.html`; every `include('…')` line in it pastes in one file from `app/` (see below).
2. **`sourceFile_()`** finds the newest non-trashed Drive file called `people pipeline.xlsx`. If there is none, it uses the fixed `SOURCE_FILE_ID`. This means re-uploading the file is enough; no code change needed.
3. **`readXlsx_()`** reads the `.xlsx` without any add-on: an `.xlsx` is a zip file, so it unzips it and reads the XML of every sheet into rows.
4. **`getData()`** works out what each sheet is **by its column names** (sheet names and order don't matter):
   - The sheet with `accountid` + `name` + `classification` is the **accounts** sheet (one row per account; duplicates are dropped).
   - Every other sheet with an `accountid` column is linked to the accounts. Its role:
     - it has `opportunityid` → **projects**
     - it has a column with "platform" in the name → **social media**
     - otherwise, if an account has several rows → **list** ("Other linked rows")
     - otherwise (one row per account) → **merge**: its columns become extra account fields.
   - Empty rows and exact duplicate rows are skipped.
5. **`packSheet_()`** makes the data smaller before sending it: it stores it column by column, and text that repeats a lot (like "London") is stored once in a dictionary with numbers pointing to it.
6. **`getStamp()`** is a cheap check the page calls every 10 minutes to see if the Drive file changed.

## 2. The page (`app/`)

**Start** (`app/core/main-js.html`): `load()` calls `getData()` on the server, then `build()` and `renderAll()`.

**Building accounts** (`app/core/data-js.html`, `build()`): for every account row it makes one object with easy fields: `name`, `cls` (classification), `category`, `su` (service unit), `phase`, `pipe`, `lastMeeting` (days ago), `postV` (Post-P1 value), `projects`, `social`… It also gives each account its **filter values** (`a.fv`), e.g. the value bucket "10k–25k".

**Filtering** (`app/filters/filters-js.html`, `pass()`): an account is shown only if it matches the selected service units, pipelines, every filter in the panel and the social media filters.

**The 4 maps** (`app/matrix/maps-js.html`, `MAPS`): each map has
- `filter`: which accounts belong on it (e.g. classification = "current pipeline"),
- `rows` and `cols`: the matrix headings,
- `place(a)`: returns `[row, column]` for an account.

| Map | Accounts | Rows | Columns |
|---|---|---|---|
| 01 Current pipeline | classification "current pipeline" | last meeting (< 6 mo, 6–12 mo, 1–2 yrs, > 2 yrs, never) | latest project phase P0–P5 |
| 02 Past clients | classification "past client" | last meeting in 3-month steps | last project (0–6, 6–12, 12–18, 18+ months) |
| 03 No business | past demand, met in/out, contacted, not contacted | account category | classification |
| All accounts | everyone | account category | classification |

**Drawing** (`app/matrix/matrix-js.html`, `render()`): counts the accounts per cell and colours each cell darker the more accounts it holds. Clicking a number opens the **account table** (`app/table/table-js.html`) for that cell, which you can sort, filter per column, search and export.

**Details** (`app/details/details-js.html`, `openDetail()`): the side panel with the overview, projects, social media, and "More details", which lists **every other column in the file**, so new query columns appear there automatically.

**Search** (`app/search/search-js.html`): type 2+ letters, pick an account; `goTo()` switches to the right map, loosens only the filters that would hide it and highlights its cell in yellow.

**Export** (`app/export/export-js.html`): loads the SheetJS / jsPDF libraries only when you click Excel or PDF, then downloads the current table (Excel also gets a "Projects" and an "Info" sheet).

**Auto refresh** (`app/core/main-js.html`): every 10 minutes it asks `getStamp()`; if the file changed (or an hour passed) it reloads the data and keeps the open cell / account.

## Dates

The file stores dates as Excel numbers (days since 1900). `fmtXl()` turns them into readable dates. Dates on or before 1 Jan 2000 (`NEVER = 36600`) mean "never".

## 3. How the files are put together

Apps Script can only store server files (`.gs` / `.js`) and `.html` files. So the page's styles and scripts are `.html` files that contain a `<style>` or `<script>` block: `*-css.html` and `*-js.html`.

- `clasp push` sends `appsscript.json`, `server/` and `app/` to Apps Script (the list is in `.claspignore`). Folders are kept: a file shows up in Apps Script as e.g. `app/matrix/matrix-css`.
- When the page opens, `doGet()` evaluates `app/index.html`. Every `<?!= include('app/…'); ?>` line pastes in that file (`include()` in `server/Code.js`).

**Adding a new file:** create it in the right `app/` folder (a CSS file as `name-css.html` with `<style>…</style>`, a script as `name-js.html` with `<script>…</script>`) and add a line `<?!= include('app/folder/name-css'); ?>` for it in `app/index.html` (scripts: before `core/main-js`).

## Dates in the page

Every date is shown with the days since then, e.g. "19 Dec 2025 (279 days ago)": `dateAgo()` / `agoText()` in `app/core/helpers-js.html`. The Excel export keeps plain dates.
