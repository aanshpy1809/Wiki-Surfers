import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Navbar = ({}) => {
    const navigate = useNavigate();
    const {data: gameData} =useQuery({
        queryKey: ["gamedata"],
      });
      const {data: authUser}=useQuery({queryKey: ["authUser"]});
    return (
        <nav className="flex justify-between items-center px-4 py-1  bg-gradient-to-r from-orange-600 via-yellow-500 to-blue-400 text-white">
            
            <img src="/appLogo.png" alt="logo" className="w-12 h-12 z-10 hover:scale-105 cursor-pointer" onClick={() => navigate("/")} />

            
            <div className="flex items-center space-x-4">
                
                <div className="flex items-center space-x-0.5 ">
                    <img src="/coin.png" alt="coin" className="w-8 h-8" />
                    <span className='text-md font-bold'>{gameData?.coins}</span>
                </div>

                
                    <img
                        src={authUser.profileImg}
                        alt="Profile Picture"
                        onClick={() => navigate("/profile")}
                        title='Profile'
                        className="rounded-full w-10 h-10 border-2 border-gray-500 cursor-pointer hover:border-orange-400"
                    />
                
            </div>
        </nav>
    );
};

export default Navbar;
