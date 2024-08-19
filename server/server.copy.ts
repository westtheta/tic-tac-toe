const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  //res.send("<h1>Helloer world from clement's test server</h1>")
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", function (socket) {
  // console.log("A user connected");
  socket.on("chat message", (msg) => {
    console.log("message:", msg);
    // io.emit("chat message", msg);
    socket.broadcast.emit("chat message", msg)
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Clement Server is listening for connection on port 3000");
});
