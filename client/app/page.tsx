"use client";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3000/");

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
        setWinningIndexes(data.winningCombination || []);
      }
    });

    socket.on("gameReset", (newBoard: string[]) => {
      setBoard(newBoard);
      setGameOver(false);
      setWinningIndexes([]);
      setShowToast(false);
      setIsXPlaying(true); // Reset to X's turn
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

  const handlePlay = (index: number) => {
    if (
      board[index] !== "" ||
      gameOver ||
      !gameStarted ||
      role !== (isXPlaying ? "X" : "O")
    )
      return;

    socket.emit("playMove", { room: roomNumber, index } as PlayMoveData);
  };

  const resetGame = () => {
    socket.emit("resetGame", roomNumber);
  };

  const startGame = () => {
    const roomNumber = generateRoomNumber();
    setRoomNumber(roomNumber);
    socket.emit("joinRoom", roomNumber);
    setInRoom(true);
  };

  const joinRoom = () => {
    if (inputRoom.trim() !== "") {
      setRoomNumber(inputRoom);
      socket.emit("joinRoom", inputRoom);
      setInRoom(true);
    }
  };

  const generateRoomNumber = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {!inRoom ? (
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold">Tic-Tac-Toe</h2>
          <button onClick={startGame} className="p-2 bg-blue-500 text-white">
            Create Room
          </button>
          <div>
            <input
              type="text"
              placeholder="Enter room number"
              value={inputRoom}
              onChange={(e) => setInputRoom(e.target.value)}
              className="border p-2"
            />
            <button onClick={joinRoom} className="p-2 bg-blue-500 text-white">
              Join Room
            </button>
          </div>
          <div>
            <h3>Available Rooms</h3>
            <ul>
              {availableRooms.map((room) => (
                <li key={room}>{room}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold mb-4">Room {roomNumber}</h3>
          <div className="grid grid-cols-3 gap-4">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handlePlay(index)}
                className={`border p-8 ${
                  winningIndexes.includes(index) ? "bg-green-300" : ""
                }`}
              >
                {cell}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <button onClick={resetGame} className="p-2 bg-red-500 text-white">
              Reset Game
            </button>
            <div>
              <p>
                X Wins: {xWins} | O Wins: {oWins}
              </p>
            </div>
          </div>
        </>
      )}

      {showToast && (
        <div className="fixed bottom-0 right-0 p-4 bg-gray-900 text-white">
          {gameOver
            ? `Game Over! ${
                winningIndexes.length > 0
                  ? `${role === "X" ? "O" : "X"} Wins!`
                  : "It's a Draw!"
              }`
            : ""}
        </div>
      )}

      {infoMessage && (
        <div className="fixed bottom-0 left-0 p-4 bg-gray-700 text-white">
          {infoMessage}
        </div>
      )}
    </main>
  );
}
