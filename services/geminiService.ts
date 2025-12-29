
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData } from "../types";

export const analyzeFootballVideo = async (videoDescription: string): Promise<AnalysisData> => {
  // Inicialização estrita conforme as diretrizes para garantir uso da chave injetada
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Analise este jogo e retorne um JSON tático. Contexto: " + videoDescription,
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
          },
          required: ["homeTeam", "awayTeam", "highlights"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("ERRO_RESPOSTA_VAZIA");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("VisionPRO AI Error:", error);
    if (error.message?.includes("API key") || error.message?.includes("403") || error.message?.includes("401")) {
      throw new Error("AUTH_REQUIRED: Sincronização de motor necessária.");
    }
    throw new Error("Falha no processamento tático. Verifique a ligação.");
  }
};
