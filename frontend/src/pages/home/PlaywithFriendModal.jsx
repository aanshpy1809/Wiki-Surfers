import React from 'react';

const PlaywithFriendModal = ({ createRoom, joinRoom, roomId, setRoomId }) => {
  return (
    <dialog
      id="my_modal_5"
      className="modal bg-gray-950 modal-bottom sm:modal-middle rounded-lg"
    >
      <div className="modal-box p-10 bg-gray-800 text-gray-200 rounded-md">
        <h3 className="font-bold font-mono text-2xl text-center text-orange-400">
          Play with Friend
        </h3>
        <p className="py-4 text-center text-gray-300">
          Enter a room ID or create one to play with a friend.
        </p>

        {/* Modal Action Form */}
        <div className="modal-action">
          <form method="dialog" className="flex flex-col gap-5">
            <button
              className="btn bg-orange-500 hover:bg-orange-600 text-white size-md rounded-md shadow-md"
              onClick={(e) => {
                e.preventDefault();
                createRoom();
              }}
            >
              Create Room
            </button>
            <div className="flex justify-center items-center">
              <input
                type="text"
                placeholder="Enter Room ID"
                onChange={(e) => setRoomId(e.target.value)}
                className="input input-bordered w-full max-w-xs rounded-md text-center text-gray-800 bg-gray-100"
              />
            </div>
            <button
              className="btn bg-blue-500 hover:bg-blue-600 text-white size-md rounded-md shadow-md"
              onClick={(e) => {
                e.preventDefault();
                joinRoom();
              }}
            >
              Join Room
            </button>
            <button
              className="btn bg-gray-700 hover:bg-gray-600 text-white rounded-md"
              type="button"
              onClick={() => document.getElementById("my_modal_5").close()}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default PlaywithFriendModal;
