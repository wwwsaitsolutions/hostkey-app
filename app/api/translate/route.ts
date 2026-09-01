import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, targetLangs = ['en', 'fr', 'de'] } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ translations: {} });
    }

    const translations: Record<string, string> = {};

    // Μετάφραση παράλληλα σε όλες τις επιλεγμένες γλώσσες
    await Promise.all(
      targetLangs.map(async (lang: string) => {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(
            text,
          )}`;
          const res = await fetch(url);
          const data = await res.json();
          if (Array.isArray(data?.[0])) {
            translations[lang] = data[0].map((item: [string]) => item[0]).join('');
          }
        } catch {
          translations[lang] = text; // fallback σε περίπτωση σφάλματος
        }
      }),
    );

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}