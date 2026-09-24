# Setup: VS Code + GitHub + Apps Script

```
edit app/ or server/ in VS Code
   ├─► npm run push        build.js puts app/ together into dist/, then clasp sends dist/ to Apps Script
   │      └─► Deploy → Test deployments   check it (only you)
   │      └─► Deploy → Manage deployments → New version   everyone sees it (same URL)
   └─► commit + push       GitHub keeps every version
```

`.clasp.json` links this folder to the Apps Script project (`scriptId` = Apps Script → Project Settings → Script ID; `rootDir: dist` = send the built files).

## Every time you change something

In the VS Code terminal (**Terminal → New Terminal**), inside this folder:

```bash
git pull            # get the latest version (e.g. changes made by Claude)
npm run push        # build + clasp push
```

If PowerShell says *"running scripts is disabled"*, use `npm.cmd run push`, or allow scripts once with:
`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

Check it with **Deploy → Test deployments**, then publish with **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.

Save your changes to GitHub from VS Code's **Source Control** panel (commit, then **Sync**), or:

```bash
git add -A
git commit -m "What I changed"
git push
```

## Good to know

- **Only edit `app/`, `server/` and `appsscript.json`.** `dist/` is rebuilt on every `npm run push`, and isn't saved in GitHub.
- `clasp push` makes the Apps Script project **exactly like `dist/`**. Edits made directly in the Apps Script editor are overwritten, so make them here instead.
- **Never run `clasp pull`.** It would download the built single file over this folder structure.
- `appsscript.json` holds the web app settings (`executeAs`, `access`). `"ANYONE_ANONYMOUS"` means anyone with the link can open it without signing in.
- New file? Put it in the right `app/` folder and add an `<!-- @include folder/file -->` line in `app/index.html`.
