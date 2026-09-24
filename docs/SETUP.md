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

## Good to know

- In the Apps Script editor the files show with their folder, e.g. `app/matrix/matrix-css`. That is normal.
- `clasp push` makes the Apps Script project **exactly like this folder**: edits made directly in the Apps Script editor are overwritten, so make them here.
- `clasp pull` downloads the Apps Script files into this folder. Only use it if you edited in the Apps Script editor and want those edits here, and commit your own work first.
- `appsscript.json` holds the web app settings (`executeAs`, `access`). `"ANYONE_ANONYMOUS"` means anyone with the link can open it without signing in.
- **New file?** Put it in the right `app/` folder as `name-css.html` (`<style>…</style>`) or `name-js.html` (`<script>…</script>`), and add `<?!= include('app/folder/name-css'); ?>` for it in `app/index.html`.
