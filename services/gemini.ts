import { GoogleGenAI, Type } from "@google/genai";
import { Priority, Category, AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

export const analyzeIncidentDescription = async (description: string, location: string): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return {
      priority: Priority.MEDIA,
      category: Category.PARCELAS,
      titleSuggestion: "Nueva Incidencia",
      suggestedSteps: ["Verificar in situ", "Contactar mantenimiento"]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Actúa como un Jefe de Mantenimiento de un Camping Resort. Analiza la siguiente descripción de una incidencia.
      
      Ubicación: "${location}"
      Descripción: "${description}"
      
      Determina:
      1. Prioridad: Baja, Media, Alta, Crítica.
      2. Categoría exacta (solo una): Parcelas, Bungalows, Glamping, Restaurant, Cocina, TTOO, Sanitarios.
      3. Título corto y profesional.
      4. 3 pasos inmediatos para el equipo de mantenimiento.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING, enum: ["Baja", "Media", "Alta", "Crítica"] },
            category: { type: Type.STRING, enum: ["Parcelas", "Bungalows", "Glamping", "Restaurant", "Cocina", "TTOO", "Sanitarios"] },
            titleSuggestion: { type: Type.STRING },
            suggestedSteps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["priority", "category", "titleSuggestion", "suggestedSteps"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    return {
        priority: result.priority as Priority,
        category: result.category as Category,
        titleSuggestion: result.titleSuggestion,
        suggestedSteps: result.suggestedSteps
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      priority: Priority.MEDIA,
      category: Category.PARCELAS,
      titleSuggestion: "Revisión Manual",
      suggestedSteps: ["Acudir al lugar", "Evaluar daños"]
    };
  }
};

export const suggestSolution = async (incidentTitle: string, incidentDescription: string, category: string): Promise<string> => {
    if (!apiKey) return "Falta la API Key. No se puede generar solución.";

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Eres experto en mantenimiento de instalaciones turísticas y campings.
            Proporciona un plan de acción técnico y conciso para resolver esta incidencia en la categoría: ${category}.
            Usa formato Markdown.
            
            Título: ${incidentTitle}
            Descripción: ${incidentDescription}`
        });

        return response.text || "No se pudo generar una solución.";
    } catch (error) {
        console.error("Gemini Solution Error:", error);
        return "Error conectando con el servicio de IA.";
    }
}