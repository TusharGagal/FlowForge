import * as Sentry from "@sentry/nextjs";
Sentry.init({
  dsn: "https://7bdf148b673885a447e8c6eeb076896d@o4510760910782464.ingest.us.sentry.io/4510761170567168",
  // Adds request headers and IP for users
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
});