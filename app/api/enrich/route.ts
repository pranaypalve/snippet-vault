import { NextResponse } from 'next/server';
import { enrichSnippetWithGemini } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, language } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const enrichment = await enrichSnippetWithGemini(code, language || 'TypeScript');
    return NextResponse.json(enrichment);
  } catch (error) {
    console.error('API Error in /api/enrich:', error);
    return NextResponse.json(
      { error: 'Failed to enrich snippet' },
      { status: 500 }
    );
  }
}