import xlsx from 'xlsx';
import fs from 'fs';

const sourcePath = 'Normalized_Audio_Gear_Final_v2.xlsx';
const outputPath = 'src/data/tws.json';

const workbook = xlsx.readFile(sourcePath);
const sheetName = workbook.SheetNames.find((name) => name === 'TWS') ?? workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const slugCounts = new Map();
const uniqueSlug = (base) => {
  const count = slugCounts.get(base) ?? 0;
  const next = count + 1;
  slugCounts.set(base, next);
  return count === 0 ? base : `${base}-${next}`;
};

const toNumber = (value) => {
  if (value === '' || value === '-' || value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const normalized = String(value).replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const data = rows.map((row) => {
  const baseSlug = slugify(row['TWS']);
  return {
    slug: uniqueSlug(baseSlug || 'product'),
    name: row['TWS'],
    highlights: '',
    tier: row['Tier'],
    pricePerformance: row['Value for Money'],
    priceIdr: toNumber(row['Price']),
    microphonePerformance: row['Microphone Test'],
    reviewSummary: row['Review Notes'],
    bluetoothCodec: row['Bluetooth Codec'],
    batteryLife: row['Battery Life (No ANC)'],
    ancLevel: row['ANC Performance (dB)'],
    transparencyMode: row['Transparency Mode'],
    equalizerType: row['Equalizer'],
    overallSoundScore: toNumber(row['Overall Sound Quality']),
    bassScore: toNumber(row['Bass']),
    lowMidScore: toNumber(row['Lo Mid']),
    highMidScore: toNumber(row['Hi Mid']),
    trebleScore: toNumber(row['Treble']),
    vocalScore: toNumber(row['Vocal']),
    soundstageScore: toNumber(row['Soundstage']),
    separationScore: toNumber(row['Separation']),
    imagingScore: toNumber(row['Imaging']),
    timbreScore: toNumber(row['Timbre']),
    punchScore: toNumber(row['Punch']),
    clarityScore: toNumber(row['Clarity & Resolution']),
    gamingMode: row['Gaming Mode Low Latency'],
    soundTuning: row['Sound Tuning'],
    ipRating: row['IP Rating'],
    multipoint: row['Multipoint Connection'],
    recommendedEartips: row['Recommended Eartips'] ?? ''
  };
});

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
console.log(`Wrote ${data.length} items to ${outputPath}`);
