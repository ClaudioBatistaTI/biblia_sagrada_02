import { ChapterResponse, SearchResult, SearchSortOption } from '../types';
import { ALL_BOOKS } from '../constants';
import { searchBibleReferences } from './geminiService';

const BASE_URL = 'https://bible-api.com';

export const fetchChapter = async (
  bookId: string,
  chapter: number,
  version: string
): Promise<ChapterResponse> => {
  try {
    let queryBook = bookId;
    
    // Handle specific Portuguese mapping for Almeida API request
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

export const searchVerses = async (
    query: string, 
    offset: number = 0, 
    sort: SearchSortOption = 'relevance'
): Promise<SearchResult[]> => {
  try {
    if (!query || query.length < 2) return [];

    // Use Gemini AI with Google Search Grounding with pagination and sort support
    const aiResults = await searchBibleReferences(query, offset, sort);
    
    // Map AI results to internal structure and validate book names
    return aiResults.map((v: any) => {
        // Try to find exact book match in our constants
        // The AI is instructed to return full Portuguese names
        let bookName = v.book;
        const knownBook = ALL_BOOKS.find(b => 
            b.name.toLowerCase() === v.book.toLowerCase() || 
            b.id.toLowerCase() === v.book.toLowerCase()
        );

        if (knownBook) {
            bookName = knownBook.name;
        }

        return {
            book: bookName,
            chapter: parseInt(v.chapter, 10),
            verse: parseInt(v.verse, 10),
            text: v.text
        };
    }).filter(item => item.book && !isNaN(item.chapter) && !isNaN(item.verse));

  } catch (error) {
    console.error("Search Service Error:", error);
    throw error;
  }
};