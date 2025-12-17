import { ChapterResponse, SearchResult } from '../types';

const BASE_URL = 'https://bible-api.com';
const SEARCH_API_URL = 'https://www.abibliadigital.com.br/api/verses/search';

export const fetchChapter = async (
  bookId: string,
  chapter: number,
  version: string
): Promise<ChapterResponse> => {
  try {
    // API Quirk handling:
    // 1. For Almeida version, 'Revelation' often fails. Using 'Apocalipse' works reliably.
    // 2. Spaces in book names (e.g. '1 John') must be replaced with '+' for this API.
    
    let queryBook = bookId;
    
    if (version === 'almeida' && bookId === 'Revelation') {
      queryBook = 'Apocalipse';
    }

    const formattedBook = queryBook.trim().replace(/\s+/g, '+');
    
    // Construct URL: e.g., https://bible-api.com/Apocalipse+1?translation=almeida
    const url = `${BASE_URL}/${formattedBook}+${chapter}?translation=${version}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }
    const data = await response.json();
    return data as ChapterResponse;
  } catch (error) {
    console.error("Bible Fetch Error:", error);
    throw error;
  }
};

export const searchVerses = async (query: string): Promise<SearchResult[]> => {
  try {
    // Using ABibliaDigital for search as it supports specific keyword search better
    // 'acf' is Almeida Corrigida Fiel, closest to standard Almeida
    const response = await fetch(SEARCH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: 'acf', search: query }) 
    });

    if (!response.ok) {
       return [];
    }

    const data = await response.json();
    
    if (!data || !data.verses) return [];

    return data.verses.map((v: any) => ({
        book: v.book.name,
        chapter: v.chapter,
        verse: v.number,
        text: v.text
    }));
  } catch (error) {
    console.error("Search API Error:", error);
    return [];
  }
};