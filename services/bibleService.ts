import { ChapterResponse } from '../types';

const BASE_URL = 'https://bible-api.com';

export const fetchChapter = async (
  bookId: string,
  chapter: number,
  version: string
): Promise<ChapterResponse> => {
  try {
    // Construct URL: e.g., https://bible-api.com/John+3?translation=almeida
    const url = `${BASE_URL}/${bookId}+${chapter}?translation=${version}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }
    const data = await response.json();
    return data as ChapterResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
};