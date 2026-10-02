import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

/**
 * Guards every request until MongoDB is actually connected.
 *
 * Why this exists: on Vercel the serverless function is invoked cold, so
 * without it Mongoose buffers each query for 10s and then rejects it. The
 * symptom is not "no data" but a slow, confusing failure that the frontend used
 * to mistake for an empty collection.
 *
 * Design notes:
 *  - it waits on the connection, not on seeding, because seeding is optional and
 *    a seeding problem must not take the site down;
 *  - it re-checks per request instead of capturing one promise, because
 *    `connectDB` forgets a failed attempt deliberately so a later request can
 *    retry. A cached rejected promise would pin the instance to 503 forever;
 *  - the timeout is built per request, because a rejected promise stays
 *    rejected and a shared one would make later requests fail instantly.
 */
const DB_READY_TIMEOUT_MS = Number(process.env.DB_READY_TIMEOUT_MS || 12000);

async function requireDatabase() {
  if (mongoose.connection.readyState === 1) return;
  await connectDB();
}

export function dbGate() {
  return async function gate(_req, res, next) {
    if (mongoose.connection.readyState === 1) return next();

    let timer;
    const timeout = new Promise((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error("Database connection timeout")), DB_READY_TIMEOUT_MS);
    });

    try {
      await Promise.race([requireDatabase(), timeout]);
      next();
    } catch (err) {
      console.error("[db-gate] request blocked on database:", err.message);
      res.status(503).json({ message: "Service temporarily unavailable. Please try again shortly." });
    } finally {
      clearTimeout(timer);
    }
  };
}