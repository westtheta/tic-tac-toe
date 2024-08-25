const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use((req, res, next) => {
  console.log(`Received request for ${req.url}`);
  next();
});

app.use(
  "/socket.io",
  createProxyMiddleware({
    target: "https://tic-tac-toe-28r3.onrender.com", // Your original server
    changeOrigin: true,
    ws: true, // Enable WebSocket proxying
    logLevel: "debug",
    pathRewrite: {
      "^/socket.io": "/socket.io", // Optional, ensure this matches what your target server expects
    },
    onProxyReqWs: (proxyReq, req, socket, options, head) => {
      console.log("WebSocket request:", req.url);
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
