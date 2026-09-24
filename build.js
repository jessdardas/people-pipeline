/**
 * Builds the Apps Script project in dist/ from the source folders.
 *
 *   app/index.html   page skeleton; every "<!-- @include path -->" line is replaced by that file:
 *                    .css → <style>…</style>, .js → <script>…</script>, .html → pasted as is
 *   server/*.js      server code (runs at Google), copied to dist/
 *   appsscript.json  project settings, copied to dist/
 *
 * Apps Script only stores .gs/.js (server) and .html files, so all the page's css/js ends up inside
 * dist/Index.html. Run:  npm run build   (or  npm run push  to build and clasp push in one go)
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const APP = path.join(ROOT, 'app');
const DIST = path.join(ROOT, 'dist');
const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

function include(rel, indent) {
  const file = path.join(APP, rel);
  if (!fs.existsSync(file)) throw new Error('app/index.html includes a file that does not exist: app/' + rel);
  const body = read(file).trimEnd();
  const pad = (text) =>
    text
      .split('\n')
      .map((l) => (l ? indent + '  ' + l : l))
      .join('\n');
  const label = `${indent}<!-- app/${rel} -->\n`;
  if (rel.endsWith('.css')) return `${label}${indent}<style>\n${pad(body)}\n${indent}</style>`;
  if (rel.endsWith('.js')) return `${label}${indent}<script>\n${pad(body)}\n${indent}</script>`;
  return (
    label +
    body
      .split('\n')
      .map((l) => (l ? indent + l : l))
      .join('\n')
  );
}

const page = read(path.join(APP, 'index.html')).replace(
  /^([ \t]*)<!-- @include (\S+) -->[ \t]*$/gm,
  (m, indent, rel) => include(rel, indent)
);
if (page.includes('<!-- @include')) throw new Error('Could not read an @include line in app/index.html');

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);
fs.writeFileSync(path.join(DIST, 'Index.html'), page);
for (const f of fs.readdirSync(path.join(ROOT, 'server')).filter((f) => /\.(js|gs)$/.test(f))) {
  fs.writeFileSync(path.join(DIST, f), read(path.join(ROOT, 'server', f)));
}
fs.writeFileSync(path.join(DIST, 'appsscript.json'), read(path.join(ROOT, 'appsscript.json')));

console.log('Built dist/: ' + fs.readdirSync(DIST).join(', '));
