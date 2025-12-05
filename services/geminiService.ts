import { GoogleGenAI, Type, Chat } from "@google/genai";

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

export const searchBibleReferences = async (
  query: string, 
  filters?: { testament?: string, book?: string }
): Promise<any[]> => {
  if (!process.env.API_KEY) return [];

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    let filterContext = "";
    if (filters?.testament === 'OT') filterContext += "Busque APENAS no Antigo Testamento. ";
    if (filters?.testament === 'NT') filterContext += "Busque APENAS no Novo Testamento. ";
    if (filters?.book) filterContext += `Busque APENAS no livro de ${filters.book}. `;

    const prompt = `
      O usuário está buscando por: "${query}".
      ${filterContext}
      
      Sua tarefa é encontrar até 5 referências bíblicas que melhor correspondam a essa busca.
      Pode ser uma busca por tópico (ex: "ansiedade", "amor") ou uma referência direta (ex: "Salmos 23").
      
      Retorne APENAS um JSON array.
      Use os nomes dos livros em Português padrão (ex: "Gênesis", "1 João", "Apocalipse").
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              book: { type: Type.STRING, description: "Nome do livro em Português (ex: Mateus)" },
              chapter: { type: Type.INTEGER },
              verse: { type: Type.INTEGER },
              text: { type: Type.STRING, description: "Um breve trecho do versículo" }
            },
            required: ["book", "chapter", "verse", "text"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
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