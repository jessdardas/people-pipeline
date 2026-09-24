# Setup: VS Code + GitHub + Apps Script

This folder is linked to the Apps Script project by `.clasp.json` (the `scriptId` in it is the project's Script ID, from Apps Script → Project Settings → IDs).

```
edit in VS Code  ──►  commit + push (GitHub keeps the history)
                 ──►  clasp push (sends the files to Apps Script)  ──►  Deploy → new version (users see it)
```

## Every time you change something

In the VS Code terminal (**Terminal → New Terminal**), inside this folder:

```bash
git pull            # get the latest version from GitHub (e.g. changes made by Claude)
clasp push          # send all files to Apps Script
```

Then check it with **Deploy → Test deployments** (a private link that always runs the latest code).
When it looks good, publish it: **Deploy → Manage deployments →** pencil icon → **Version: New version → Deploy**.
The web app URL stays the same.

Save your changes to GitHub from VS Code's **Source Control** panel (commit, then **Sync / Push**), or:

```bash
git add -A
git commit -m "What I changed"
git push
```

## Good to know

- `clasp push` makes the Apps Script project **exactly like this folder**: files that only exist in Apps Script are deleted.
- **Never run `clasp pull` over newer local work.** It overwrites your files with what is in Apps Script.
- `appsscript.json` holds the web app settings (**executeAs**, **access**). Change them there or in the Deploy dialog.
- Something broke? Every change is in GitHub (**Commits**). You can see exactly what changed and go back.
