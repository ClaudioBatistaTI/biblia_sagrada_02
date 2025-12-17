import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SearchSortOption } from "../types";

export const getVerseInsight = async (verseText: string, context: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Chave de API não configurada. Por favor, configure a API_KEY para usar este recurso.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using flash model for speed and cost effectiveness
    const model = 'gemini-2.5-flash';

    const prompt = `
      Atue como um teólogo sábio e acessível.
      Forneça uma explicação concisa e edificante para o seguinte versículo bíblico.
      Se houver contexto histórico ou cultural relevante, inclua-o brevemente.
      Também forneça 2-3 referências cruzadas (outros versículos que se relacionam com este).
      
      Contexto (Livro/Capítulo): ${context}
      Versículo: "${verseText}"
      
      Responda em Português.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Não foi possível gerar uma explicação no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao consultar a inteligência artificial. Tente novamente mais tarde.";
  }
};

export const createBibleChat = (): Chat | null => {
    if (!process.env.API_KEY) return null;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `
                Você é um mentor bíblico amigável, sábio e encorajador.
                Seu objetivo é ajudar o usuário a entender a Bíblia, aplicar seus ensinamentos na vida diária e tirar dúvidas teológicas.
                
                Diretrizes:
                1. Use sempre a Bíblia como sua fonte principal de autoridade.
                2. Seja respeitoso com diferentes interpretações cristãs, mas foque no consenso geral ortodoxo.
                3. Use uma linguagem clara, acessível e empática.
                4. Se o usuário estiver passando por dificuldades emocionais, ofereça versículos de consolo e esperança.
                5. Mantenha as respostas concisas, mas completas.
                6. Responda sempre em Português do Brasil.
            `
        }
    });
};

export const searchBibleReferences = async (
    query: string, 
    offset: number = 0, 
    sort: SearchSortOption = 'relevance'
): Promise<any[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not configured");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    const limit = 20; // Items per "page"

    // Context instruction for sorting
    const sortInstruction = sort === 'canonical' 
        ? "ORDENAÇÃO: Os resultados OBRIGATORIAMENTE devem estar em ordem bíblica (Gênesis a Apocalipse)." 
        : "ORDENAÇÃO: Priorize os versículos mais famosos e diretos sobre o tema primeiro (Relevância).";

    // Context instruction for pagination (simulated via offset logic)
    const paginationInstruction = offset > 0 
        ? `Esta é uma continuação de busca (página ${Math.floor(offset / limit) + 1}). Ignorar os ${offset} versículos mais óbvios que provavelmente já foram mostrados e buscar versículos complementares ou menos citados sobre o mesmo tema.` 
        : "";

    const prompt = `
      Realize uma busca semântica na Bíblia para: "${query}".
      
      Instruções Técnicas:
      1. Retorne APENAS um JSON puro (Array de objetos).
      2. Encontre exatamente ${limit} versículos.
      3. ${sortInstruction}
      4. ${paginationInstruction}
      
      Formato do Objeto JSON:
      {
        "book": "Nome do Livro em Português (ex: 1 João, Salmos)",
        "chapter": 1,
        "verse": 1,
        "text": "Texto completo do versículo na versão Almeida"
      }
      
      Certifique-se de que os nomes dos livros estejam acentuados corretamente em Português.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] // Enable Google Search grounding
      }
    });

    let jsonString = response.text || "[]";
    
    // Clean up potential markdown code blocks
    jsonString = jsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "");

    try {
        const results = JSON.parse(jsonString);
        return Array.isArray(results) ? results : [];
    } catch (e) {
        console.error("Failed to parse Gemini search JSON", e);
        return [];
    }

  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};