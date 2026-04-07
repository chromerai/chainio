// Import with `import * as Sentry from "@sentry/nextjs"` if you are using ESM
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://f6a8cbe7f64e96f96baa0d45ed942b21@o4511179530633216.ingest.de.sentry.io/4511179579785296",
  // Tracing must be enabled for agent monitoring to work
  tracesSampleRate: 1.0,
  // Add data like inputs and responses to/from LLMs and tools;
  // see https://docs.sentry.io/platforms/javascript/data-management/data-collected/ for more info
  sendDefaultPii: true,
  enableLogs: true,
});