# People Pipeline

A Google Apps Script web app for PSLAB. It reads the **"people pipeline.xlsx"** export from Google Drive and shows every account on four "maps" (matrices), with filters, search, account details and Excel / PDF export. It is **read only**: it never changes the Drive file.

![Main screen](docs/images/1-main.png)

## Folders

Every part of the screen has its own folder in `app/`. Apps Script only stores `.html` files for the page, so:
**`*-css.html`** = the styles (a `<style>` block), **`*-js.html`** = the code (a `<script>` block), other `.html` = the markup.

```
app/
  index.html        page skeleton: include('…') lines for every file below, in order
  core/             base-css (colours, fonts, buttons) · config-js (settings) · helpers-js · data-js · main-js (start + refresh)
  header/           header.html · header-css · header-js   (logo, service units, pipelines, tabs)
  search/           search-css · search-js                  (search box + results)
  filters/          filters-css · filters-js (filter rules) · filter-panel-js (the Filters panel)
  matrix/           matrix-css · maps-js (the 4 maps: rows, columns) · matrix-js (draws the grid)
  table/            table-css · table-js                    (account table under the matrix)
  details/          details.html · details-css · details-js (account side panel)
  export/           export-js                               (Excel / PDF)
  admin/            admin.html · admin-css · admin-js        (hidden admin dot: New DB date + Data check)
server/             Code.js (page, Drive file, cache, hourly refresh, settings) · Pipeline.js (how the sheets are read
                    and linked) · XlsxReader.js (reads the .xlsx)
appsscript.json     Apps Script settings (time zone, web app access)
```

**[docs/SCREEN-GUIDE.md](docs/SCREEN-GUIDE.md) shows every item on the screen and exactly which file and CSS class controls it.**

## Working on it (VS Code + clasp)

```bash
git pull          # get the latest version
clasp push        # send app/, server/ and appsscript.json to Apps Script
```

Then check it in Apps Script with **Deploy → Test deployments**, and publish with **Deploy → Manage deployments → ✏️ → New version**.
More in [docs/SETUP.md](docs/SETUP.md).

## Quick "where do I change…"

| Change | File |
|---|---|
| Colours, font, rounding | `app/core/base-css.html` (top) |
| Service units, groups, pipelines, value buckets | `app/core/config-js.html` |
| Rows / columns of a map | `MAPS` in `app/matrix/maps-js.html` |
| Matrix look (cells, spacing, titles) | `app/matrix/matrix-css.html` |
| Columns of the account table | `TCOLS` in `app/table/table-js.html` |
| Lines in the account details overview | `openDetail()` in `app/details/details-js.html` |
| Filters in the panel | `FDEF` in `app/filters/filters-js.html` |
| Excel / PDF columns | `expRecord()` / `PDF_COLS` in `app/export/export-js.html` |
| Map 01: which projects count as open | `OPEN_STATUS` in `app/core/config-js.html` |
| Hourly refresh | `refreshData()` / `setupHourlyRefresh()` in `server/Code.js` (see docs/SETUP.md) |
| How each Excel sheet is read / combined | `server/Pipeline.js` (see docs/HOW-IT-WORKS.md) |
| New DB date (for everyone) | the hidden dot at the bottom right of the page (admin password) |
| Admin password | `ADMIN_HASH` in `server/Code.js` (see docs/SETUP.md) |
| Which Drive file is read | `SOURCE_FILE_NAME` / `SOURCE_FILE_ID` in `server/Code.js` |

## Docs

- [docs/SCREEN-GUIDE.md](docs/SCREEN-GUIDE.md): every item on the screen and where to change it
- [docs/SETUP.md](docs/SETUP.md): VS Code, clasp and GitHub, step by step
- [docs/HOW-IT-WORKS.md](docs/HOW-IT-WORKS.md): how the code works
