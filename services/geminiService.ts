
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  static async generateProductDescription(name: string, category: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Genera una descripción breve, atractiva y minimalista de un producto de electrónica llamado "${name}" en la categoría de "${category}". Máximo 150 caracteres.`,
      });
      return response.text || "Descripción generada automáticamente.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Producto de alta calidad para tus necesidades tecnológicas.";
    }
  }

  static async summarizeOrder(orderDetails: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Resume este pedido de una tienda en una sola línea informativa para un panel de administración: ${orderDetails}`,
      });
      return response.text || "Pedido recibido.";
    } catch (error) {
      return "Nuevo pedido detectado.";
    }
  }
}
