export type HeicCandidateRow = {
  id?: string;
  blob_url?: string | null;
  blob_pathname?: string | null;
};

export function isHeicCandidate(row: HeicCandidateRow): boolean {
  const u = (row.blob_url ?? "").toLowerCase();
  const p = (row.blob_pathname ?? "").toLowerCase();
  return u.includes(".heic") || u.includes(".heif") || p.includes(".heic") || p.includes(".heif");
}

