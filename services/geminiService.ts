
import { GoogleGenAI, Type } from "@google/genai";
import { FunFact } from "../types";

// Initialize the Google GenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFunFact = async (itemName: string): Promise<FunFact> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Give me a very short, fun, 1-sentence fact for a 5-year-old child about ${itemName}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: 'The fun fact for the kid.',
            },
            topic: {
              type: Type.STRING,
              description: 'The item name.',
            },
          },
          required: ["text", "topic"],
        },
      },
    });

    // Access the .text property directly (do not call it as a method).
    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    const result = JSON.parse(text);
    return result as FunFact;
  } catch (error) {
    console.error("Error fetching fun fact:", error);
    return {
      text: `You found a ${itemName}! Great job!`,
      topic: itemName
    };
  }
};
