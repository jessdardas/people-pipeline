/* ---------- .xlsx reader (Drive file → rows of cell values), no extra services needed ----------
 * An .xlsx file is a zip of XML files. This reads them with a few tolerant patterns:
 * works with or without "x:" name prefixes, with any attribute order, and with cells that have no position. */
function readXlsx_(fileId) {
  const blob = DriveApp.getFileById(fileId).getBlob().setContentType('application/zip');
  const files = {};
  Utilities.unzip(blob).forEach(function (b) {
    files[b.getName().replace(/^\//, '')] = b;
  });
  return parseXlsxParts_(function (n) {
    return files[n] ? files[n].getDataAsString('UTF-8') : '';
  });
}

/** txt(path) → the text of one file inside the .xlsx zip. Returns [{ name, rows }]. */
function parseXlsxParts_(txt) {
  const dec = function (s) {
    return String(s)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#x([0-9a-f]+);/gi, function (m, h) {
        return String.fromCharCode(parseInt(h, 16));
      })
      .replace(/&#(\d+);/g, function (m, d) {
        return String.fromCharCode(+d);
      })
      .replace(/&amp;/g, '&');
  };
  const attr = function (tag, name) {
    const m = tag.match(new RegExp('\\s(?:\\w+:)?' + name + '="([^"]*)"'));
    return m ? m[1] : null;
  };
  const P = '(?:\\w+:)?'; // optional "x:" prefix

  // shared strings (text used in many cells is stored once); <rPh> = phonetic hints, not part of the text
  const shared = [];
  const sst = txt('xl/sharedStrings.xml');
  const siRe = new RegExp('<' + P + 'si>([\\s\\S]*?)</' + P + 'si>', 'g');
  const tRe = new RegExp('<' + P + 't(?:\\s[^>]*)?>([\\s\\S]*?)</' + P + 't>', 'g');
  let m;
  while ((m = siRe.exec(sst))) {
    const body = m[1].replace(new RegExp('<' + P + 'rPh[\\s\\S]*?</' + P + 'rPh>', 'g'), '');
    let s = '',
      t;
    tRe.lastIndex = 0;
    while ((t = tRe.exec(body))) s += t[1];
    shared.push(dec(s));
  }

  // which file holds which sheet
  const rels = {};
  const rx = txt('xl/_rels/workbook.xml.rels');
  const relRe = /<(?:\w+:)?Relationship\s[^>]*>/g;
  while ((m = relRe.exec(rx))) rels[attr(m[0], 'Id')] = attr(m[0], 'Target');

  const colNum = function (ref) {
    let n = 0;
    for (let i = 0; i < ref.length; i++) n = n * 26 + ref.charCodeAt(i) - 64;
    return n - 1;
  };
  const out = [];
  const wb = txt('xl/workbook.xml');
  const shRe = new RegExp('<' + P + 'sheet\\s[^>]*>', 'g');
  while ((m = shRe.exec(wb))) {
    const target = rels[attr(m[0], 'id')];
    if (!target) continue;
    const path = target.replace(/^\/?(xl\/)?/, 'xl/');
    const xml = txt(path),
      rows = [];
    const rowRe = new RegExp('<' + P + 'row\\b([^>]*?)(?:/>|>([\\s\\S]*?)</' + P + 'row>)', 'g');
    const cRe = new RegExp('<' + P + 'c\\b([^>]*?)(?:/>|>([\\s\\S]*?)</' + P + 'c>)', 'g');
    const vRe = new RegExp('<' + P + 'v>([\\s\\S]*?)</' + P + 'v>');
    let r,
      nextRow = 0;
    while ((r = rowRe.exec(xml))) {
      const rn = attr(' ' + r[1], 'r');
      const row = rn ? +rn - 1 : nextRow;
      nextRow = row + 1;
      const cells = (rows[row] = rows[row] || []);
      let c,
        nextCol = 0;
      cRe.lastIndex = 0;
      while ((c = cRe.exec(r[2] || ''))) {
        const ref = attr(' ' + c[1], 'r');
        const col = ref ? colNum(ref.replace(/\d+/g, '')) : nextCol;
        nextCol = col + 1;
        const t = attr(' ' + c[1], 't') || 'n',
          body = c[2] || '';
        const vm = body.match(vRe);
        let val = '';
        if (t === 's') val = vm ? shared[+vm[1]] : '';
        else if (t === 'inlineStr') {
          tRe.lastIndex = 0;
          let s = '',
            tt;
          while ((tt = tRe.exec(body))) s += tt[1];
          val = dec(s);
        } else if (t === 'e') val = ''; // #N/A and other errors
        else if (vm) val = t === 'n' ? Number(vm[1]) : dec(vm[1]);
        if (val === undefined) val = '';
        cells[col] = val;
      }
    }
    let w = 0;
    rows.forEach(function (x) {
      if (x && x.length > w) w = x.length;
    });
    for (let i = 0; i < rows.length; i++) {
      const x = (rows[i] = rows[i] || []);
      for (let j = 0; j < w; j++) if (x[j] === undefined) x[j] = '';
    }
    out.push({ name: dec(attr(m[0], 'name') || 'Sheet'), rows: rows });
  }
  return out;
}
