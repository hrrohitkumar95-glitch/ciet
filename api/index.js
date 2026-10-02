import { app, bootstrap } from "../server/src/index.js";

/**
 * Serverless entry point.
 *
 * `server/src/index.js` already registers the database gate as the first
 * middleware, so every route here is protected regardless of import order.
 * All this entry does is kick off the connection (and optional first-run
 * seeding) eagerly so the very first request does not pay for it. Failures are
 * logged and left to the gate, which answers 503 honestly.
 */
bootstrap().catch((err) => console.error("[api] bootstrap failed:", err.message));

export default app;
