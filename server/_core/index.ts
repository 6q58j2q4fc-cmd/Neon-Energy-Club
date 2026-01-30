import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { generalLimiter, authLimiter, checkoutLimiter, llmLimiter } from "./rateLimit";
import multer from "multer";
import { storagePut } from "../storage";
import { sdk } from "./sdk";
import { randomBytes } from "crypto";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Trust proxy for accurate IP detection behind reverse proxies
  app.set("trust proxy", 1);
  
  // Stripe webhook endpoint - MUST be before body parser to get raw body
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const { handleStripeWebhook } = await import('../stripeWebhook');
      await handleStripeWebhook(req, res);
    } catch (error: any) {
      console.error('[Stripe Webhook] Error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Apply general rate limiting to all API routes
  app.use("/api", generalLimiter);
  
  // Apply stricter rate limiting to sensitive endpoints
  app.use("/api/oauth", authLimiter);
  app.use("/api/trpc/payment", checkoutLimiter);
  app.use("/api/trpc/distributor.analytics", llmLimiter);
  app.use("/api/trpc/distributor.getInsights", llmLimiter);
  app.use("/api/trpc/distributor.getRecommendations", llmLimiter);
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // File upload endpoint
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
  
  app.post('/api/upload', upload.single('file'), async (req: any, res) => {
    try {
      // Verify authentication using SDK
      const user = await sdk.authenticateRequest(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const ext = req.file.mimetype.split('/')[1] || 'png';
      const randomSuffix = randomBytes(8).toString('hex');
      const fileKey = `profiles/${user.id}/${Date.now()}-${randomSuffix}.${ext}`;
      
      const { url } = await storagePut(fileKey, req.file.buffer, req.file.mimetype);
      
      res.json({ url, key: fileKey });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || 'Upload failed' });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Rate limiting enabled: 100 req/min general, 5 req/15min auth, 5 req/min checkout`);
  });
}

startServer().catch(console.error);
