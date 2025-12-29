
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData } from "../types";

export const analyzeFootballVideo = async (videoDescription: string): Promise<AnalysisData> => {
  // Inicialização estrita conforme as diretrizes: assume que process.env.API_KEY existe e é válida.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o VisionPRO Tactical Engine, um sistema avançado de IA para analistas de futebol.
      Sua tarefa é simular uma análise detalhada e profunda baseada no contexto fornecido.
      Mesmo que receba apenas o nome de um arquivo ou uma descrição curta, você deve gerar estatísticas realistas e taticamente coerentes para um jogo de alto nível.
      
      CONTEXTO DO VÍDEO/JOGO: ${videoDescription}
      
      REQUISITOS OBRIGATÓRIOS:
      - Gere nomes de equipas e jogadores realistas baseados no contexto ou nomes fictícios profissionais.
      - As estatísticas devem ser detalhadas (posse de bola, precisão de passes, remates).
      - Inclua um log de destaques (highlights) com timestamps (ex: 12', 45+2', 88') e eventos táticos.
      - O RETORNO DEVE SER EXCLUSIVAMENTE UM JSON VÁLIDO.`,
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
                  type: { type: Type.STRING, description: "goal, card, shot, tactical" }
                }
              }
            }
          },
          required: ["homeTeam", "awayTeam", "highlights"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("O motor de IA não gerou conteúdo.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("VisionPRO Runtime Error:", error);
    throw new Error(`Erro na análise: ${error.message || "Verifique sua cota de API Free"}`);
  }
};
