
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData } from "../types";

export const analyzeFootballVideo = async (videoDescription: string): Promise<AnalysisData> => {
  // Acesso direto à chave de ambiente conforme diretrizes
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING: O ambiente não possui uma chave configurada. Verifique as definições do projeto.");
  }

  // Instanciação imediata antes da chamada
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o analista tático VisionPRO. Extraia estatísticas detalhadas deste jogo de futebol.
      Gere um relatório JSON completo com posse de bola, passes e desempenho individual.
      
      Contexto do Vídeo: ${videoDescription}`,
      config: {
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

    const text = response.text;
    if (!text) throw new Error("O motor de IA retornou uma resposta vazia.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("VisionPRO Runtime Error:", error);
    throw new Error(error.message || "Falha crítica no processamento de vídeo.");
  }
};
