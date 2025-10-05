import { GoogleGenAI } from '@google/genai'
import config from '../config/config.js'
import { descargarImagenIgnorandoCertificado, convertirImagenABase64 } from './imageDownloader.js'
import fs from 'fs'

const ai = new GoogleGenAI({
    apiKey: config.geminiApiKey,
})

export const generateDescriptionImg = async (data) => {
    const { mission, created_at, thumbnail_url, center } = data || {};

    let base64 = "";
    let tempPath = null;
    let isTransformText = true;

    try {
        if (thumbnail_url) {
            try {
                tempPath = await descargarImagenIgnorandoCertificado(thumbnail_url);
                console.log("Image downloaded to:", tempPath);
                base64 = await convertirImagenABase64(tempPath);
            } catch (err) {
                console.error("Error al descargar/convertir imagen:", err);
                isTransformText = false;
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
            isTransformText = false;
        }

        parts.push({
            text: `You are a space science expert. Based on the visual information provided, write a short, clear description of what can be seen. 
            Do not mention that you are describing an image or that the image was provided. 
            Simply describe what is visible as if you were explaining it naturally.

            Add relevant context using:
            - Mission: ${mission ?? "unknown"}
            - Created at: ${created_at ?? "unknown"}
            - Center coordinates: ${center ?? "unknown"}

            Keep the explanation concise, accurate, and easy for anyone to understand. Focus on what is visible and its scientific or historical relevance. Avoid unnecessary technical terms or phrases like "this image shows" or "the picture displays".

            Respond strictly in **English only**.`
        });


        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts }],
        })

        const text = typeof response.text === "function" ? await response.text() : response.text;

        return { text, isTransformText };
    } catch (error) {
        return { text: "Error while generating description", isTransformText: false };
    }
}