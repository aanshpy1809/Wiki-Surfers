import React from 'react';
import { useNavigate } from 'react-router-dom';

const ResultModal = ({ opponentWon }) => {
    const navigate = useNavigate();
    const headerStyle = opponentWon ? "font-bold text-3xl text-red-500" : "font-bold text-3xl text-green-500";

    const handleClick = () => {
        navigate("/");
    };

    return (
        <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle rounded-lg">
            <div className="modal-box p-10 bg-gray-700 ">
                <h3 className={headerStyle}>
                    {opponentWon ? "😢 Better luck next time!" : "🎉 Congratulations!"}
                </h3>
                <p className="py-6 text-xl text-center">
                    {opponentWon ? "Your opponent has won the game!" : "You have won the game!"}
                </p>
                <div className="modal-action justify-center">
                    <form method="dialog">
                        <button onClick={handleClick} className="btn bg-white text-black font-semibold border-none shadow-md hover:shadow-lg transition duration-300">
                            Home
                        </button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default ResultModal;
