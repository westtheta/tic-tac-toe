const http = require("http");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({ ws: true });

const server = http.createServer((req, res) => {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests (OPTIONS method)
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route for /cron
  if (req.url === "/cron" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Wagwan my bro");
  } else {
    // Proxy all other requests
    // proxy.web(req, res, { target: "https://tic-tac-toe-28r3.onrender.com" });
    proxy.web(req, res, {
      target: "https://tic-tac-toe-28r3.onrender.com",
      changeOrigin: true,
    });
  }
});

server.on("upgrade", (req, socket, head) => {
  proxy.ws(req, socket, head, {
    target: "https://tic-tac-toe-28r3.onrender.com",
  });
});

server.listen(3000, () => {
  console.log("Proxy server with CORS is running on port 3000");
});
