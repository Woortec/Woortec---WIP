// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://2423948f1a003866bda9b4e34b8d9796@o4509343230394369.ingest.de.sentry.io/4509343231377488",

  integrations: [
    // Sentry Replay for session recordings
    Sentry.replayIntegration(),

    // Sentry Feedback modal
    Sentry.feedbackIntegration({
      colorScheme: "system",       // auto-adjust based on user’s theme
      email: true,  
      screenshot: true
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: 1,

  // Session Replay Sampling
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Optional debug logs
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
