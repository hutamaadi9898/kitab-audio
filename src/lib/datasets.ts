import type { D1Database } from '@cloudflare/workers-types';

export type DatasetColumn = {
  key: string;
  label: string;
};

export type DatasetMeta = {
  key: string;
  label: string;
  tableName: string;
  columns: DatasetColumn[];
  rowCount: number;
  sortOrder: number;
  primaryColumn: string | null;
  priceColumn: string | null;
  hasSlug: boolean;
};

export type DatasetRow = Record<string, string | number | null> & {
  slug?: string | null;
};

const ensureIdentifier = (value: string): string => {
  if (!/^[a-z0-9_]+$/i.test(value)) {
    throw new Error(`Unsafe identifier: ${value}`);
  }
  return value;
};

const parseColumns = (value: string): DatasetColumn[] => {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((column) => ({
          key: String(column?.key ?? ''),
          label: String(column?.label ?? '')
        }))
        .filter((column) => column.key && column.label);
    }
  } catch (error) {
    return [];
  }
  return [];
};

export const getDatasetMeta = async (db: D1Database): Promise<DatasetMeta[]> => {
  const result = await db
    .prepare(
      `SELECT key, label, table_name, columns_json, row_count, sort_order, primary_column, price_column, has_slug
       FROM dataset_meta
       ORDER BY sort_order ASC`
    )
    .all();

  return (result?.results ?? []).map((row) => {
    const columns = parseColumns(String(row.columns_json ?? '[]'));
    return {
      key: String(row.key),
      label: String(row.label),
      tableName: String(row.table_name),
      columns,
      rowCount: Number(row.row_count ?? 0),
      sortOrder: Number(row.sort_order ?? 0),
      primaryColumn: row.primary_column ? String(row.primary_column) : null,
      priceColumn: row.price_column ? String(row.price_column) : null,
      hasSlug: Boolean(row.has_slug)
    };
  });
};

export const getDatasetRows = async (
  db: D1Database,
  dataset: DatasetMeta
): Promise<DatasetRow[]> => {
  const tableName = ensureIdentifier(dataset.tableName);
  const columnKeys = dataset.columns.map((column) => ensureIdentifier(column.key));
  if (columnKeys.length === 0) return [];
  const selectColumns = dataset.hasSlug ? ['slug', ...columnKeys] : columnKeys;
  const selectList = selectColumns.map((column) => `"${column}"`).join(', ');

  const result = await db
    .prepare(`SELECT ${selectList} FROM "${tableName}" ORDER BY row_order ASC`)
    .all();

  return (result?.results ?? []).map((row) => row as DatasetRow);
};

export const getDatasetRowBySlug = async (
  db: D1Database,
  dataset: DatasetMeta,
  slug: string
): Promise<DatasetRow | undefined> => {
  const tableName = ensureIdentifier(dataset.tableName);
  const columnKeys = dataset.columns.map((column) => ensureIdentifier(column.key));
  if (columnKeys.length === 0) return undefined;
  const selectColumns = dataset.hasSlug ? ['slug', ...columnKeys] : columnKeys;
  const selectList = selectColumns.map((column) => `"${column}"`).join(', ');

  const result = await db
    .prepare(`SELECT ${selectList} FROM "${tableName}" WHERE slug = ? LIMIT 1`)
    .bind(slug)
    .first();

  return result ? (result as DatasetRow) : undefined;
};
