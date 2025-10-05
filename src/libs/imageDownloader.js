import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { URL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Agente HTTPS que ignora cert y permite TLS viejito
const insecureHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  // Muchos servidores legacy no soportan TLS1.2; Node por defecto exige 1.2
  // Con esto permitimos desde TLS1.0.
  minVersion: "TLSv1",
  // En algunos casos ayuda:
  // secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT
});

function requestWithProtocol(u, options, onResponse) {
  return (u.protocol === "http:" ? http : https).get(u, options, onResponse);
}

export async function descargarImagenIgnorandoCertificado(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const startUrl = new URL(url);
    const filePath = path.join(tmpdir(), `imagen-${Date.now()}.jpg`);
    const headers = {
      // Algunos servidores rechazan agentes por defecto de Node
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "*/*",
      "Connection": "keep-alive",
    };

    let redirects = 0;
    let timedOut = false;

    const doRequest = (currentUrl) => {
      const isHttps = currentUrl.protocol === "https:";
      const options = {
        headers,
        agent: isHttps ? insecureHttpsAgent : undefined,
      };

      const req = requestWithProtocol(currentUrl, options, (res) => {
        const code = res.statusCode || 0;

        // Manejo de redirecciones
        if ([301, 302, 303, 307, 308].includes(code)) {
          if (redirects >= maxRedirects) {
            res.resume();
            return reject(new Error(`Demasiadas redirecciones (${redirects})`));
          }
          const loc = res.headers.location;
          if (!loc) {
            res.resume();
            return reject(new Error(`Respuesta ${code} sin Location`));
          }
          redirects++;
          const nextUrl = new URL(loc, currentUrl); // resuelve relativas
          res.resume();
          return doRequest(nextUrl);
        }

        if (code !== 200) {
          res.resume();
          return reject(new Error(`Error HTTP ${code} al descargar ${currentUrl.href}`));
        }

        // Escribimos a archivo temporal
        const fileStream = fs.createWriteStream(filePath);
        console.log("Downloading image from:", currentUrl.href);
        console.log("Saving to:", filePath);
        res.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close(() => resolve(filePath));
        });

        fileStream.on("error", (err) => {
          res.resume();
          reject(err);
        });
      });

      // Timeout defensivo (15s)
      req.setTimeout(15000, () => {
        timedOut = true;
        req.destroy(new Error("Timeout de descarga (15s)"));
      });

      req.on("error", (err) => {
        if (!timedOut) reject(err);
      });
    };

    doRequest(startUrl);
  });
}

export async function convertirImagenABase64(filePath) {
  const data = await fs.promises.readFile(filePath);
  return data.toString("base64");
}
