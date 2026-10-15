# Developer Snippet Vault & AI Publisher

A modern, responsive full-stack developer workspace for storing, searching, and managing reusable code snippets, technical notes, and Markdown documentation.

Integrated with the **Google Gemini API (`@google/genai`)** to automatically generate technical tags and concise one-sentence summaries upon saving.

---

## Features

- **Authentication & Security**: Email/password authentication and OAuth powered by Supabase with Row-Level Security (RLS) ensuring strict tenant isolation.
- **AI-Powered Enrichment**: Automatically summarizes code snippets and suggests 3–5 relevant technical tags via Gemini 2.5 Flash.
- **Snippet Management (CRUD)**: Create, edit, preview, and delete snippets with language tagging and line-numbered formatting.
- **Live Search & Quick Filters**: Search through snippet titles, code bodies, summaries, and tags in real time with keyboard shortcuts (`Ctrl+K` / `⌘K`).
- **Responsive UI**: Custom interface styled with Tailwind CSS, supporting desktop and mobile viewports.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **AI Integration**: Google Gemini API (`@google/genai` - `gemini-2.5-flash`)
- **Hosting & CI/CD**: Vercel

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A free Supabase project
- A Google AI Studio API key

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <repo-url>
   cd snippet-vault
   npm install