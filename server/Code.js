/**
 * PEOPLE PIPELINE - Google Apps Script web app (the Google side)
 *
 * Source of truth: "people pipeline.xlsx" in Google Drive (the query export).
 * This file: opens the page, finds the Drive file, caches the data, refreshes it every hour and keeps
 * the shared settings (the New DB date). HOW the sheets are read and linked is in server/Pipeline.js.
 * READ ONLY: the app never changes the Excel file.
 */

const SOURCE_FILE_ID = '1dhU0tMGZQL3n8Jfn6LOSfkcsksnrYRKt'; // "people pipeline.xlsx" in Drive (fallback)
const SOURCE_FILE_NAME = 'people pipeline.xlsx'; // newest Drive file with this name is used

/** Opens the web page: app/index.html, with every include('…') in it filled in. */
function doGet() {
  return HtmlService.createTemplateFromFile('app/index')
    .evaluate()
    .setTitle('People Pipeline')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Pastes one file of the project into the page, e.g. include('app/matrix/matrix-css'). */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/** The newest non-trashed "people pipeline.xlsx" in Drive (so re-uploads are picked up), else the fixed file id. */
function sourceFile_() {
  let best = null;
  const it = DriveApp.getFilesByName(SOURCE_FILE_NAME);
  while (it.hasNext()) {
    const f = it.next();
    if (!f.isTrashed() && (!best || f.getLastUpdated() > best.getLastUpdated())) best = f;
  }
  return best || DriveApp.getFileById(SOURCE_FILE_ID);
}

/** Cheap check used by the page to see if the file changed (auto refresh). */
function getStamp() {
  const f = sourceFile_();
  return { id: f.getId(), updated: f.getLastUpdated().getTime() };
}

/** Reads the Drive file now (see server/XlsxReader.js and server/Pipeline.js). */
function readSource_(file) {
  return buildFromSheets_(readXlsx_(file.getId()), {
    name: file.getName(),
    id: file.getId(),
    updated: file.getLastUpdated().getTime(),
    loaded: Date.now()
  });
}

/* ---------- data for the page (cached, refreshed every hour) ---------- */

/**
 * Everything the page needs + the shared settings.
 * force = true (the ↻ button, the hourly refresh): always read the Excel file again.
 * Otherwise the cached copy is used while the Drive file hasn't changed.
 * source.changed tells the page whether the data is different from the last read.
 */
function getData(force) {
  const file = sourceFile_();
  const stamp = file.getId() + ':' + file.getLastUpdated().getTime();
  const cached = readCache_();
  let data;
  if (!force && cached && cached.stamp === stamp) {
    data = cached.data;
    data.source.changed = false;
  } else {
    data = readSource_(file);
    data.source.changed = !cached || cached.data.source.hash !== data.source.hash;
    writeCache_(stamp, data);
  }
  delete data.checks; // only for the Data check screen (checkSource)
  data.settings = getSettings_();
  return data;
}

/** Run by the hourly trigger: reads the Drive file again and stores the result, so the page opens fast. */
function refreshData() {
  const file = sourceFile_();
  writeCache_(file.getId() + ':' + file.getLastUpdated().getTime(), readSource_(file));
}

/**
 * Run this ONCE from the Apps Script editor (select "setupHourlyRefresh" → Run) to start the hourly refresh.
 * Running it again replaces the old trigger (never creates two).
 */
function setupHourlyRefresh() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'refreshData') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('refreshData').timeBased().everyHours(1).create();
  refreshData();
}

/* The cache holds max 100 KB per entry, so the data is zipped and cut into pieces. Kept 6 hours (the maximum). */
const CACHE_KEY = 'pp_data';
const CACHE_PIECE = 90000;

function writeCache_(stamp, data) {
  try {
    const zipped = Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(JSON.stringify(data))).getBytes());
    const pieces = {};
    let n = 0;
    for (let i = 0; i < zipped.length; i += CACHE_PIECE) pieces[CACHE_KEY + '_' + n++] = zipped.slice(i, i + CACHE_PIECE);
    pieces[CACHE_KEY] = JSON.stringify({ stamp: stamp, n: n });
    CacheService.getScriptCache().putAll(pieces, 21600);
  } catch (e) {
    console.warn('Could not cache the data: ' + e); // the page still works, it just reads the file each time
  }
}

function readCache_() {
  try {
    const cache = CacheService.getScriptCache();
    const meta = JSON.parse(cache.get(CACHE_KEY) || 'null');
    if (!meta) return null;
    const keys = [];
    for (let i = 0; i < meta.n; i++) keys.push(CACHE_KEY + '_' + i);
    const got = cache.getAll(keys);
    if (
      keys.some(function (k) {
        return !got[k];
      })
    )
      return null;
    const blob = Utilities.newBlob(
      Utilities.base64Decode(
        keys
          .map(function (k) {
            return got[k];
          })
          .join('')
      ),
      'application/x-gzip'
    );
    return { stamp: meta.stamp, data: JSON.parse(Utilities.ungzip(blob).getDataAsString()) };
  } catch (e) {
    return null;
  }
}

/* ---------- shared settings (the admin button, bottom right of the page) ---------- */

/** Used when nothing was saved yet. newDbFrom: the New DB view shows accounts validated on or after this day. */
const DEFAULT_SETTINGS = { newDbFrom: '2026-07-01' };

/**
 * The admin password is NOT stored in the code (this repository is public), only a fingerprint of it.
 * To change the password: in the editor run  adminHash_('new password')  and put the result here.
 */
const ADMIN_HASH = 'fcc5a0fbe0d3b33b95ce47e89c5ae92a24055ba5fb8833ad0e4c664703c0bbce';

function adminHash_(password) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    'people-pipeline:' + password,
    Utilities.Charset.UTF_8
  );
  return bytes
    .map(function (b) {
      return ((b + 256) % 256).toString(16).padStart(2, '0');
    })
    .join('');
}

function checkPassword_(password) {
  if (adminHash_(String(password || '')) !== ADMIN_HASH) throw new Error('Wrong password');
}

function getSettings_() {
  const saved = PropertiesService.getScriptProperties().getProperty('pp_settings');
  return Object.assign({}, DEFAULT_SETTINGS, saved ? JSON.parse(saved) : {});
}

/** Saves the settings for everyone (called by the admin panel). */
function saveSettings(password, settings) {
  checkPassword_(password);
  const s = getSettings_();
  if (settings && /^\d{4}-\d{2}-\d{2}$/.test(settings.newDbFrom || '')) s.newDbFrom = settings.newDbFrom;
  else throw new Error('Pick a valid date');
  s.savedAt = Date.now();
  PropertiesService.getScriptProperties().setProperty('pp_settings', JSON.stringify(s));
  return s;
}

/** "Data check" in the admin panel: how every sheet of the Excel file was read (no account data). */
function checkSource(password) {
  checkPassword_(password);
  const data = readSource_(sourceFile_());
  return { source: data.source, accounts: data.accounts, checks: data.checks };
}
