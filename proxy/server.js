const http = require("http");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({ ws: true });

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.url === "/cron" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Wagwan my bro");
  } else {
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
  console.log("Proxy server is running on port 3000");
});
