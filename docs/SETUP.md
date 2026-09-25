# Setup: VS Code + clasp + GitHub

```
edit app/ or server/ in VS Code
   ├─► clasp push          sends the files to Apps Script
   │      └─► Deploy → Test deployments                    check it (only you)
   │      └─► Deploy → Manage deployments → New version    everyone sees it (same URL)
   └─► commit + push       GitHub keeps every version
```

- **`.clasp.json`** links this folder to the Apps Script project (`scriptId` = Apps Script → Project Settings → Script ID).
- **`.claspignore`** lists what `clasp push` sends: `appsscript.json`, `server/*.js` and `app/**/*.html`. Docs and the README stay local.

## Every time you change something

In the VS Code terminal (**Terminal → New Terminal**), inside this folder:

```bash
git pull            # get the latest version (e.g. changes made by Claude)
clasp push          # send it to Apps Script
```

If PowerShell says *"running scripts is disabled"*, use `clasp.cmd push`, or allow scripts once with:
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

Then check it with **Deploy → Test deployments**, and publish with **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.

Save your changes to GitHub from VS Code's **Source Control** panel (commit, then **Sync**), or:

```bash
git add -A
git commit -m "What I changed"
git push
```

## Hourly refresh (one time only)

The app re-reads the Excel file every hour by itself, so the page opens quickly with fresh data. Switch it on once:

1. `clasp push` (so the new code is in Apps Script).
2. In the Apps Script editor, open **server/Code**, choose **setupHourlyRefresh** in the function menu at the top, and click **Run**.
3. Google asks for permission the first time: **Review permissions →** your account **→ Allow**.

To check it's on, open **Triggers** (the clock icon on the left). You should see `refreshData`, running every hour. Running `setupHourlyRefresh` again is safe; it never creates a second trigger.

How the data stays up to date:
- **Every hour** the trigger reads the newest "people pipeline.xlsx" in Drive and stores the result for 6 hours, and every open page reads the file again (the time at the top changes, even when nothing changed).
- **The ↻ button** always reads the file again and tells you "No changes" or "Updated".
- **When the file changes** (a new upload), the next page load reads it right away; it doesn't wait for the hour.
- **Open pages** check every 10 minutes and reload when the file changed, and at least once an hour.
- The Excel file itself comes from the query export. That export must be refreshed wherever it's made (it can't be re-run from Apps Script).

## Admin (New DB date + Data check)

At the bottom right of the page there is a tiny, almost invisible dot. Click it and enter the admin password to:
- change the **New DB** date (accounts validated on or after it). Saved for everyone who opens the app.
- see the **Data check**: every sheet of the Excel file, what it was read as, how many rows linked to an account, and which rows didn't (e.g. an accountid missing from "accounts detailed").

The password is not in the code (this repository is public), only a fingerprint of it (`ADMIN_HASH` in `server/Code.js`). To change it: in the Apps Script editor add a line `function tmp() { console.log(adminHash_('new password')); }`, run `tmp`, copy the result into `ADMIN_HASH`, delete `tmp`, and `clasp push`.

## Good to know

- In the Apps Script editor the files show with their folder, e.g. `app/matrix/matrix-css`. That is normal.
- `clasp push` makes the Apps Script project **exactly like this folder**: edits made directly in the Apps Script editor are overwritten, so make them here.
- `clasp pull` downloads the Apps Script files into this folder. Only use it if you edited in the Apps Script editor and want those edits here, and commit your own work first.
- `appsscript.json` holds the web app settings (`executeAs`, `access`). `"ANYONE_ANONYMOUS"` means anyone with the link can open it without signing in.
- **New file?** Put it in the right `app/` folder as `name-css.html` (`<style>…</style>`) or `name-js.html` (`<script>…</script>`), and add `<?!= include('app/folder/name-css'); ?>` for it in `app/index.html`.
