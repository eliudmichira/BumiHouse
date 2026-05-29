import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { blogPosts as defaultPosts } from '../../../data/blogPosts';
import { normaliseBlogDoc, slugify, parseBodyText } from '../../../lib/blogUtils';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  ExternalLink,
  Download,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';

const emptyForm = () => ({
  slug: '',
  title: '',
  excerpt: '',
  category: 'General',
  date: new Date().toISOString().slice(0, 10),
  readTime: '5 min read',
  bodyText: '',
  published: true,
});

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'blogPosts'));
      const list = snap.docs
        .map((d) => normaliseBlogDoc(d.id, d.data()))
        .filter(Boolean)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      setPosts(list);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to load blog posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const openCreate = () => {
    setEditingSlug(null);
    setForm(emptyForm());
    setModalOpen(true);
    setError(null);
  };

  const openEdit = (post) => {
    setEditingSlug(post.slug);
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      date: post.date,
      readTime: post.readTime,
      bodyText: (post.body || []).join('\n\n'),
      published: post.published !== false,
    });
    setModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSlug(null);
    setForm(emptyForm());
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const slug = editingSlug || slugify(form.slug || form.title);
    if (!slug) {
      setError('Add a title or slug so the post has a URL.');
      return;
    }
    const body = parseBodyText(form.bodyText);
    if (body.length === 0) {
      setError('Add at least one paragraph in the body (separate paragraphs with a blank line).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(db, 'blogPosts', slug),
        {
          slug,
          title: form.title.trim(),
          excerpt: form.excerpt.trim(),
          category: form.category.trim() || 'General',
          date: form.date,
          readTime: form.readTime.trim() || '5 min read',
          body,
          published: form.published,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await loadPosts();
      closeModal();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Save failed. Check Firestore rules and network.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(`Delete post "${slug}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteDoc(doc(db, 'blogPosts', slug));
      await loadPosts();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Delete failed');
    }
  };

  const handleImportDefaults = async () => {
    if (!window.confirm(`Import ${defaultPosts.length} sample posts from the app bundle? Existing posts with the same slug will be overwritten.`)) return;
    setImporting(true);
    setError(null);
    try {
      const batch = writeBatch(db);
      for (const p of defaultPosts) {
        const ref = doc(db, 'blogPosts', p.slug);
        batch.set(
          ref,
          {
            slug: p.slug,
            title: p.title,
            excerpt: p.excerpt,
            category: p.category,
            date: p.date,
            readTime: p.readTime,
            body: p.body,
            published: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      await batch.commit();
      await loadPosts();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <BookOpen className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blog</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create and edit articles. They appear on{' '}
                <a
                  href="/desktop/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 inline-flex items-center gap-1"
                >
                  /desktop/blog <ExternalLink className="w-3 h-3" />
                </a>
                .
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleImportDefaults}
              disabled={importing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium disabled:opacity-50"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Import samples
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New post
            </button>
          </div>
        </div>

        {error && !modalOpen && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-12">
            No posts in Firestore yet. Use <strong>Import samples</strong> or <strong>New post</strong>. Until then, the
            site still shows bundled sample articles as a fallback.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                  <th className="py-3 pr-4 font-medium">Title</th>
                  <th className="py-3 pr-4 font-medium">Slug</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.slug} className="border-b border-gray-100 dark:border-gray-700/80">
                    <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                      {p.title}
                    </td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-300 font-mono text-xs">{p.slug}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-gray-300">{p.date}</td>
                    <td className="py-3 pr-4">
                      {p.published !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Eye className="w-3.5 h-3.5" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500">
                          <EyeOff className="w-3.5 h-3.5" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.slug)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingSlug ? 'Edit post' : 'New post'}
              </h3>
              <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">{error}</div>
              )}
              {!editingSlug && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">URL slug (optional)</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="auto from title if empty"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              )}
              {editingSlug && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Slug</label>
                  <input value={form.slug} readOnly className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-mono text-sm" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Excerpt *</label>
                <textarea
                  required
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Read time label</label>
                <input
                  value={form.readTime}
                  onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                  placeholder="5 min read"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Body — paragraphs separated by a blank line *
                </label>
                <textarea
                  required
                  rows={12}
                  value={form.bodyText}
                  onChange={(e) => setForm((f) => ({ ...f, bodyText: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Published (visible on public blog)</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
