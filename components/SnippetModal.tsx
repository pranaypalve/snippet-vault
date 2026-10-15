'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Snippet } from '@/lib/types';

interface SnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (snippetData: {
    title: string;
    code: string;
    language: string;
    id?: string;
  }) => Promise<void>;
  initialSnippet?: Snippet | null;
}

const LANGUAGES = ['TypeScript', 'React', 'Python', 'SQL', 'Markdown'];

export default function SnippetModal({
  isOpen,
  onClose,
  onSave,
  initialSnippet,
}: SnippetModalProps) {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('TypeScript');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialSnippet) {
      setTitle(initialSnippet.title);
      setLanguage(initialSnippet.language);
      setCode(initialSnippet.code);
    } else {
      setTitle('');
      setLanguage('TypeScript');
      setCode('');
    }
  }, [initialSnippet, isOpen]);

  if (!isOpen) return null;

  // File extension helper for the dark editor bar
  const getFilename = () => {
    switch (language) {
      case 'TypeScript':
        return 'snippet.ts';
      case 'React':
        return 'Component.tsx';
      case 'Python':
        return 'main.py';
      case 'SQL':
        return 'query.sql';
      case 'Markdown':
        return 'notes.md';
      default:
        return 'snippet.txt';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave({
        title,
        code,
        language,
        id: initialSnippet?.id,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save snippet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {initialSnippet ? 'Edit Snippet' : 'Create Snippet'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add a reusable piece of code to your vault.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fetch data with retry"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {/* Language / Syntax */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Language / Syntax
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Code Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Code content
            </label>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117] shadow-inner">
              {/* Dark Editor Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs font-mono text-slate-400">
                <span>{getFilename()}</span>
                <span>{language}</span>
              </div>
              <textarea
                required
                rows={7}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste or write your code here..."
                className="w-full resize-none bg-transparent p-4 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Gemini AI Enrichment Banner */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Gemini AI enrichment
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    On save, Gemini generates a clear one-sentence summary and 3–5 relevant tags automatically.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Google Gemini API (@google/genai)
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-9">
              <span className="rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
                #{language.toLowerCase()}
              </span>
              <span className="rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
                #async
              </span>
              <span className="rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
                #api
              </span>
              <span className="rounded-full border border-blue-200 bg-white px-2.5 py-0.5 text-[10px] font-medium text-blue-600">
                + summary
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Save Snippet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}