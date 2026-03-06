const { createServer } = require("node:http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function startServer() {
  try {
    const { verifyUpstashConnections } = await import("./scripts/verify-upstash.mjs");
    await verifyUpstashConnections(dev ? "dev-start" : "start");

    await app.prepare();

    createServer((req, res) => {
      handle(req, res);
    }).listen(port, hostname, () => {
      console.log(`Next.js server ready at http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("Failed to start Next.js custom server", error);
    process.exit(1);
  }
}

startServer();
