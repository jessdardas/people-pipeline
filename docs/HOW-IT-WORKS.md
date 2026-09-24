# How it works

```
Google Drive                 Apps Script (server)                   Browser (the page)
people pipeline.xlsx  ──►  server/Code.js + XlsxReader.js ── getData() ──►  app/ (built into Index.html)
                           read, link on accountid,                  build accounts, filter,
                           compress                                  draw maps / table / details
```

## 1. The server (`server/Code.js`, `server/XlsxReader.js`)

1. **`doGet()`** runs when someone opens the web app URL and sends `Index.html`. That file is made by `build.js` from everything in `app/` (see below).
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

**Start** (`app/core/main.js`): `load()` calls `getData()` on the server, then `build()` and `renderAll()`.

**Building accounts** (`app/core/data.js`, `build()`): for every account row it makes one object with easy fields: `name`, `cls` (classification), `category`, `su` (service unit), `phase`, `pipe`, `lastMeeting` (days ago), `postV` (Post-P1 value), `projects`, `social`… It also gives each account its **filter values** (`a.fv`), e.g. the value bucket "10k–25k".

**Filtering** (`app/filters/filters.js`, `pass()`): an account is shown only if it matches the selected service units, pipelines, every filter in the panel and the social media filters.

**The 4 maps** (`app/matrix/maps.js`, `MAPS`): each map has
- `filter`: which accounts belong on it (e.g. classification = "current pipeline"),
- `rows` and `cols`: the matrix headings,
- `place(a)`: returns `[row, column]` for an account.

| Map | Accounts | Rows | Columns |
|---|---|---|---|
| 01 Current pipeline | classification "current pipeline" | last meeting (< 6 mo, 6–12 mo, 1–2 yrs, > 2 yrs, never) | latest project phase P0–P5 |
| 02 Past clients | classification "past client" | last meeting in 3-month steps | last project (0–6, 6–12, 12–18, 18+ months) |
| 03 No business | past demand, met in/out, contacted, not contacted | account category | classification |
| All accounts | everyone | account category | classification |

**Drawing** (`app/matrix/matrix.js`, `render()`): counts the accounts per cell and colours each cell darker the more accounts it holds. Clicking a number opens the **account table** (`app/table/table.js`) for that cell, which you can sort, filter per column, search and export.

**Details** (`app/details/details.js`, `openDetail()`): the side panel with the overview, projects, social media, and "More details", which lists **every other column in the file**, so new query columns appear there automatically.

**Search** (`app/search/search.js`): type 2+ letters, pick an account; `goTo()` switches to the right map, loosens only the filters that would hide it and highlights its cell in yellow.

**Export** (`app/export/export.js`): loads the SheetJS / jsPDF libraries only when you click Excel or PDF, then downloads the current table (Excel also gets a "Projects" and an "Info" sheet).

**Auto refresh** (`app/core/main.js`): every 10 minutes it asks `getStamp()`; if the file changed (or an hour passed) it reloads the data and keeps the open cell / account.

## Dates

The file stores dates as Excel numbers (days since 1900). `fmtXl()` turns them into readable dates. Dates on or before 1 Jan 2000 (`NEVER = 36600`) mean "never".

## 3. The build (`build.js`)

Apps Script can only store server files (`.gs` / `.js`) and `.html` files, so it cannot hold the page's `.css` and `.js` files as they are.
`npm run build` runs `build.js`, which:

1. reads `app/index.html`,
2. replaces every `<!-- @include folder/file -->` line with that file (`.css` → `<style>`, `.js` → `<script>`, `.html` → pasted as is),
3. writes the result to `dist/Index.html`, and copies `server/*.js` and `appsscript.json` into `dist/`.

`clasp push` sends `dist/` to Apps Script (`"rootDir": "dist"` in `.clasp.json`). `npm run push` does both. Never edit `dist/`; it is rebuilt every time (and not saved in GitHub).

**Adding a new file:** create it in the right `app/` folder and add an `<!-- @include folder/file -->` line for it in `app/index.html` (scripts: before `core/main.js`).

## Dates in the page

Every date is shown with the days since then, e.g. "19 Dec 2025 (279 days ago)": `dateAgo()` / `agoText()` in `app/core/helpers.js`. The Excel export keeps plain dates.
