import React from 'react';
import { useNavigate } from 'react-router-dom';

const OpponentLeftTheGame = () => {
  const navigate = useNavigate();
  const headerStyle = "font-bold text-3xl text-green-500";

  const handleClick = () => {
    navigate("/");
  };

  return (
    <dialog id="my_modal_2" className="modal modal-bottom sm:modal-middle rounded-lg">
      <div className="modal-box p-10 bg-gray-800 rounded-lg">
        <h3 className={headerStyle}>
          🎉 Congratulations!
        </h3>
        <p className="py-6 text-xl text-center text-white">
          Opponent has left the game and you have won!
        </p>
        <div className="modal-action justify-center">
          <form method="dialog">
            <button
              onClick={handleClick}
              className="btn rounded-full bg-blue-500 text-white font-semibold border-none shadow-md hover:bg-blue-600 hover:shadow-lg transition duration-300"
            >
              Home
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default OpponentLeftTheGame;
