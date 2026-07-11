import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize database client to prevent crash on startup if credentials aren't set
let dbClient: any = null;

function getDb() {
  if (dbClient) return dbClient;
  
  const url = process.env.TURSO_CONNECTION_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!url) {
    console.warn("⚠️ TURSO_CONNECTION_URL environment variable is missing. Initializing fallback SQLite database (file:local.db)...");
    dbClient = createClient({
      url: "file:local.db"
    });
    return dbClient;
  }
  
  console.log("🔌 Initializing Turso connection with URL:", url);
  dbClient = createClient({
    url: url,
    authToken: authToken
  });
  return dbClient;
}

// Ensure leads table exists on server start
async function ensureTables() {
  try {
    const db = getDb();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        vehicleType TEXT,
        region TEXT,
        createdAt INTEGER
      )
    `);
    console.log("✅ Database schema initialized.");
  } catch (err) {
    console.error("❌ Database schema initialization failed:", err);
  }
}

// API Endpoints
app.post("/api/leads", async (req, res) => {
  const { id, name, email, phone, vehicleType, region, createdAt } = req.body;
  
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required fields." });
  }
  
  try {
    const db = getDb();
    const leadId = id || `lead-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const created = createdAt || Date.now();
    
    await db.execute({
      sql: "INSERT OR REPLACE INTO leads (id, name, email, phone, vehicleType, region, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [leadId, name.trim(), email.trim(), phone.trim(), vehicleType || "sedan", region || "Dar es Salaam", created]
    });
    
    res.status(201).json({
      success: true,
      message: "Lead recorded in Turso database successfully",
      lead: { id: leadId, name, email, phone, vehicleType, region, createdAt: created },
      isFallback: !process.env.TURSO_CONNECTION_URL
    });
  } catch (err: any) {
    console.error("❌ Failed to insert lead into Turso:", err);
    res.status(500).json({ error: "Failed to save registration: " + err.message });
  }
});

app.get("/api/leads", async (req, res) => {
  try {
    const db = getDb();
    const result = await db.execute("SELECT * FROM leads ORDER BY createdAt DESC");
    res.json({
      success: true,
      leads: result.rows,
      isFallback: !process.env.TURSO_CONNECTION_URL
    });
  } catch (err: any) {
    console.error("❌ Failed to query leads from Turso:", err);
    res.status(500).json({ error: "Failed to retrieve registration data: " + err.message });
  }
});

// Configure Vite middleware and static files serving
async function startServer() {
  await ensureTables();
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("🚀 Vite middleware mounted in Development mode.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("🚀 Static files served in Production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`📡 VIYEKO Full-Stack Server listening on http://localhost:${PORT}`);
  });
}

startServer();
