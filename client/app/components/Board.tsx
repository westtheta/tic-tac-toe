import React from "react";
interface IBoardProps {
  roomNumber: string;
  board: string[];
  handlePlay: (index: number) => void;
  winningIndexes: number[];
  resetGame: () => void;
  xWins: number;
  oWins: number;
}
function Board({
  roomNumber,
  board,
  handlePlay,
  winningIndexes,
  resetGame,
  xWins,
  oWins,
}: IBoardProps) {
  return (
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
  );
}

export default Board;
