import React from 'react'

const PlaywithFriendModal = ({createRoom, joinRoom, roomId, setRoomId}) => {
  return (
    <dialog
        id="my_modal_5"
        className="modal  bg-gray-700 modal-bottom sm:modal-middle rounded-md"
      >
        <div className="modal-box p-10">
          <h3 className="font-bold text-xl text-center">Play with Friend</h3>
          <p className="py-4 text-center">
            Enter a room ID or create one to play with a friend.
          </p>

          {/* Modal Action Form */}
          <div className="modal-action">
            <form method="dialog" className="flex flex-col gap-5">
              <button
                className="btn btn-primary bg-gray-950 text-white size-md"
                onClick={(e) => {
                  e.preventDefault();
                  createRoom();
                }}
              >
                Create Room
              </button>
              <div className="flex justify-center items-center"><input
                type="text"
                placeholder="Enter Room Id"
                onChange={(e) => setRoomId(e.target.value)}
                className="input  input-bordered w-full max-w-xs rounded-md text-center"
              /></div>
              <button
                className="btn btn-primary bg-gray-950 text-white size-md"
                onClick={(e) => {
                  e.preventDefault();
                  joinRoom();
                }}
              >
                Join Room
              </button>
              <button
                className="btn bg-gray-950 text-white"
                type="button"
                onClick={() => document.getElementById("my_modal_5").close()}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
  )
}

export default PlaywithFriendModal
