import { NextResponse } from 'next/server';

export const maxDuration = 10;

export async function POST(request: Request) {
  const { title, authors } = await request.json();

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not configured');
    return NextResponse.json({ error: 'OpenAI API not configured' }, { status: 500 });
  }

  const prompt = `You are a book genre classifier. Given a book title${authors ? ` and author(s) (${authors.join(', ')})` : ''}, suggest 3-5 appropriate book genres or categories.

Book: "${title}"${authors ? ` by ${authors.join(', ')}` : ''}

Respond with ONLY a JSON array of genre strings, nothing else. Example: ["Fiction", "Mystery", "Drama"]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: 'OpenAI request failed' }, { status: response.status });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    const genres = JSON.parse(content);
    if (!Array.isArray(genres)) {
      throw new Error('Invalid response format');
    }

    return NextResponse.json({ genres });
  } catch (error) {
    console.error('Genre suggestion failed:', error);
    return NextResponse.json({ error: 'Failed to suggest genres' }, { status: 500 });
  }
}
