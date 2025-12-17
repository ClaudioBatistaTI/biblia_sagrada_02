import { ChapterResponse, SearchResult } from '../types';
import { ALL_BOOKS } from '../constants';

const BASE_URL = 'https://bible-api.com';
const SEARCH_API_URL = 'https://bolls.life/find/AA/';

export const fetchChapter = async (
  bookId: string,
  chapter: number,
  version: string
): Promise<ChapterResponse> => {
  try {
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
       console.error("Search API returned error:", response.status);
       return [];
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
        console.error("Unexpected search response format:", data);
        return [];
    }
    
    // Map API results to internal structure
    return data.map((v: any) => {
        // API book ID is 1-based (1 = Genesis)
        // Ensure bookIndex is within bounds of ALL_BOOKS array
        const bookIndex = (v.book || 0) - 1;
        
        let bookName = 'Desconhecido';
        if (bookIndex >= 0 && bookIndex < ALL_BOOKS.length) {
            bookName = ALL_BOOKS[bookIndex].name;
        }

        return {
            book: bookName,
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