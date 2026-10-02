import app from "./app";
import config from "./app/config";

process.on("uncaughtException", (error) => {
  console.log(error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.log(error);
  process.exit(1);
});

// On Vercel the exported app is the request handler; locally we listen.
// The database connects on the first API request (see app.ts).
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Application  listening on port ${config.port}`);
  });
}

export default app;
