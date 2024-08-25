const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use((req, res, next) => {
  console.log(`Received request for ${req.url}`);
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(
  "/socket.io",
  createProxyMiddleware({
    target: "https://tic-tac-toe-28r3.onrender.com",
    changeOrigin: true,
    ws: true,
    logLevel: "debug",
    pathRewrite: {
      "^/socket.io": "/socket.io", // This should match your server's expectation
    },
  })
);

app.get("/", (req, res) => {
  res.send("WebSocket Proxy Server");
});

app.get("/cron", (req, res) => {
  res.send("Wagwan my bro");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
