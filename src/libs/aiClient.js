import { GoogleGenAI } from '@google/genai'
import config from '../config/config.js'
import { descargarImagenIgnorandoCertificado, convertirImagenABase64 } from './imageDownloader.js'
import fs from 'fs'

const ai = new GoogleGenAI({
    apiKey: config.geminiApiKey,
})

export const generateDescriptionImg = async (data) => {
    const { mission, created_at, image_url, center } = data || {};
    
    let base64 = "";
    let tempPath = null;

    try {
        if (data.image_url) {
            try {
                tempPath = await descargarImagenIgnorandoCertificado(image_url);
                base64 = await convertirImagenABase64(tempPath);
            } catch (err) {
                console.error("Error al descargar/convertir imagen:", err);
            } finally {
                if (tempPath) {
                    try {
                        await fs.promises.unlink(tempPath);
                    } catch (e) {
                    }
                }
            }
        }

        const parts = [];

        if (base64) {
            parts.push({
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64,
                },
            });
        } else {
            parts.push({
                text: "No fue posible adjuntar la imagen por problemas de red/certificado. Procede solo con el texto."
            });
        }

        parts.push({
            text: `You are an expert space scientist. Explain the provided image in detail.
            Use the following parameters: Mission: ${mission ?? "unknown"}, Created at: ${created_at ?? "unknown"}, Center Coordinates: ${center ?? "unknown"}.
            Please explain concisely for a 5th grader.`
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts }],
        })

        const text = typeof response.text === "function" ? await response.text() : response.text;

        return text;
    } catch (error) {
        return error.message || "Error generating image description";
    }
}