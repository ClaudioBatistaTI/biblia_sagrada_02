
import { ChapterResponse, SearchResult, SearchSortOption } from '../types';
import { ALL_BOOKS } from '../constants';

const BASE_URL = 'https://bible-api.com';
const SEARCH_API_URL = 'https://bolls.life/find/AA/'; // Versão Almeida Atualizada

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
    const url = `${BASE_URL}/${formattedBook}+${chapter}?translation=${version}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao buscar capítulo: ${response.statusText}`);
    }
    const data = await response.json();
    return data as ChapterResponse;
  } catch (error) {
    console.error("Erro no Fetch da Bíblia:", error);
    throw error;
  }
};

/**
 * Realiza uma busca textual literal (concordância) em toda a Bíblia.
 * Retorna todas as ocorrências mapeadas para os livros internos.
 */
export const searchVerses = async (
    query: string
): Promise<SearchResult[]> => {
  try {
    if (!query || query.trim().length < 2) return [];

    const url = `${SEARCH_API_URL}?search=${encodeURIComponent(query)}&match_case=false`;
    
    const response = await fetch(url);

    if (!response.ok) {
       throw new Error("Servidor de busca indisponível no momento.");
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
        return [];
    }
    
    return data.map((v: any) => {
        const bookId = parseInt(v.book, 10);
        // O mapeamento da API bolls (1-66) corresponde exatamente ao nosso array ALL_BOOKS
        const bookIndex = isNaN(bookId) ? -1 : bookId - 1;
        
        let bookName = 'Desconhecido';
        if (bookIndex >= 0 && bookIndex < ALL_BOOKS.length) {
            bookName = ALL_BOOKS[bookIndex].name;
        }

        return {
            book: bookName,
            chapter: parseInt(v.chapter, 10),
            verse: parseInt(v.verse, 10),
            text: v.text
        };
    }).filter(item => item.book !== 'Desconhecido');

  } catch (error) {
    console.error("Erro no Serviço de Busca:", error);
    throw new Error("Erro de conexão com o banco de dados bíblico.");
  }
};
