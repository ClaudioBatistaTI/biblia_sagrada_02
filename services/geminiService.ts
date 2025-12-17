
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SearchResult } from "../types";

export const performDeepBibleSearch = async (query: string): Promise<{ text: string, sources: {title: string, uri: string}[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key não configurada.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: model,
      contents: query,
      config: {
        systemInstruction: `
          Você é um especialista em exegese bíblica e concordância.
          Sua missão é ajudar o usuário a encontrar passagens bíblicas, temas e contextos históricos.
          
          Regras:
          1. Use a ferramenta Google Search para validar versículos e fatos históricos.
          2. Cite SEMPRE o livro, capítulo e versículo (ex: João 3:16).
          3. Forneça uma resposta rica, comparando diferentes perspectivas se necessário.
          4. No final, resuma os principais versículos citados em uma lista clara.
          5. Responda em Português do Brasil.
        `,
        tools: [{ googleSearch: {} }],
      },
    });

    const textOutput = response.text || "";
    const sources: {title: string, uri: string}[] = [];
    
    // Extract sources from grounding chunks
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const chunks = groundingMetadata?.groundingChunks;
    
    if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web) {
                sources.push({
                    title: chunk.web.title || "Fonte Externa",
                    uri: chunk.web.uri
                });
            }
        });
    }

    // Deduplicate sources by URI
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());
    
    return {
      text: textOutput,
      sources: uniqueSources
    };
  } catch (error) {
    console.error("Deep Search Error:", error);
    throw error;
  }
};

export const getVerseInsight = async (verseText: string, context: string): Promise<string> => {
  if (!process.env.API_KEY) return "Erro de configuração.";
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explique brevemente o contexto teológico: ${context} - "${verseText}"`,
  });
  return response.text || "Sem insight disponível.";
};

export const createBibleChat = (): Chat | null => {
    if (!process.env.API_KEY) return null;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.chats.create({ 
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: "Você é um mentor bíblico sábio. Responda com base nas escrituras e cite referências."
        }
    });
};
