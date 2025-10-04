import { GoogleGenAI } from "@google/genai";
import { descargarImagenIgnorandoCertificado, convertirImagenABase64 } from "./imageDownloader.js";
import fs from "fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const explainAI = async (req, res) => {
  const { mission, created_at, image_url, center_coords } = req.body || {};
  let base64 = "";
  let tempPath = null;

  try {
    if (image_url) {
      try {
        tempPath = await descargarImagenIgnorandoCertificado(image_url);
        // Si quieres forzar otra URL para pruebas, sustituye image_url arriba
        base64 = await convertirImagenABase64(tempPath);
      } catch (err) {
        console.error("Error al descargar/convertir imagen:", err);
      } finally {
        if (tempPath) {
          try {
            await fs.promises.unlink(tempPath);
          } catch (e) {
            // no-op
          }
        }
      }
    }

    // Construcción de partes para Gemini
    const parts = [];

    if (base64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64,
        },
      });
    } else {
      // Aviso al modelo: no pudimos adjuntar imagen
      parts.push({
        text: "No fue posible adjuntar la imagen por problemas de red/certificado. Procede solo con el texto."
      });
    }

    parts.push({
      text: `You are an expert space scientist. Explain the provided image in detail.
Use the following parameters: Mission: ${mission ?? "unknown"}, Created at: ${created_at ?? "unknown"}, Center Coordinates: ${center_coords ?? "unknown"}.
Please explain concisely for a 5th grader.`
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
    });

    // En el SDK de @google/genai, response.text es función
    const text = typeof response.text === "function" ? response.text() : response.text;

    res.status(200).json({
      success: true,
      usedImage: Boolean(base64),
      output: text,
    });
  } catch (error) {
    console.error("Error usando GoogleGenAI:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
