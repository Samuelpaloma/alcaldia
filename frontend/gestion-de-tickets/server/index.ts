import "dotenv/config";
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { handleDemo } from "./routes/demo";
import path from "path";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, "../public")));

  // Serve i18n files specifically
  app.get("/i18n/locales/:locale.json", (req, res) => {
    const locale = req.params.locale;
    const filePath = path.join(__dirname, "../public/i18n/locales", `${locale}.json`);
    console.log(`🌐 Serving i18n file for locale: ${locale} from path: ${filePath}`);
    res.sendFile(filePath);
  });

  // Proxy para el backend de autenticación
  app.use("/api/auth", createProxyMiddleware({
    target: "http://localhost:8080",
    changeOrigin: true,
    logLevel: "debug"
  }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return app;
}
