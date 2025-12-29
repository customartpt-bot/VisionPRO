
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData } from "../types";

export const analyzeFootballVideo = async (videoDescription: string): Promise<AnalysisData> => {
  // Inicialização direta e obrigatória via variável de ambiente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Você é o motor tático VisionPRO. Analise o vídeo de futebol descrito e gere estatísticas JSON de nível profissional.
      Identifique padrões de jogo (ex: 4-3-3 ofensivo, bloco baixo), métricas físicas e técnicas.
      
      Contexto: ${videoDescription}`,
      config: {
        thinkingConfig: { thinkingBudget: 8192 }, // Máximo raciocínio para análise de scouting
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            homeTeam: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                stats: {
                  type: Type.OBJECT,
                  properties: {
                    possession: { type: Type.NUMBER },
                    passesTotal: { type: Type.NUMBER },
                    passesCompleted: { type: Type.NUMBER },
                    shotsTotal: { type: Type.NUMBER },
                    shotsOnTarget: { type: Type.NUMBER },
                    corners: { type: Type.NUMBER },
                    fouls: { type: Type.NUMBER },
                    yellowCards: { type: Type.NUMBER },
                    redCards: { type: Type.NUMBER }
                  }
                },
                players: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      number: { type: Type.NUMBER },
                      position: { type: Type.STRING },
                      distanceCovered: { type: Type.NUMBER },
                      topSpeed: { type: Type.NUMBER },
                      passes: { type: Type.NUMBER },
                      passAccuracy: { type: Type.NUMBER },
                      shots: { type: Type.NUMBER },
                      rating: { type: Type.NUMBER }
                    }
                  }
                }
              },
              required: ["name", "stats", "players"]
            },
            awayTeam: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                stats: {
                  type: Type.OBJECT,
                  properties: {
                    possession: { type: Type.NUMBER },
                    passesTotal: { type: Type.NUMBER },
                    passesCompleted: { type: Type.NUMBER },
                    shotsTotal: { type: Type.NUMBER },
                    shotsOnTarget: { type: Type.NUMBER },
                    corners: { type: Type.NUMBER },
                    fouls: { type: Type.NUMBER },
                    yellowCards: { type: Type.NUMBER },
                    redCards: { type: Type.NUMBER }
                  }
                },
                players: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      number: { type: Type.NUMBER },
                      position: { type: Type.STRING },
                      distanceCovered: { type: Type.NUMBER },
                      topSpeed: { type: Type.NUMBER },
                      passes: { type: Type.NUMBER },
                      passAccuracy: { type: Type.NUMBER },
                      shots: { type: Type.NUMBER },
                      rating: { type: Type.NUMBER }
                    }
                  }
                }
              },
              required: ["name", "stats", "players"]
            },
            highlights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("VisionPRO AI Error:", error);
    throw new Error("Erro no processamento tático automático.");
  }
};
