import type { D1Database } from '@cloudflare/workers-types';

export type TWSProduct = {
  slug: string;
  name: string;
  highlights: string;
  tier: string;
  pricePerformance: string;
  priceIdr: number | null;
  microphonePerformance: string;
  reviewSummary: string;
  bluetoothCodec: string;
  batteryLife: string;
  ancLevel: string;
  transparencyMode: string;
  equalizerType: string;
  overallSoundScore: number | null;
  bassScore: number | null;
  lowMidScore: number | null;
  highMidScore: number | null;
  trebleScore: number | null;
  vocalScore: number | null;
  soundstageScore: number | null;
  separationScore: number | null;
  imagingScore: number | null;
  timbreScore: number | null;
  punchScore: number | null;
  clarityScore: number | null;
  gamingMode: string;
  soundTuning: string;
  ipRating: string;
  multipoint: boolean | string;
  recommendedEartips: string;
};

const toText = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const numberValue = Number(String(value));
  return Number.isFinite(numberValue) ? numberValue : null;
};

const selectFields = [
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

const mapRowToProduct = (row: Record<string, unknown>): TWSProduct => ({
  slug: toText(row.slug),
  name: toText(row.name),
  highlights: toText(row.highlights),
  tier: toText(row.tier),
  pricePerformance: toText(row.price_performance),
  priceIdr: toNumber(row.price_idr),
  microphonePerformance: toText(row.microphone_performance),
  reviewSummary: toText(row.review_summary),
  bluetoothCodec: toText(row.bluetooth_codec),
  batteryLife: toText(row.battery_life),
  ancLevel: toText(row.anc_level),
  transparencyMode: toText(row.transparency_mode),
  equalizerType: toText(row.equalizer_type),
  overallSoundScore: toNumber(row.overall_sound_score),
  bassScore: toNumber(row.bass_score),
  lowMidScore: toNumber(row.low_mid_score),
  highMidScore: toNumber(row.high_mid_score),
  trebleScore: toNumber(row.treble_score),
  vocalScore: toNumber(row.vocal_score),
  soundstageScore: toNumber(row.soundstage_score),
  separationScore: toNumber(row.separation_score),
  imagingScore: toNumber(row.imaging_score),
  timbreScore: toNumber(row.timbre_score),
  punchScore: toNumber(row.punch_score),
  clarityScore: toNumber(row.clarity_score),
  gamingMode: toText(row.gaming_mode),
  soundTuning: toText(row.sound_tuning),
  ipRating: toText(row.ip_rating),
  multipoint: toText(row.multipoint),
  recommendedEartips: toText(row.recommended_eartips)
});

export const getTwsProducts = async (db: D1Database): Promise<TWSProduct[]> => {
  const query = `SELECT ${selectFields.join(', ')} FROM tws_products`;
  const result = await db.prepare(query).all();
  return (result?.results ?? []).map((row) => mapRowToProduct(row as Record<string, unknown>));
};

export const getProductBySlug = async (
  db: D1Database,
  slug: string
): Promise<TWSProduct | undefined> => {
  const query = `SELECT ${selectFields.join(', ')} FROM tws_products WHERE slug = ? LIMIT 1`;
  const result = await db.prepare(query).bind(slug).first();
  return result ? mapRowToProduct(result as Record<string, unknown>) : undefined;
};
