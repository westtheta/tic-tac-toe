"use client";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

// const socket: Socket = io("http://localhost:3000/");
const socket: Socket = io("https://tic-tac-toe-28r3.onrender.com/");

interface RoomInfo {
  message: string;
  rooms?: string[];
}

interface GameOverData {
  winner: "X" | "O" | null;
  winningCombination?: number[];
}

interface PlayMoveData {
  room: string;
  index: number;
}

export default function Home() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [isXPlaying, setIsXPlaying] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [winningIndexes, setWinningIndexes] = useState<number[]>([]);
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [inputRoom, setInputRoom] = useState<string>("");
  const [inRoom, setInRoom] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [infoMessage, setInfoMessage] = useState<string>("");
  const [xWins, setXWins] = useState<number>(0);
  const [oWins, setOWins] = useState<number>(0);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [role, setRole] = useState<"X" | "O" | "">("");

  useEffect(() => {
    socket.on("roleAssignment", (data: { role: "X" | "O" }) => {
      setRole(data.role);
    });

    socket.on("roomInfo", (data: RoomInfo) => {
      setInfoMessage(data.message);
      if (data.rooms) {
        setAvailableRooms(data.rooms);
      }
      if (data.message === "Game is starting") {
        setGameStarted(true);
      }
    });

    socket.on("gameStart", () => {
      setGameStarted(true);
    });

    socket.on("boardUpdate", (newBoard: string[]) => {
      setBoard(newBoard);

      // Determine whose turn it is based on the number of moves made
      const xTurn = newBoard.filter((cell) => cell !== "").length % 2 === 0;
      setIsXPlaying(xTurn);
    });

    socket.on("gameOver", (data: GameOverData) => {
      setGameOver(true);
      setShowToast(true);
      if (data.winner) {
        if (data.winner === "X") {
          setXWins((prev) => prev + 1);
        } else {
          setOWins((prev) => prev + 1);
        }
        if (data.winningCombination) {
          setWinningIndexes(data.winningCombination);
        }
      }
    });

    socket.on("gameReset", (newBoard: string[]) => {
      setBoard(newBoard);
      setIsXPlaying(true);
      setGameOver(false);
      setWinningIndexes([]);
    });

    return () => {
      socket.off("roleAssignment");
      socket.off("roomInfo");
      socket.off("gameStart");
      socket.off("boardUpdate");
      socket.off("gameOver");
      socket.off("gameReset");
    };
  }, []);

  const handleCellClick = (index: number) => {
    if (!gameOver && board[index] === "" && role === (isXPlaying ? "X" : "O")) {
      socket.emit("playMove", { room: roomNumber, index });
    }
  };

  const handleRoomJoin = () => {
    if (inputRoom.trim() !== "") {
      socket.emit("joinRoom", inputRoom.trim());
      setRoomNumber(inputRoom.trim());
      setInRoom(true);
    }
  };

  const resetGame = () => {
    socket.emit("resetGame", roomNumber);
    setShowToast(false);
  };

  const quitGame = () => {
    socket.emit("quitGame", roomNumber);
    setInRoom(false);
    setRoomNumber("");
    setInputRoom("");
    setGameStarted(false);
    setBoard(Array(9).fill(""));
    setGameOver(false);
    setShowToast(false);
    setInfoMessage("");
    setWinningIndexes([]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      {!inRoom ? (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold mb-8">Join a Room</h1>
          <input
            type="text"
            placeholder="Enter Room Number"
            value={inputRoom}
            onChange={(e) => setInputRoom(e.target.value)}
            className="p-2 rounded border"
          />
          <button
            onClick={handleRoomJoin}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Join Room
          </button>
          <div className="mt-4">
            <h2 className="text-xl font-semibold">Available Rooms:</h2>
            {availableRooms.length > 0 ? (
              <ul className="list-disc ml-6 mt-2">
                {availableRooms.map((room) => (
                  <li key={room} className="cursor-pointer">
                    <span
                      onClick={() => {
                        setInputRoom(room);
                      }}
                    >
                      {room}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No rooms available</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">
            Room: {roomNumber} | Role: {role}
          </h1>
          <h2 className="text-lg mb-4">{infoMessage}</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {board.map((cell, index) => (
              <div
                key={index}
                onClick={() => handleCellClick(index)}
                className={`w-16 h-16 flex items-center justify-center text-2xl font-bold cursor-pointer border ${
                  winningIndexes.includes(index)
                    ? "bg-green-200"
                    : "bg-white"
                }`}
              >
                {cell}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Reset Game
            </button>
            <button
              onClick={quitGame}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Quit Game
            </button>
          </div>
          {showToast && (
            <div className="mt-4 bg-yellow-300 p-2 rounded">
              {gameOver
                ? winningIndexes.length > 0
                  ? `Game Over! ${role} Wins!`
                  : "Game Over! It's a draw!"
                : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
