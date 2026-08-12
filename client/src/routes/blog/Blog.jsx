import React, { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useTheme } from '../../context/ThemeContext';
import { BookOpen, Calendar, Clock, Search, ArrowLeft, Tag, Loader2 } from 'lucide-react';
import { blogPosts as fallbackPosts } from '../../data/blogPosts';
import { normaliseBlogDoc, mergeBlogPosts } from '../../lib/blogUtils';

const Blog = () => {
  const { slug } = useParams();
  const { isDark } = useTheme();
  const [q, setQ] = useState('');
  const [posts, setPosts] = useState(fallbackPosts);
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'blogPosts'));
        const remote = snap.docs
          .map((d) => normaliseBlogDoc(d.id, d.data()))
          .filter(Boolean)
          .filter((p) => p.published !== false);
        if (!cancelled) {
          setPosts(mergeBlogPosts(remote, fallbackPosts));
          setRemoteLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setPosts(fallbackPosts);
          setRemoteLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const post = useMemo(() => posts.find((p) => p.slug === slug), [posts, slug]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.excerpt.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
    );
  }, [q, posts]);

  if (post) {
    return (
      <div className={`min-h-screen pt-32 pb-16 ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
        <Helmet>
          <title>{post.title} | HomesKE Blog</title>
          <meta name="description" content={post.excerpt} />
        </Helmet>
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/desktop/blog"
            className={`inline-flex items-center gap-2 font-outfit text-sm mb-8 transition-colors ${isDark ? 'text-[#51faaa] hover:text-[#dbd5a4]' : 'text-[#51faaa] hover:text-emerald-700'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
          <header className="mb-10">
            <span
              className={`inline-flex items-center gap-1 text-xs font-outfit font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-4 ${isDark ? 'bg-[rgba(81,250,170,0.15)] text-[#51faaa]' : 'bg-[#51faaa]/15 text-emerald-800'}`}
            >
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <h1 className={`text-3xl sm:text-4xl font-outfit font-bold mb-4 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              {post.title}
            </h1>
            <div className={`flex flex-wrap items-center gap-4 text-sm font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
          </header>
          <div className={`space-y-6 font-outfit leading-relaxed ${isDark ? 'text-[#ccc]' : 'text-gray-700'}`}>
            {(post.body || []).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className={`mt-12 pt-8 border-t ${isDark ? 'border-[rgba(81,250,170,0.2)]' : 'border-gray-200'}`}>
            <p className={`font-outfit text-sm ${isDark ? 'text-[#888]' : 'text-gray-500'}`}>
              Looking for a verified agent?{' '}
              <Link to="/desktop/agents" className="text-[#51faaa] hover:underline font-medium">
                Browse our agents
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-32 pb-16 ${isDark ? 'bg-[#0a0c19]' : 'bg-gray-50'}`}>
      <Helmet>
        <title>Blog | HomesKE</title>
        <meta
          name="description"
          content="Guides and insights on buying, selling, and renting property in Kenya."
        />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#51faaa] mb-2">
              <BookOpen className="w-6 h-6" />
              <span className="font-outfit font-semibold text-sm uppercase tracking-wide">HomesKE</span>
            </div>
            <h1 className={`text-4xl font-outfit font-bold mb-3 ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
              Blog
            </h1>
            <p className={`font-outfit text-lg max-w-xl ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
              Practical guides for buyers, sellers, and renters—written for the Kenyan market.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#51faaa]' : 'text-gray-400'}`} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles..."
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#51faaa] focus:border-transparent transition-colors font-outfit ${isDark
                ? 'border-[rgba(81,250,170,0.2)] bg-[#10121e] text-[#feffff] placeholder-[#ccc]/50'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
            />
          </div>
        </div>

        {!remoteLoaded && (
          <div className="flex justify-center py-8 text-[#51faaa]">
            <Loader2 className="w-8 h-8 animate-spin opacity-80" aria-hidden />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <p className={`col-span-full text-center py-12 font-outfit ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>
              No articles match your search.
            </p>
          ) : (
            filtered.map((p) => (
              <Link
                key={p.slug}
                to={`/desktop/blog/${p.slug}`}
                className={`group rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${isDark
                  ? 'bg-[#10121e] border-[rgba(81,250,170,0.2)] hover:border-[#51faaa]/40'
                  : 'bg-white border-gray-200 shadow-lg'
                  }`}
              >
                <span
                  className={`inline-block text-xs font-outfit font-semibold uppercase tracking-wide px-2 py-1 rounded-full mb-3 ${isDark ? 'bg-[rgba(81,250,170,0.15)] text-[#51faaa]' : 'bg-[#51faaa]/10 text-emerald-800'
                    }`}
                >
                  {p.category}
                </span>
                <h2 className={`text-xl font-outfit font-bold mb-2 group-hover:text-[#51faaa] transition-colors ${isDark ? 'text-[#feffff]' : 'text-gray-900'}`}>
                  {p.title}
                </h2>
                <p className={`font-outfit text-sm mb-4 line-clamp-3 ${isDark ? 'text-[#ccc]' : 'text-gray-600'}`}>{p.excerpt}</p>
                <div className={`flex items-center gap-3 text-xs font-outfit ${isDark ? 'text-[#888]' : 'text-gray-500'}`}>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {p.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {p.readTime}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
