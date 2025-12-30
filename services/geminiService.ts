
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData } from "../types";

export const analyzeFootballVideo = async (videoBase64: string, mimeType: string): Promise<AnalysisData> => {
  // Fix: Initializing GoogleGenAI using the named apiKey parameter with process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      // Fix: Upgraded to gemini-3-pro-preview for advanced tactical reasoning and video analysis.
      model: "gemini-3-pro-preview",
      // Fix: Using a single Content object with parts for multimodal input (video data and text prompt).
      contents: {
        parts: [
          {
            inlineData: {
              data: videoBase64,
              mimeType: mimeType
            }
          },
          {
            text: `Analise este vídeo de futebol como um analista tático profissional da UEFA. 
            Extraia estatísticas REAIS baseadas estritamente no que acontece no vídeo.
            Instruções Críticas:
            1. Identifique as duas equipas e seus nomes reais.
            2. Calcule posse de bola, passes e remates baseando-se nas ações visíveis.
            3. Avalie o desempenho individual de cada jogador (escala 1-10).
            4. Liste os momentos chave com timestamps precisos.
            5. NÃO ALUCINE: Se não conseguir determinar um dado, use métricas padrão de um jogo equilibrado mas mantenha a coerência com o vídeo.`
          }
        ]
      },
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

    // Fix: Using the .text property directly to extract content from the response.
    const text = response.text;
    if (!text) throw new Error("A IA não conseguiu gerar dados para este vídeo.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("VisionPRO Accuracy Error:", error);
    throw new Error("Erro na extração de dados reais. Tente um clip mais curto ou de melhor qualidade.");
  }
};
