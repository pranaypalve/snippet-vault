'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Snippet } from '@/lib/types';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import SnippetCard from '@/components/SnippetCard';
import SnippetModal from '@/components/SnippetModal';
import AuthCard from '@/components/AuthCard';
import { Code2, Loader2 } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication & submission state
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Snippets collection & active filters
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');

  // Modal dialog controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

  // Listen for Supabase session changes
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch snippets for current user (RLS ensures user only sees their own)
  const fetchSnippets = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSnippets(data || []);
    } catch (err) {
      console.error('Error fetching snippets:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSnippets();
    }
  }, [user, fetchSnippets]);

  // Handle email sign up and sign in
  const handleEmailAuth = async (email: string, password: string, isSignUp: boolean) => {
    setAuthError('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account created! You can now sign in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth sign in failed';
      setAuthError(message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSnippets([]);
  };

  // Create or update snippet with Gemini metadata
  const handleSaveSnippet = async ({
    title,
    code,
    language,
    id,
  }: {
    title: string;
    code: string;
    language: string;
    id?: string;
  }) => {
    if (!user) return;

    let summary = `A reusable ${language} code snippet.`;
    let tags = [language.toLowerCase()];

    // Request Gemini enrichment from our server route
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) summary = data.summary;
        if (data.tags && data.tags.length > 0) tags = data.tags;
      }
    } catch (err) {
      console.warn('Enrichment route failed, saving with defaults:', err);
    }

    if (id) {
      // Update existing snippet record
      const { error } = await supabase
        .from('snippets')
        .update({
          title,
          code,
          language,
          summary,
          tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } else {
      // Insert new snippet
      const { error } = await supabase.from('snippets').insert([
        {
          user_id: user.id,
          title,
          code,
          language,
          summary,
          tags,
          note: `Usage: Best for ${language} projects.`,
        },
      ]);

      if (error) throw error;
    }

    await fetchSnippets();
  };

  // Delete snippet by id
  const handleDeleteSnippet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return;
    try {
      const { error } = await supabase.from('snippets').delete().eq('id', id);
      if (error) throw error;
      setSnippets((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete snippet:', err);
    }
  };

  // Derive unique tag list for dropdown
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>();
    snippets.forEach((s) => s.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [snippets]);

  // Combined search and tag/language filter
  const filteredSnippets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return snippets.filter((s) => {
      const matchesSearch =
        query === '' ||
        s.title.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query) ||
        s.summary?.toLowerCase().includes(query) ||
        s.tags?.some((t) => t.toLowerCase().includes(query));

      const matchesLang =
        selectedLanguage === 'All' || s.language === selectedLanguage;

      const matchesTag =
        selectedTag === 'All' || s.tags?.includes(selectedTag);

      return matchesSearch && matchesLang && matchesTag;
    });
  }, [snippets, searchQuery, selectedLanguage, selectedTag]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Render auth view if no session exists
  if (!user) {
    return (
      <AuthCard
        onEmailAuth={handleEmailAuth}
        onOAuthSignIn={handleOAuthSignIn}
        error={authError}
        loading={authLoading}
      />
    );
  }

  // Main dashboard layout
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 pb-16">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => {
          setEditingSnippet(null);
          setIsModalOpen(true);
        }}
        userEmail={user.email}
        onSignOut={handleSignOut}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FilterBar
          totalCount={snippets.length}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          availableTags={allAvailableTags}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
        />

        {filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onEdit={(snip) => {
                  setEditingSnippet(snip);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteSnippet}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/80 bg-white p-12 text-center my-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery || selectedLanguage !== 'All' || selectedTag !== 'All'
                ? 'No matching snippets found'
                : 'Your vault is currently empty'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchQuery || selectedLanguage !== 'All' || selectedTag !== 'All'
                ? 'Try adjusting your search query or language filters.'
                : 'Save your first code snippet. Gemini AI will automatically generate summary notes and tags!'}
            </p>
            <button
              onClick={() => {
                setEditingSnippet(null);
                setIsModalOpen(true);
              }}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
            >
              + Create your first snippet
            </button>
          </div>
        )}
      </main>

      <SnippetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSnippet}
        initialSnippet={editingSnippet}
      />
    </div>
  );
}