import React from "react";

interface IHomePageProps {
  startGame: () => void;
  inputRoom: string;
  setInputRoom: React.Dispatch<React.SetStateAction<string>>;
  joinRoom: () => void;
  availableRooms: string[];
}
function HomePage({
  startGame,
  inputRoom,
  setInputRoom,
  joinRoom,
  availableRooms,
}: IHomePageProps) {
  return (
    <>
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
    </>
  );
}

export default HomePage;
