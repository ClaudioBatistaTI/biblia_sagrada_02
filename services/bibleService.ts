import { ChapterResponse } from '../types';

const BASE_URL = 'https://bible-api.com';

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