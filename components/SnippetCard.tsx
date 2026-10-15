'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, Pencil, Trash2 } from 'lucide-react';
import { Snippet } from '@/lib/types';

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

export default function SnippetCard({
  snippet,
  onEdit,
  onDelete,
}: SnippetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Split code into lines for numbering
  const codeLines = snippet.code.split('\n');

  // Simple relative time helper
  const getRelativeTime = (dateString: string) => {
    const diffInSeconds = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / 1000
    );
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Updated yesterday';
    return `Updated ${diffInDays}d ago`;
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
              {snippet.title}
            </h3>
            <span className="inline-block mt-2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {snippet.language}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(snippet)}
              title="Edit Snippet"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(snippet.id)}
              title="Delete Snippet"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Gemini AI Summary Box */}
        {snippet.summary && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white shadow-xs">
                <Sparkles className="h-3 w-3" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                Gemini Summary
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {snippet.summary}
            </p>
          </div>
        )}

        {/* Code Block Container */}
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">
          {/* Window Bar */}
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-100/60 px-3.5 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Content with Line Numbers */}
          <div className="max-h-56 overflow-x-auto overflow-y-auto p-3 text-xs font-mono leading-relaxed text-slate-800">
            <table className="w-full border-collapse">
              <tbody>
                {codeLines.map((line, index) => (
                  <tr key={index} className="hover:bg-slate-200/30">
                    <td className="w-6 pr-3 select-none text-right text-slate-400 font-mono text-[11px]">
                      {index + 1}
                    </td>
                    <td className="whitespace-pre font-mono text-[12px] text-slate-800">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Usage Note (if present) */}
          {snippet.note && (
            <div className="border-t border-slate-200/70 bg-white/70 px-3.5 py-2 text-[11px] text-slate-500">
              {snippet.note}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Tags & Time */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {snippet.tags && snippet.tags.length > 0 ? (
            snippet.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              #{snippet.language.toLowerCase()}
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap ml-2">
          {getRelativeTime(snippet.updated_at || snippet.created_at)}
        </span>
      </div>
    </div>
  );
}