import { ChapterResponse, SearchResult } from '../types';
import { ALL_BOOKS } from '../constants';

const BASE_URL = 'https://bible-api.com';
// Using Bolls.life API for search (GET request, supports CORS, reliable)
// 'AA' code corresponds to Almeida Atualizada
const SEARCH_API_URL = 'https://bolls.life/find/AA/';

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
    if (!query || query.length < 2) return [];

    // Bolls.life API: GET /find/{translation}/?search={query}&match_case=false
    const url = `${SEARCH_API_URL}?search=${encodeURIComponent(query)}&match_case=false`;
    
    const response = await fetch(url);

    if (!response.ok) {
       return [];
    }

    const data = await response.json();
    
    // The API returns an array like: [{ "book": 1, "chapter": 1, "verse": 1, "text": "..." }, ...]
    // We must map the numeric 'book' ID (1-66) to our Portuguese book names in ALL_BOOKS.
    // ALL_BOOKS array is ordered Genesis (index 0) to Revelation (index 65).
    
    return data.map((v: any) => {
        const bookIndex = v.book - 1; // API uses 1-based index
        const bookInfo = ALL_BOOKS[bookIndex];
        
        return {
            book: bookInfo ? bookInfo.name : 'Desconhecido',
            chapter: v.chapter,
            verse: v.verse,
            text: v.text
        };
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return [];
  }
};