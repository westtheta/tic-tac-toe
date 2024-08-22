const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://tic-tac-toe-mu-blue.vercel.app", "https://www.tic-tac-toe-mu-blue.vercel.app"],
    methods: ["GET", "POST"],
  },
});

app.get("/cron",(req, res)=>{res.send("Wagwan my bro")})
const rooms = {}; // Track room data
const openRooms = new Set(); // Track available rooms

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("joinRoom", (room) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        gameStarted: false,
        board: Array(9).fill(""),
        scores: { X: 0, O: 0 },
      };
      openRooms.add(room);
      io.emit("roomInfo", {
        message: "Available rooms",
        rooms: Array.from(openRooms),
      });
    }

    const roomData = rooms[room];

    if (roomData.players.length < 2) {
      const role = roomData.players.length === 0 ? "X" : "O";
      roomData.players.push({ id: socket.id, role });

      socket.emit("roleAssignment", { role });

      if (roomData.players.length === 2) {
        roomData.gameStarted = true;
        io.to(room).emit("gameStart");
        io.to(room).emit("roomInfo", { message: "Game is starting" });
      } else {
        socket.emit("roomInfo", {
          message: `Waiting for another player\nRoom ${room}`,
          room,
        });
      }
    } else {
      socket.emit("roomInfo", { message: "Room is full" });
    }
  });

  socket.on("playMove", ({ room, index }) => {
    const roomData = rooms[room];
    if (roomData && roomData.gameStarted) {
      const currentPlayer = roomData.players.find((player) => player.id === socket.id)?.role;
      const currentTurn =
        roomData.board.filter((cell) => cell !== "").length % 2 === 0
          ? "X"
          : "O";

      if (currentPlayer === currentTurn && roomData.board[index] === "") {
        roomData.board[index] = currentPlayer;
        io.to(room).emit("boardUpdate", roomData.board);

        const winner = checkWinner(roomData.board);
        if (winner) {
          roomData.scores[winner]++;
          io.to(room).emit("gameOver", {
            winner,
            winningCombination: getWinningCombination(roomData.board),
          });
        } else if (roomData.board.every((cell) => cell !== "")) {
          io.to(room).emit("gameOver", { winner: null });
        }
      }
    }
  });

  socket.on("resetGame", (room) => {
    const roomData = rooms[room];
    if (roomData) {
      roomData.board = Array(9).fill("");
      roomData.gameStarted = true; // Keep the game active for another round
      io.to(room).emit("gameReset", roomData.board);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

function checkWinner(board) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of winningCombinations) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function getWinningCombination(board) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of winningCombinations) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }

  return [];
}

server.listen(3000, () => {
  console.log("Server running on port 3000");
});

