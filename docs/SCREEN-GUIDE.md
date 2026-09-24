# Screen guide: what is where

Every numbered item on the screenshots, and the files that control it:

- **HTML**: where it sits on the page (the fixed markup)
- **JS**: the code that fills it in or reacts to clicks (`file` → `function`)
- **CSS**: how it looks (`file` → `.class`)

All paths are inside [`app/`](../app). The screenshots use made-up data.

> **Colours, fonts, corner rounding and shadows** are set once in `core/base-css.html` (`:root`). Change them there and they change everywhere.
> After any change: `clasp push`, then check it in *Deploy → Test deployments*.

---

## 1. Top of the page and the matrix

![Main screen](images/1-main.png)

| # | What you see | HTML | JS | CSS |
|---|---|---|---|---|
| 1 | Title "People Pipeline" | `header/header.html` (`.logo`) | none | `header/header-css.html` → `.logo` |
| 2 | "Last refreshed …" + ↻ refresh button | `header/header.html` (`#rf`) | `header/header-js.html` → `renderRefresh()`; the button calls `refresh()` in `core/main-js.html` | `header/header-css.html` → `.rf` |
| 3 | Search box | `header/header.html` (`.gs`) | `search/search-js.html` → `gSearch()`, `gKey()` | `search/search-css.html` → `.gs`, `.gs-icon` |
| 4 | Service unit buttons (All, London, Beirut …) | `header/header.html` (`#units`) | `header/header-js.html` → `renderUnits()`, `setUnit()`. The order is `UNIT_ORDER` in `core/config-js.html` | `header/header-css.html` → `.units button`, `.on` (selected), `.nodata` (faded: no accounts) |
| 5 | Unit group "BENELUX" | `#units` | `header/header-js.html` → `setGroup()`. Groups are `GROUPS` in `core/config-js.html` | `header/header-css.html` → `.ugrp`, `.grp`, `.row` |
| 6 | "multiple" tick box | `#units` | `header/header-js.html` → `toggleMulti()` | `header/header-css.html` → `.multi` |
| 7 | Pipeline menu button | `header/header.html` (`#pipes`) | `header/header-js.html` → `renderUnits()`, `setPipe()`. Names and descriptions are `PIPES` in `core/config-js.html` | `header/header-css.html` → `.pbtn` |
| 8 | Map tabs (01 Current pipeline … All accounts) | `header/header.html` (`#tabs`) | `header/header-js.html` → `renderUnits()` (bottom part), `setView()` | `header/header-css.html` → `.tabs`, `.tabs button.on`, `.far` ("All accounts") |
| 9 | "Filters" button + "clear" | `header/header.html` (`#fbtn`) | `filters/filter-panel-js.html` → `renderFilters()`, `togglePanel()`, `clearFilters()` | `filters/filters-css.html` → `.fb`, `.fb span` (count), `.fclear` |
| 10 | Map title + the selection under it | drawn in `<main>` | `matrix/matrix-js.html` → `render()`, `scopeText()`, `filterText()`. Titles are `MAPS[…].title` in `matrix/maps-js.html` | `matrix/matrix-css.html` → `.head`, `h1`; `core/base-css.html` → `.meta` |
| 11 | Axis name on top ("PROJECT PHASE (LATEST) →") | `<main>` | `matrix/matrix-js.html` → `render()`; text is `MAPS[…].x` in `matrix/maps-js.html` | `matrix/matrix-css.html` → `.grid th.xl` |
| 12 | Axis name on the side ("LAST MEETING ↓", also the vertical one) | `<main>` | `render()`; text is `MAPS[…].y` | `matrix/matrix-css.html` → `.grid th.xl`, `.grid th.yl` |
| 13 | Column titles (P0 … / 0–6 months …) | `<main>` | `render()`; the list is `MAPS[…].cols` in `matrix/maps-js.html` | `matrix/matrix-css.html` → `.grid th.col` |
| 14 | Row titles + small text under them | `<main>` | `render()`; the list is `MAPS[…].rows` (`t` = title, `s` = small text) | `matrix/matrix-css.html` → `.grid th.row` (its `padding` = the space to the cells), `.grid th.row small` |
| 15 | A cell with a number (click it to see its accounts) | `<main>` | `render()` (colour strength = number ÷ biggest number); a click calls `openCell()` in `table/table-js.html`. Which cell an account goes in: `MAPS[…].place()` | `matrix/matrix-css.html` → `.grid td.c`, `.sel` (selected, coral border), `.hl` (yellow glow after search). Colours: `--heat-low` → `--heat-high` in `core/base-css.html`, mixed by `heatColor()` in `matrix/matrix-js.html` |
| 16 | An empty cell (–) | `<main>` | `render()` | `matrix/matrix-css.html` → `.grid td.zero` |
| 17 | Row totals (right, bold, right next to the cells) | `<main>` | `render()` | `matrix/matrix-css.html` → `.grid td.tot`, `.grid th.tot` |
| 18 | Column totals row | `<main>` | `render()` | `matrix/matrix-css.html` → `.grid tr.sum` |
| 19 | Total accounts on this map | `<main>` | `render()` | `matrix/matrix-css.html` → `.grid td.grand` |
| 20 | "Click a number…" hint | `<main>` | `render()` | `core/base-css.html` → `.hint` |
| 21 | Map 01 toggle: Newest project / Most advanced phase / All projects | `<main>` | `matrix/matrix-js.html` → `projModeHtml()`; a click calls `setProjMode()` in `matrix/maps-js.html`. The options are `PROJECT_MODES`, and the date that decides "newest" is `PROJECT_DATE_COLS`, both in `core/config-js.html`. How each account is placed: `MAPS[1].place()` / `places()` | `matrix/matrix-css.html` → `.pmode`, `.seg`, `.seg button.on` |

Also in `<main>`:
- **"Reading the source file…" while loading:** `app/index.html` (`.loading`, `.spinner`). Styled in `core/base-css.html`.
- **"No accounts for this selection":** `render()` in `matrix/matrix-js.html`. Styled by `.empty` in `core/base-css.html`.

---

## 2. Account table (under the matrix)

![Account table](images/2-table.png)

| # | What you see | JS | CSS |
|---|---|---|---|
| 1 | "5 accounts" | `table/table-js.html` → `renderList()` | `table/table-css.html` → `.inh h2` |
| 2 | Which cell this is ("Current pipeline › …") | `table/table-js.html` → `listBlock()` (text made in `render()`) | `core/base-css.html` → `.meta` |
| 3 | Search in this table | `listBlock()`, `gridRows()` (searches name, owner, country) | `table/table-css.html` → `.dtools input` |
| 4 | Excel / PDF buttons | `export/export-js.html` → `exportList()`, `doExport()`; Excel columns are `expRecord()`, PDF columns are `PDF_COLS` | `core/base-css.html` → `.btn` |
| 5 | × close the table | `table/table-js.html` → `closeCell()` | `table/table-css.html` → `.x2` |
| 6 | **#** counter column | `table/table-js.html` → `renderList()` (`<td class="cnt">`) | `table/table-css.html` → `.tb .cnt` |
| 7 | Column titles (click to sort / filter) | `renderList()`; the columns are `TCOLS` at the top of `table/table-js.html` (`t` = title, `g` = value shown, `s` = sort value) | `table/table-css.html` → `.tb th` |
| 8 | Sorted / filtered column (coloured, ↑ ↓, ●) | `renderList()` | `table/table-css.html` → `.tb th.s`, `.fdot` |
| 9 | A row (click it to open the details panel) | `renderList()` → `openDetail()` | `table/table-css.html` → `.tb td`, row stripes `.tb tbody tr:nth-child(even)`, hover `.tb tbody tr:hover` |
| 10 | Column menu: sort + filter by value | `table/table-js.html` → `openHead()`, `renderHeadList()`, `headSort()`, `headApply()` | `table/table-css.html` → `.hpop`, `.hp-s`; the list inside uses `.fp-list` from `filters/filters-css.html` |

Also:
- **"Show more (… left)"** button: `renderList()`, styled by `.more`.
- **Social media column:** only the platforms (e.g. "Instagram + LinkedIn"), made by `socialPlatforms()` in `table/table-js.html`. All the details are in the account panel.
- **Dates such as "19 Dec 2025 (279 days ago)":** made by `dateAgo()` in `core/helpers-js.html`, used in `TCOLS` (Last meeting, Last validated).

---

## 3. Account details panel

![Details panel](images/3-details.png)

| # | What you see | HTML | JS | CSS |
|---|---|---|---|---|
| 1 | Account name | `details/details.html` (`#aTitle`) | `details/details-js.html` → `openDetail()` | `details/details-css.html` → `.dh h2` |
| 2 | Unit · classification · category | `#aMeta` | `openDetail()` | `details/details-css.html` → `.dh .meta` |
| 3 | × close | `details/details.html` (`.x`) | `details/details-js.html` → `closeDrawer()` | `details/details-css.html` → `.x` |
| 4 | Where the account sits on the maps | `#aBody` | `details/details-js.html` → `locate()` | `details/details-css.html` → `.loc` |
| 5 | "Show on map" | `#aBody` | `search/search-js.html` → `goTo()` | `details/details-css.html` → `.loc button` |
| 6 | Section titles (Overview, Projects, Social media …) | `#aBody` | `openDetail()` | `details/details-css.html` → `.det h3` (the small bar is `.det h3::before`) |
| 7 | Overview list (label / value) | `#aBody` | `openDetail()`: the `kv` list (add or remove a line there). Dates use `dateAgo()` | `details/details-css.html` → `.kv` |
| 8 | Contact persons (from Query 5 in the Excel file; "None yet." until it's added), then Projects, Social media (every platform with all its columns), Other linked rows | `#aBody` | `details/details-js.html` → `openDetail()`, `groupTables()`, `rowsTable()`. The Query 5 sheet is recognised by `isContactsSheet_()` in `server/Code.js` | `table/table-css.html` (`.tb`) + `details/details-css.html` (`.det table.tb`) |

![Details tables](images/3b-details-tables.png)

| # | What you see | JS | CSS |
|---|---|---|---|
| 1 | **#** counter column in the panel's tables | `details/details-js.html` → `rowsTable()` | `table/table-css.html` → `.tb .cnt` |
| 2 | Projects table. Dates get "(N days ago)" | `rowsTable()`, `fmtVal()` | `table/table-css.html` → `.tb` |
| 3 | Social media: every platform and its information (followers, link …) | `rowsTable()`, `cellHtml()` (links) | `table/table-css.html` → `.tb` |

- **"More details" (bottom of the panel):** every other column in the Excel file, shown automatically. Columns that shouldn't appear there are listed in `DET_HIDE` in `details/details-js.html`. Nicer column names are set in `pretty()` in `core/helpers-js.html`.
- **The grey layer behind the panel:** `details/details.html` (`#dim`), styled by `.dim`.

---

## 4. Filter panel

![Filter panel](images/4-filters.png)

| # | What you see | JS | CSS |
|---|---|---|---|
| 1 | List of filters | `filters/filter-panel-js.html` → `renderPanel()`, `panelKeys()`. The filters themselves are `FDEF` in `filters/filters-js.html` | `filters/filters-css.html` → `.fp-l button`, `.on` |
| 2 | Number of values ticked | `renderPanel()`, `draftCount()` | `filters/filters-css.html` → `.fp-l button span` |
| 3 | Name of the chosen filter | `renderPanelOpts()` | `filters/filters-css.html` → `.fp-t` |
| 4 | all / none | `panelAll()` | `core/base-css.html` → `.lnk` |
| 5 | Search the values | `renderPanelList()` | `filters/filters-css.html` → `.fp-q` |
| 6 | Values with their number of accounts | `renderPanelList()`, `popOptions()` | `filters/filters-css.html` → `.fp-list label`, `small` |
| 7 | Reset / Cancel | `panelReset()`, `closePanel()` | `core/base-css.html` → `.lnk` |
| 8 | Apply | `panelApply()` | `core/base-css.html` → `.btn` |

**Social media filters** (platform, followers…) are made automatically from the social media sheet by `buildSocialFilters()` in `filters/filters-js.html`. **Whether an account passes all filters** is decided by `pass()` in `filters/filters-js.html`.

---

## 5. Search results and 6. pipeline menu

![Search](images/5-search.png)

| # | What you see | JS | CSS |
|---|---|---|---|
| 1 | Search box (type 2+ letters, ↑ ↓ Enter work) | `search/search-js.html` → `gSearch()`, `gKey()` | `search/search-css.html` → `.gs input` |
| 2 | A result (click → jumps to the map, cell glows yellow) | `gSearch()`, `goTo()` | `search/search-css.html` → `.gres button`, `.act` (keyboard-selected) |
| 3 | Where it is (unit · map › row × column) | `gSearch()` + `locate()` in `details/details-js.html` | `search/search-css.html` → `.gres small` |

![Pipeline menu](images/6-pipelines.png)

| # | What you see | JS | CSS |
|---|---|---|---|
| 1 | Pipeline button (shows what's selected) | `header/header-js.html` → `renderUnits()` | `header/header-css.html` → `.pbtn` |
| 2 | Pipelines with their description (tick several) | `renderUnits()`, `setPipe()`; texts are `PIPES` in `core/config-js.html` | `header/header-css.html` → `.pmenu label` |
| 3 | All pipelines / Close | `setPipe(null)` | `header/header-css.html` → `.pm-f` |

---

## Other things you may want to change

| I want to… | Go to |
|---|---|
| Change the matrix colours | `--heat-low` (lightest) and `--heat-high` (strongest) in `core/base-css.html` |
| Change the black of buttons / selected items | `--accent` and `--accent-soft` in `core/base-css.html` |
| Change the font | the Google Fonts `<link>` in `app/index.html` + `--font` in `core/base-css.html` |
| Round or square matrix cells | `--cell-radius` in `core/base-css.html` (0 = square) |
| Space between the rows of the tables | `border-spacing` on `table.tb` in `table/table-css.html` |
| Make the matrix cells taller or shorter | `.grid td.c` and `.grid td.c button` (`height`, `min-height`) in `matrix/matrix-css.html` |
| Change the space between cells | `border-spacing` on `table.grid` in `matrix/matrix-css.html` |
| Change the text of a toast message | search for `toast(` in the `*-js.html` files |
| Change the "(N days ago)" wording | `agoText()` in `core/helpers-js.html` |
| Change how dates look | `fmtXl()` in `core/helpers-js.html` |
| Change the loading text | `app/index.html` (`.loading`) |
| Make the details panel wider | `.drawer` → `width` in `details/details-css.html` |
