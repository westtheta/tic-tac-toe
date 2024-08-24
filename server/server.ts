const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "https://tic-tac-toe-mu-blue.vercel.app",
      "https://www.tic-tac-toe-mu-blue.vercel.app",
      // "http://localhost:3000/",
    ],
    methods: ["GET", "POST"],
  },
});

app.get("/cron", (req, res) => {
  res.send("Wagwan my bro");
});
let rooms = {};
let openRooms = new Set();

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("joinRoom", (room) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        board: Array(9).fill(""),
        scores: { X: 0, O: 0 },
        turn: "X",
      };
      openRooms.add(room);
    }

    if (rooms[room].players.length < 2) {
      rooms[room].players.push(socket.id);
    }

    if (rooms[room].players.length === 2) {
      rooms[room].gameStarted = true;
      openRooms.delete(room);
      io.in(room).emit("gameStart");
    }

    const role = rooms[room].players[0] === socket.id ? "X" : "O";
    io.to(socket.id).emit("roleAssignment", { role });
    io.in(room).emit("roomInfo", {
      message: rooms[room].players.length === 2 ? "Game is starting" : "",
      rooms: [...openRooms],
    });
  });

  socket.on("playMove", ({ room, index }) => {
    if (rooms[room] && rooms[room].gameStarted) {
      const currentBoard = rooms[room].board;
      if (currentBoard[index] === "") {
        currentBoard[index] = rooms[room].turn;
        rooms[room].turn = rooms[room].turn === "X" ? "O" : "X";

        io.in(room).emit("boardUpdate", currentBoard);

        const winnerData = checkWinner(currentBoard);
        if (winnerData) {
          rooms[room].scores[winnerData.winner]++;
          io.in(room).emit("gameOver", winnerData);
        }
      }
    }
  });

  socket.on("resetGame", (room) => {
    if (rooms[room]) {
      rooms[room].board = Array(9).fill("");
      rooms[room].turn = "X";
      io.in(room).emit("gameReset", rooms[room].board);
    }
  });

  socket.on("quitGame", (room) => {
    if (rooms[room]) {
      // Notify all players in the room that someone quit
      io.in(room).emit("playerQuit", "A player has quit the game.");

      const opponentId = rooms[room].players.find((id) => id !== socket.id);
      if (opponentId) {
        io.to(opponentId).emit("opponentQuit");
      }

      delete rooms[room];
      socket.leave(room);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);

    for (const room in rooms) {
      const roomData = rooms[room];
      if (roomData.players.includes(socket.id)) {
        // Notify all players in the room that someone disconnected
        io.in(room).emit("playerDisconnected", "A player has disconnected.");

        const opponentId = roomData.players.find((id) => id !== socket.id);
        if (opponentId) {
          io.to(opponentId).emit("opponentQuit");
        }

        delete rooms[room];
        break;
      }
    }
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

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningCombination: combination,
      };
    }
  }

  if (board.every((cell) => cell !== "")) {
    return { winner: null, winningCombination: [] };
  }

  return null;
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
