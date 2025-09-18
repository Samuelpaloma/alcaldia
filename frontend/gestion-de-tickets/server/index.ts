import "dotenv/config";
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
