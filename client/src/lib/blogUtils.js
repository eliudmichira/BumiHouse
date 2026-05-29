/**
 * Normalise a Firestore blog document into the shape used by the public Blog page.
 */
export function normaliseBlogDoc(docId, data) {
  if (!data || typeof data !== 'object') return null;
  const slug = (data.slug || docId || '').trim();
  if (!slug) return null;
  let body = data.body;
  if (!Array.isArray(body)) {
    if (typeof body === 'string') {
      body = body
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    } else {
      body = [];
    }
  }
  return {
    slug,
    title: String(data.title || '').trim() || 'Untitled',
    excerpt: String(data.excerpt || '').trim(),
    category: String(data.category || 'General').trim(),
    date: String(data.date || '').trim() || new Date().toISOString().slice(0, 10),
    readTime: String(data.readTime || '5 min read').trim(),
    body,
    published: data.published !== false,
  };
}

/** Merge Firestore posts with static fallback: remote wins on slug collision. */
export function mergeBlogPosts(remoteList, fallbackList) {
  const bySlug = new Map();
  for (const p of fallbackList || []) {
    if (p?.slug) bySlug.set(p.slug, { ...p });
  }
  for (const p of remoteList || []) {
    if (p?.slug && p.published !== false) bySlug.set(p.slug, { ...p });
  }
  return Array.from(bySlug.values()).sort((a, b) =>
    (b.date || '').localeCompare(a.date || '')
  );
}

export function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseBodyText(text) {
  return String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
