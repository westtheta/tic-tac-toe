var express = require("express");
var createServer = require("node:http").createServer;
var Server = require("socket.io").Server;
var cors = require("cors");
var app = express();
app.use(cors());
var server = createServer(app);
var io = new Server(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
    },
});
var rooms = {}; // Track room data
var openRooms = new Set(); // Track available rooms
io.on("connection", function (socket) {
    console.log("User ".concat(socket.id, " connected"));
    socket.on("joinRoom", function (room) {
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
        var roomData = rooms[room];
        if (roomData.players.length < 2) {
            var role = roomData.players.length === 0 ? "X" : "O";
            roomData.players.push({ id: socket.id, role: role });
            socket.emit("roleAssignment", { role: role });
            if (roomData.players.length === 2) {
                roomData.gameStarted = true;
                io.to(room).emit("gameStart");
                io.to(room).emit("roomInfo", { message: "Game is starting" });
            }
            else {
                socket.emit("roomInfo", {
                    message: "Waiting for another player\nRoom ".concat(room),
                    room: room,
                });
            }
        }
        else {
            socket.emit("roomInfo", { message: "Room is full" });
        }
    });
    socket.on("playMove", function (_a) {
        var _b;
        var room = _a.room, index = _a.index;
        var roomData = rooms[room];
        if (roomData && roomData.gameStarted) {
            var currentPlayer = (_b = roomData.players.find(function (player) { return player.id === socket.id; })) === null || _b === void 0 ? void 0 : _b.role;
            var currentTurn = roomData.board.filter(function (cell) { return cell !== ""; }).length % 2 === 0
                ? "X"
                : "O";
            if (currentPlayer === currentTurn && roomData.board[index] === "") {
                roomData.board[index] = currentPlayer;
                io.to(room).emit("boardUpdate", roomData.board);
                var winner = checkWinner(roomData.board);
                if (winner) {
                    roomData.scores[winner]++;
                    io.to(room).emit("gameOver", {
                        winner: winner,
                        winningCombination: getWinningCombination(roomData.board),
                    });
                }
                else if (roomData.board.every(function (cell) { return cell !== ""; })) {
                    io.to(room).emit("gameOver", { winner: null });
                }
            }
        }
    });
    socket.on("resetGame", function (room) {
        var roomData = rooms[room];
        if (roomData) {
            roomData.board = Array(9).fill("");
            roomData.gameStarted = true; // Keep the game active for another round
            io.to(room).emit("gameReset", roomData.board);
        }
    });
    socket.on("disconnect", function () {
        console.log("User ".concat(socket.id, " disconnected"));
    });
});
function checkWinner(board) {
    var winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (var _i = 0, winningCombinations_1 = winningCombinations; _i < winningCombinations_1.length; _i++) {
        var _a = winningCombinations_1[_i], a = _a[0], b = _a[1], c = _a[2];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}
function getWinningCombination(board) {
    var winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (var _i = 0, winningCombinations_2 = winningCombinations; _i < winningCombinations_2.length; _i++) {
        var _a = winningCombinations_2[_i], a = _a[0], b = _a[1], c = _a[2];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return [a, b, c];
        }
    }
    return [];
}
server.listen(3000, function () {
    console.log("Server running on port 3000");
});
