import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { brainRoutes } from "./brain";

const app = new Hono();

app.use("*", cors());

app.use(
  "/api/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

// Secure server-side proxy for Airtable + n8n (NO API KEYS in the mobile app)
app.route("/api/brain", brainRoutes);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;
