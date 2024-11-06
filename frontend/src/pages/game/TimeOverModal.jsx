import React from 'react';
import { useNavigate } from 'react-router-dom';

const TimeOverModal = () => {
    const navigate = useNavigate();
    const headerStyle =  "font-bold text-3xl text-red-500" ;

    const handleClick = () => {
        navigate("/");
    };

    return (
        <dialog id="my_modal_3" className="modal modal-bottom sm:modal-middle rounded-lg">
            <div className="modal-box p-10 bg-gray-700 ">
                <h3 className={headerStyle}>
                    😢 Better luck next time!
                </h3>
                <p className="py-6 text-xl text-center">
                    Sorry but your time is over! 
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

export default TimeOverModal;
