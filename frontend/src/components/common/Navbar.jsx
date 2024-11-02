import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Navbar = ({}) => {
    const navigate = useNavigate();
    const {data: gameData} =useQuery({
        queryKey: ["gamedata"],
      });
    return (
        <nav className="flex justify-between items-center px-4 opacity-90 bg-gray-950 text-white">
            
            <img src="/appLogo.png" alt="logo" className="w-16 h-16" />

            
            <div className="flex items-center space-x-4">
                
                <div className="flex items-center space-x-1">
                    <img src="/coin.png" alt="coin" className="w-10 h-10" />
                    <span>{gameData?.coins}</span>
                </div>

                <button
                    onClick={() => navigate('/profile')}
                    className="bg-white text-blue-500 px-4 py-2  rounded-lg font-semibold hover:bg-gray-100"
                >
                    Profile
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
