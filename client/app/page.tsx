"use client";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Board from "./components/Board";
import HomePage from "./components/HomePage";
import { useCanvasClient } from "./utils/useCanvasClient";

// const socket: Socket = io("https://localhost:4000");
//const socket: Socket = io("https://tic-tac-toe-28r3.onrender.com/");
const socket: Socket = io("https://tic-tac-toe-proxy.onrender.com/socket.io")

export default function Home() {
  const { client, user, content, isReady } = useCanvasClient();

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

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const canvasClient = new CanvasClient();

  //     const fetchUser = async () => {
  //       try {
  //         const canvasHandshakeResponse = await canvasClient.ready();
  //         if (canvasHandshakeResponse) {
  //           setUser(canvasHandshakeResponse.untrusted.user);
  //         } else {
  //           console.error("Canvas handshake failed:", canvasHandshakeResponse);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching user from Canvas:", error);
  //       }
  //     };

  //     fetchUser();
  //   }
  // }, []);

  useEffect(() => {
    socket.on("roleAssignment", (data: { role: "X" | "O" }) => {
      setRole(data.role);
    });

    socket.on("roomInfo", (data) => {
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

      const xTurn = newBoard.filter((cell) => cell !== "").length % 2 === 0;
      setIsXPlaying(xTurn);
    });

    socket.on("gameOver", (data) => {
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
      setIsXPlaying(true);
    });

    socket.on("opponentQuit", () => {
      setInfoMessage("Your opponent has quit the game.");
      setInRoom(false);
      setGameStarted(false);
    });
    socket.on("playerQuit", (message) => {
      setInfoMessage("Your opponent has quit the game.");
      setInRoom(false);
      setGameStarted(false);
    });

    socket.on("playerDisconnected", (message) => {
      setInfoMessage("Your opponent has quit the game.");
      setInRoom(false);
      setGameStarted(false);
    });
    return () => {
      socket.off("roleAssignment");
      socket.off("roomInfo");
      socket.off("gameStart");
      socket.off("boardUpdate");
      socket.off("gameOver");
      socket.off("gameReset");
      socket.off("opponentQuit");
      socket.off("playerQuit");
      socket.off("playerDisconnected");
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

    socket.emit("playMove", { room: roomNumber, index });
  };

  const resetGame = () => {
    socket.emit("resetGame", roomNumber);
  };

  const startGame = () => {
    // Use the user's username as the room number if available, otherwise generate a random number
    const roomNumber = user ? user.username : generateRoomNumber();
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

  const handleQuitGame = () => {
    socket.emit("quitGame", roomNumber);
    setInRoom(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {!inRoom ? (
        <HomePage
          startGame={startGame}
          inputRoom={inputRoom}
          setInputRoom={setInputRoom}
          availableRooms={availableRooms}
          joinRoom={joinRoom}
        />
      ) : (
        <Board
          roomNumber={roomNumber}
          board={board}
          handlePlay={handlePlay}
          winningIndexes={winningIndexes}
          resetGame={resetGame}
          xWins={xWins}
          oWins={oWins}
        />
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
      {inRoom && (
        <div
          className="fixed top-0 left-0 bg-red-700 text-white p-4 cursor-pointer"
          onClick={handleQuitGame}
        >
          Quit Game
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
