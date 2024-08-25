const express = require(express);
const { createProxyMiddleware } = require(http-proxy-middleware);

const app = express();

// Proxy middleware
app.use(
  /socket.io,
  createProxyMiddleware({
    target: https://tic-tac-toe-28r3.onrender.com, // Your original server
    changeOrigin: true,
    ws: true, // Enable WebSocket proxying
  })
);

app.get(/, (req, res) => {
  res.send(WebSocket Proxy Server);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log();
});

