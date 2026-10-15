'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterBarProps {
  totalCount: number;
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  availableTags: string[];
  selectedTag: string;
  onSelectTag: (tag: string) => void;
}

const QUICK_LANGUAGES = ['TypeScript', 'React', 'Python', 'SQL', 'Markdown'];

export default function FilterBar({
  totalCount,
  selectedLanguage,
  onSelectLanguage,
  availableTags,
  selectedTag,
  onSelectTag,
}: FilterBarProps) {
  return (
    <div className="py-6">
      {/* Title & Vault Counter */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Snippet Vault
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Save, understand, and reuse your best code.
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-600">
          <span className="text-slate-900 font-bold">{totalCount}</span> snippets in your vault
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
        {/* All Languages Dropdown */}
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => onSelectLanguage(e.target.value)}
            className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="All">All languages</option>
            {QUICK_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* All Tags Dropdown */}
        <div className="relative">
          <select
            value={selectedTag}
            onChange={(e) => onSelectTag(e.target.value)}
            className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 pr-8 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="All">All tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Quick Filter Language Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_LANGUAGES.map((lang) => {
            const isActive = selectedLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => onSelectLanguage(isActive ? 'All' : lang)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'border border-blue-600 bg-blue-50/80 text-blue-700 font-semibold'
                    : 'border border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}