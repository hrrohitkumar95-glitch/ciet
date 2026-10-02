import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memServer = null;
let connectionPromise = null;

const ATTEMPTS = Number(process.env.DB_CONNECT_ATTEMPTS || 3);
const RETRY_DELAY_MS = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 750);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectWithRetry(uri) {
  let lastError;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      return mongoose.connection;
    } catch (err) {
      lastError = err;
      console.warn(`[db] connect attempt ${attempt}/${ATTEMPTS} failed (${err.message})`);
      if (attempt < ATTEMPTS) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError;
}

async function openConnection() {
  const candidates = [process.env.MONGO_URI, process.env.MONGO_DIRECT_URI].filter(Boolean);

  for (const uri of candidates) {
    try {
      const connection = await connectWithRetry(uri);
      console.log(`[db] MongoDB connected (${uri.replace(/:\/\/[^@]*@/, "://***@")})`);
      return connection;
    } catch (err) {
      console.warn(`[db] ${uri.replace(/:\/\/[^@]*@/, "://***@")} unreachable, trying next...`);
    }
  }

  if (process.env.VERCEL) {
    throw new Error("[db] No MongoDB reachable — check Atlas Network Access includes 0.0.0.0/0 for Vercel");
  }

  console.warn("[db] MongoDB unavailable, starting in-memory MongoDB (dev fallback)...");
  memServer = await MongoMemoryServer.create();
  await mongoose.connect(memServer.getUri("golz"));
  console.log(`[db] In-memory MongoDB connected (${memServer.getUri()})`);
  return mongoose.connection;
}

/**
 * Connects once per process. The promise is memoised so that concurrent
 * requests — and retries after a dropped connection — never start a second
 * competing connection attempt.
 */
export function connectDB() {
  if (!connectionPromise) {
    connectionPromise = openConnection().catch((err) => {
      // Allow a later request to retry instead of caching a permanent failure.
      connectionPromise = null;
      throw err;
    });

    mongoose.connection.on("error", (e) => console.error("[db] connection error:", e.message));
    mongoose.connection.on("disconnected", () => console.warn("[db] connection lost"));
  }
  return connectionPromise;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memServer) await memServer.stop();
}
