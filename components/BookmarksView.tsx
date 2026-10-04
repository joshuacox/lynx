'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { Bookmark, CategoryData } from '@/lib/bookmarks';
import {
  Search,
  ExternalLink,
  Tag,
  Globe,
  Sparkles,
  BookOpen,
  Layers,
  Copy,
  Check,
  Flame,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface BookmarksViewProps {
  initialBookmarks: Bookmark[];
  categories: CategoryData[];
}

export default function BookmarksView({
  initialBookmarks,
  categories,
}: BookmarksViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Top domains
  const topDomains = useMemo(() => {
    const domainCounts = new Map<string, number>();
    for (const b of initialBookmarks) {
      domainCounts.set(b.domain, (domainCounts.get(b.domain) || 0) + 1);
    }
    return Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [initialBookmarks]);

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return initialBookmarks.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesDomain =
        selectedDomain === 'all' || item.domain === selectedDomain;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query) ||
        item.domain.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesDomain && matchesSearch;
    });
  }, [initialBookmarks, searchQuery, selectedCategory, selectedDomain]);

  // Group filtered bookmarks by category
  const groupedBookmarks = useMemo(() => {
    const groups: { [key: string]: Bookmark[] } = {};
    for (const item of filteredBookmarks) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredBookmarks]);

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Lynx
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                  Static
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Curated public bookmark directory & knowledge base
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>{initialBookmarks.length} Bookmarks</span>
              <span className="text-slate-600">•</span>
              <span>{categories.length} Categories</span>
            </div>

            <a
              href="https://github.com/joshuacox/lynx"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Search & Overview Hero */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search bookmarks by title, URL, tag, or topic..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                startTransition(() => {
                  setSearchQuery(val);
                });
              }}
              className="w-full pl-11 pr-10 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-sm shadow-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Domain Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-slate-400 flex items-center gap-1 mr-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Top sources:
            </span>
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-2.5 py-1 rounded-full transition-colors border ${
                selectedDomain === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              All sources
            </button>
            {topDomains.map(([domain, count]) => (
              <button
                key={domain}
                onClick={() =>
                  setSelectedDomain(selectedDomain === domain ? 'all' : domain)
                }
                className={`px-2.5 py-1 rounded-full transition-colors border flex items-center gap-1 ${
                  selectedDomain === domain
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{domain}</span>
                <span className="opacity-60 text-[10px]">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categories Horizontal Scrolling Nav */}
        <div className="mb-8 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Filter by Category
            </h2>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="ml-auto text-xs text-cyan-400 hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              All Categories ({initialBookmarks.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === c.name ? 'all' : c.name
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === c.name
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <span>{c.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === c.name
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-400">
            Showing{' '}
            <span className="font-semibold text-white">
              {filteredBookmarks.length}
            </span>{' '}
            bookmarks
            {selectedCategory !== 'all' && (
              <span>
                {' '}
                in <span className="text-cyan-400">{selectedCategory}</span>
              </span>
            )}
            {selectedDomain !== 'all' && (
              <span>
                {' '}
                from <span className="text-cyan-400">{selectedDomain}</span>
              </span>
            )}
          </div>
        </div>

        {/* Bookmarks Grid / Categorized Sections */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-300">
              No matching bookmarks found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search terms, clearing the category filter, or
              selecting all sources.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDomain('all');
              }}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedBookmarks).map(([category, items]) => (
              <section key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 rounded-full bg-cyan-500" />
                  <h2 className="text-lg font-bold text-slate-200 tracking-tight flex items-center gap-2">
                    {category}
                    <span className="text-xs font-normal text-slate-500">
                      ({items.length})
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((bm) => (
                    <div
                      key={bm.id}
                      className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-950/20"
                    >
                      <div>
                        {/* Domain & Action Bar */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/40">
                            <Globe className="w-3 h-3 text-cyan-400" />
                            {bm.domain}
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyUrl(bm.id, bm.url)}
                              title="Copy URL"
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              {copiedId === bm.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Title & Link */}
                        <a
                          href={bm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-2 text-sm leading-snug mb-2 flex items-start gap-1.5"
                        >
                          <span>{bm.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity text-cyan-400" />
                        </a>
                      </div>

                      {/* Footer URL / Category Tag */}
                      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[180px]" title={bm.url}>
                          {bm.pathname && bm.pathname !== '/'
                            ? bm.pathname
                            : bm.url}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Tag className="w-2.5 h-2.5" />
                          {bm.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Generated from{' '}
            <code className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
              README.md
            </code>{' '}
            bookmarks.
          </p>
          <p className="flex items-center gap-1">
            Built with Next.js Static Export & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
