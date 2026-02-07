import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const sourcePath = 'Normalized_Audio_Gear_Final_v2.xlsx';
const outputSchemaPath = path.join('db', 'schema.sql');
const outputSeedPath = path.join('db', 'seed.sql');

const workbook = xlsx.readFile(sourcePath);
const sheetNames = workbook.SheetNames;

const TABLE_OVERRIDES = {
  TWS: 'tws_products'
};

const quoteId = (value) => `"${String(value).replace(/"/g, '""')}"`;

const toSnake = (value) => {
  const base = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');
  if (!base) return 'column';
  return /^[0-9]/.test(base) ? `c_${base}` : base;
};

const uniqueKeys = (keys) => {
  const seen = new Map();
  return keys.map((key) => {
    const count = seen.get(key) ?? 0;
    const next = count + 1;
    seen.set(key, next);
    return count === 0 ? key : `${key}_${next}`;
  });
};

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toSqlValue = (value) => {
  if (value === null || value === undefined || value === '') return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${String(value).replace(/\r?\n/g, ' ').replace(/'/g, "''")}'`;
};

const toNumber = (value) => {
  if (value === '' || value === '-' || value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value).replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const primaryColumnHints = [
  'tws',
  'iem',
  'headphone_video_review',
  'headphone',
  'dac',
  'speaker',
  'microphone',
  'soundcard',
  'cable',
  'kabel',
  'eartips',
  'dap',
  'headphone_amp',
  'soundbar'
];

const pickPrimaryColumn = (columns) => {
  for (const hint of primaryColumnHints) {
    const match = columns.find((column) => column.key === hint);
    if (match) return match.key;
  }
  return columns[0]?.key ?? null;
};

const pickPriceColumn = (columns) =>
  columns.find((column) => column.key.includes('price'))?.key ?? null;

const twsColumnMap = [
  { key: 'tier', label: 'Tier', source: 'Tier' },
  { key: 'price_performance', label: 'Value for Money', source: 'Value for Money' },
  { key: 'name', label: 'TWS', source: 'TWS' },
  { key: 'price_idr', label: 'Price', source: 'Price', numeric: true },
  { key: 'microphone_performance', label: 'Microphone Test', source: 'Microphone Test' },
  { key: 'review_summary', label: 'Review Notes', source: 'Review Notes' },
  { key: 'bluetooth_codec', label: 'Bluetooth Codec', source: 'Bluetooth Codec' },
  { key: 'battery_life', label: 'Battery Life (No ANC)', source: 'Battery Life (No ANC)' },
  { key: 'anc_level', label: 'ANC Performance (dB)', source: 'ANC Performance (dB)' },
  { key: 'transparency_mode', label: 'Transparency Mode', source: 'Transparency Mode' },
  { key: 'equalizer_type', label: 'Equalizer', source: 'Equalizer' },
  { key: 'overall_sound_score', label: 'Overall Sound Quality', source: 'Overall Sound Quality', numeric: true },
  { key: 'bass_score', label: 'Bass', source: 'Bass', numeric: true },
  { key: 'low_mid_score', label: 'Lo Mid', source: 'Lo Mid', numeric: true },
  { key: 'high_mid_score', label: 'Hi Mid', source: 'Hi Mid', numeric: true },
  { key: 'treble_score', label: 'Treble', source: 'Treble', numeric: true },
  { key: 'vocal_score', label: 'Vocal', source: 'Vocal', numeric: true },
  { key: 'soundstage_score', label: 'Soundstage', source: 'Soundstage', numeric: true },
  { key: 'separation_score', label: 'Separation', source: 'Separation', numeric: true },
  { key: 'imaging_score', label: 'Imaging', source: 'Imaging', numeric: true },
  { key: 'timbre_score', label: 'Timbre', source: 'Timbre', numeric: true },
  { key: 'punch_score', label: 'Punch', source: 'Punch', numeric: true },
  { key: 'clarity_score', label: 'Clarity & Resolution', source: 'Clarity & Resolution', numeric: true },
  { key: 'gaming_mode', label: 'Gaming Mode Low Latency', source: 'Gaming Mode Low Latency' },
  { key: 'sound_tuning', label: 'Sound Tuning', source: 'Sound Tuning' },
  { key: 'ip_rating', label: 'IP Rating', source: 'IP Rating' },
  { key: 'multipoint', label: 'Multipoint Connection', source: 'Multipoint Connection' },
  { key: 'recommended_eartips', label: 'Recommended Eartips', source: 'Recommended Eartips' }
];

const twsTableColumns = [
  'slug',
  'name',
  'highlights',
  'tier',
  'price_performance',
  'price_idr',
  'microphone_performance',
  'review_summary',
  'bluetooth_codec',
  'battery_life',
  'anc_level',
  'transparency_mode',
  'equalizer_type',
  'overall_sound_score',
  'bass_score',
  'low_mid_score',
  'high_mid_score',
  'treble_score',
  'vocal_score',
  'soundstage_score',
  'separation_score',
  'imaging_score',
  'timbre_score',
  'punch_score',
  'clarity_score',
  'gaming_mode',
  'sound_tuning',
  'ip_rating',
  'multipoint',
  'recommended_eartips'
];

const schemaStatements = [];
const seedStatements = [];
const metaStatements = [];

schemaStatements.push('DROP TABLE IF EXISTS dataset_meta;');

for (const sheet of sheetNames) {
  const tableName = TABLE_OVERRIDES[sheet] ?? toSnake(sheet);
  schemaStatements.push(`DROP TABLE IF EXISTS ${quoteId(tableName)};`);
}

schemaStatements.push(`CREATE TABLE IF NOT EXISTS dataset_meta (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  table_name TEXT NOT NULL,
  columns_json TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  primary_column TEXT,
  price_column TEXT,
  has_slug INTEGER NOT NULL DEFAULT 0
);`);

schemaStatements.push(`CREATE TABLE IF NOT EXISTS ${quoteId('tws_products')} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  row_order INTEGER NOT NULL,
  slug TEXT,
  name TEXT NOT NULL,
  highlights TEXT,
  tier TEXT,
  price_performance TEXT,
  price_idr REAL,
  microphone_performance TEXT,
  review_summary TEXT,
  bluetooth_codec TEXT,
  battery_life TEXT,
  anc_level TEXT,
  transparency_mode TEXT,
  equalizer_type TEXT,
  overall_sound_score REAL,
  bass_score REAL,
  low_mid_score REAL,
  high_mid_score REAL,
  treble_score REAL,
  vocal_score REAL,
  soundstage_score REAL,
  separation_score REAL,
  imaging_score REAL,
  timbre_score REAL,
  punch_score REAL,
  clarity_score REAL,
  gaming_mode TEXT,
  sound_tuning TEXT,
  ip_rating TEXT,
  multipoint TEXT,
  recommended_eartips TEXT
);`);

schemaStatements.push(`CREATE INDEX IF NOT EXISTS idx_tws_products_tier ON ${quoteId('tws_products')} (tier);`);
schemaStatements.push(`CREATE INDEX IF NOT EXISTS idx_tws_products_score ON ${quoteId('tws_products')} (overall_sound_score);`);

const datasetMetaRows = [];

const addDatasetMeta = ({
  key,
  label,
  tableName,
  columns,
  rowCount,
  sortOrder,
  primaryColumn,
  priceColumn,
  hasSlug
}) => {
  datasetMetaRows.push({
    key,
    label,
    tableName,
    columnsJson: JSON.stringify(columns),
    rowCount,
    sortOrder,
    primaryColumn,
    priceColumn,
    hasSlug
  });
};

seedStatements.push('DELETE FROM dataset_meta;');

sheetNames.forEach((sheet, index) => {
  const sheetName = sheet;
  const tableName = TABLE_OVERRIDES[sheetName] ?? toSnake(sheetName);
  const sheetRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

  if (sheetName === 'TWS') {
    const slugCounts = new Map();
    const uniqueSlug = (base) => {
      const count = slugCounts.get(base) ?? 0;
      const next = count + 1;
      slugCounts.set(base, next);
      return count === 0 ? base : `${base}-${next}`;
    };

    const columns = twsColumnMap.map(({ key, label }) => ({ key, label }));
    const primaryColumn = 'name';
    const priceColumn = 'price_idr';

    addDatasetMeta({
      key: 'tws',
      label: sheetName,
      tableName: 'tws_products',
      columns,
      rowCount: sheetRows.length,
      sortOrder: index + 1,
      primaryColumn,
      priceColumn,
      hasSlug: 1
    });

    seedStatements.push(`DELETE FROM ${quoteId('tws_products')};`);

    sheetRows.forEach((row, rowIndex) => {
      const name = row['TWS'];
      const baseSlug = slugify(name || `tws-${rowIndex + 1}`);
      const slug = uniqueSlug(baseSlug || `tws-${rowIndex + 1}`);

      const mapped = {
        slug,
        name: name ?? '',
        highlights: '',
        tier: row['Tier'],
        price_performance: row['Value for Money'],
        price_idr: toNumber(row['Price']),
        microphone_performance: row['Microphone Test'],
        review_summary: row['Review Notes'],
        bluetooth_codec: row['Bluetooth Codec'],
        battery_life: row['Battery Life (No ANC)'],
        anc_level: row['ANC Performance (dB)'],
        transparency_mode: row['Transparency Mode'],
        equalizer_type: row['Equalizer'],
        overall_sound_score: toNumber(row['Overall Sound Quality']),
        bass_score: toNumber(row['Bass']),
        low_mid_score: toNumber(row['Lo Mid']),
        high_mid_score: toNumber(row['Hi Mid']),
        treble_score: toNumber(row['Treble']),
        vocal_score: toNumber(row['Vocal']),
        soundstage_score: toNumber(row['Soundstage']),
        separation_score: toNumber(row['Separation']),
        imaging_score: toNumber(row['Imaging']),
        timbre_score: toNumber(row['Timbre']),
        punch_score: toNumber(row['Punch']),
        clarity_score: toNumber(row['Clarity & Resolution']),
        gaming_mode: row['Gaming Mode Low Latency'],
        sound_tuning: row['Sound Tuning'],
        ip_rating: row['IP Rating'],
        multipoint: row['Multipoint Connection'],
        recommended_eartips: row['Recommended Eartips']
      };

      const values = twsTableColumns.map((column) => toSqlValue(mapped[column]));
      const insert = `INSERT OR REPLACE INTO ${quoteId('tws_products')} (row_order, ${twsTableColumns
        .map(quoteId)
        .join(', ')}) VALUES (${rowIndex + 1}, ${values.join(', ')});`;
      seedStatements.push(insert);
    });

    return;
  }

  const headers = sheetRows.length ? Object.keys(sheetRows[0]) : [];
  const normalized = uniqueKeys(headers.map((header) => toSnake(header)));
  const columns = headers.map((label, idx) => ({ key: normalized[idx], label }));
  const primaryColumn = pickPrimaryColumn(columns);
  const priceColumn = pickPriceColumn(columns);

  addDatasetMeta({
    key: toSnake(sheetName),
    label: sheetName,
    tableName,
    columns,
    rowCount: sheetRows.length,
    sortOrder: index + 1,
    primaryColumn,
    priceColumn,
    hasSlug: 1
  });

  schemaStatements.push(
    `CREATE TABLE IF NOT EXISTS ${quoteId(tableName)} (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  row_order INTEGER NOT NULL,\n  slug TEXT,\n  ${columns
      .map((column) => `${quoteId(column.key)} TEXT`)
      .join(',\n  ')}\n);`
  );

  seedStatements.push(`DELETE FROM ${quoteId(tableName)};`);

  const slugCounts = new Map();
  const uniqueSlug = (base) => {
    const count = slugCounts.get(base) ?? 0;
    const next = count + 1;
    slugCounts.set(base, next);
    return count === 0 ? base : `${base}-${next}`;
  };

  sheetRows.forEach((row, rowIndex) => {
    const rowData = {};
    columns.forEach((column, idx) => {
      rowData[column.key] = row[headers[idx]];
    });

    const slugSource = primaryColumn ? rowData[primaryColumn] : headers[0];
    const baseSlug = slugify(slugSource || `${tableName}-${rowIndex + 1}`);
    const slug = uniqueSlug(baseSlug || `${tableName}-${rowIndex + 1}`);

    const values = columns.map((column) => toSqlValue(rowData[column.key]));
    const insert = `INSERT INTO ${quoteId(tableName)} (row_order, slug, ${columns
      .map((column) => quoteId(column.key))
      .join(', ')}) VALUES (${rowIndex + 1}, ${toSqlValue(slug)}, ${values.join(', ')});`;
    seedStatements.push(insert);
  });
});

datasetMetaRows.forEach((meta) => {
  const insert = `INSERT OR REPLACE INTO dataset_meta (key, label, table_name, columns_json, row_count, sort_order, primary_column, price_column, has_slug) VALUES (${toSqlValue(
    meta.key
  )}, ${toSqlValue(meta.label)}, ${toSqlValue(meta.tableName)}, ${toSqlValue(
    meta.columnsJson
  )}, ${meta.rowCount}, ${meta.sortOrder}, ${toSqlValue(
    meta.primaryColumn
  )}, ${toSqlValue(meta.priceColumn)}, ${meta.hasSlug});`;
  metaStatements.push(insert);
});

seedStatements.splice(1, 0, ...metaStatements);

fs.mkdirSync(path.dirname(outputSchemaPath), { recursive: true });
fs.writeFileSync(outputSchemaPath, schemaStatements.join('\n'));
fs.writeFileSync(outputSeedPath, seedStatements.join('\n'));

console.log(`Wrote schema to ${outputSchemaPath}`);
console.log(`Wrote seed to ${outputSeedPath}`);
