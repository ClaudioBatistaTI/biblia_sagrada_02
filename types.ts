
export interface Book {
  name: string;
  id: string; // English name for API
  chapters: number;
  testament: 'OT' | 'NT';
}

export interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface ChapterResponse {
  reference: string;
  verses: Verse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export interface Note {
  id: string;
  reference: string; // e.g., "John 3:16"
  text: string;
  createdAt: number;
}

export interface BibleVersion {
  id: string;
  name: string;
  language: string;
}

export interface SearchResult {
  book: string; // Portuguese name
  chapter: number;
  verse: number;
  text: string;
  sourceUrl?: string; // Link para fontes externas no modo IA
  relevance?: number;
}

export interface HistoryItem {
  bookId: string;
  bookName: string;
  chapter: number;
  timestamp: number;
  previewText?: string;
}

export type Theme = 'light' | 'dark' | 'sepia' | 'system';
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange' | null;
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type SearchSortOption = 'relevance' | 'canonical';

export interface DailyVerse {
  reference: string;
  text: string;
  bookId: string;
  chapter: number;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  days: {
    day: number;
    readings: {
      bookId: string; // English ID
      bookName: string; // PT Name
      chapter: number;
    }[];
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ViewState {
  READING = 'READING',
  SELECT_BOOK = 'SELECT_BOOK',
  SELECT_CHAPTER = 'SELECT_CHAPTER'
}
