// Legacy filenames contain dates, not recovered publication timestamps.
export function publicationDate(publishedAt: unknown, legacyDate?: string) {
  if (publishedAt == null) return legacyDate;
  if (
    typeof publishedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      publishedAt,
    ) ||
    Number.isNaN(Date.parse(publishedAt))
  ) {
    throw new Error(
      'publishedAt must be a real ISO 8601 timestamp with a timezone',
    );
  }
  const date = publishedAt.slice(0, 10);
  if (new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error('publishedAt contains an invalid calendar date');
  }
  return publishedAt;
}
