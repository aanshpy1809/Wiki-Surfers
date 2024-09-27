import React, { useState, useEffect } from 'react';
import WikipediaNavigator from './WikipediaNavigator';
import io from 'socket.io-client';
import { useSocketContext } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const GamePage = () => {
    const {socket} = useSocketContext();
    const {roomId} = useParams();
    const {data: authUser}=useQuery({queryKey: ["authUser"]});
    const [opponentId, setOpponentId]=useState(null);
    const [opponentUser, setOpponentUser]=useState(null);
    const [currentPage1, setCurrentPage1] = useState("Shraddha_Kapoor");
    const [clicks1, setClicks1] = useState(0);
    const [currentPage2, setCurrentPage2] = useState("Shraddha_Kapoor");
    const [clicks2, setClicks2] = useState(0);
    const [opponentReachedTarget, setOpponentReachedTarget] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);
    const targetPage = "Instagram";

    useEffect(() => {
        if(!opponentId) return;
        const fetchOpponent=async()=>{
            try {
                const res=await fetch(`/api/auth/user/${opponentId}`);
                const data=await res.json();  
                console.log(data);
                if(!res.ok){
                    throw new Error(data.error || 'Something went wrong!')  
                }
                setOpponentUser(data);
            } catch (error) {
                console.log(error);
            }
        }

        fetchOpponent();
        
    },[opponentId])
    

    useEffect(() => {
        // Join a game room
        if (!socket) return;

        // Notify server of the room the user has joined
        socket.emit("roomDetails", roomId);

        // Listen for room details (e.g., if the room is empty or has other users)
        socket.on("roomDetails", ( {room} ) => {
            if (room.isEmpty) setIsEmpty(true);
            console.log(room);
            for(const player in room.players){
                if(room.players[player] !== authUser._id){
                    console.log(room.players[player]);
                    setOpponentId(room.players[player])
                }
            }
        });

        // Listen for when another user joins the room
        socket.on("userJoined", (userId) => {
            setOpponentId(userId);
            setIsEmpty(false);
        });

        // Listen for opponent's navigation updates
        socket.on("opponent_navigated", ({ newPage, clicks }) => {
            
            setCurrentPage2(newPage);
            setClicks2(clicks);
        });

        // Listen for opponent winning the game
        socket.on("opponent_won", () => {
            setOpponentReachedTarget(true);
        });

        return () => {
            socket.off("roomDetails");
            socket.off("userJoined");
            socket.off("opponent_navigated");
            socket.off("opponent_won");
        };
    }, [socket, roomId]);

    return (
        <div>
            <div className="flex flex-col justify-center items-center w-full">
                <h1 className="text-3xl font-bold mb-4">Wikipedia Navigator</h1>
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4">
                        <p className="text-xl font-semibold">You: {currentPage1.replace("_", " ")}</p>
                        <p className="text-xl font-semibold">Opponent: {currentPage2.replace("_", " ")}</p>
                        <p className="text-xl font-semibold">Target Page: {targetPage.replace("_", " ")}</p>
                    </div>
                </div>
            </div>

            <div className="flex h-screen">
                <div className="w-1/2 overflow-auto border-r border-gray-300">
                    <WikipediaNavigator
                        currentPage={currentPage1}
                        setCurrentPage={(newPage) => {
                            setCurrentPage1(newPage);
                            setClicks1((prev) => prev + 1);
                            // Emit the new page and incremented clicks
                            socket.emit("navigate_page", { room: roomId, newPage, clicks: clicks1 + 1 });
                        }}
                        targetPage={targetPage}
                        clicks={clicks1}
                        setClicks={setClicks1}
                        navigatorId="navigator1"
                        isOpponent={false}
                        roomId={roomId}
                        user={authUser}
                    />
                </div>

                {isEmpty ? (
                    <div className="w-1/2 overflow-auto">
                        <p className="text-red-500 text-center mt-4">Waiting for a user to join</p>
                    </div>
                ) : (
                    <div className="w-1/2 overflow-auto">
                        {opponentReachedTarget ? (
                            <p className="text-red-500 text-center mt-4">Your opponent won!</p>
                        ) : (
                            <WikipediaNavigator
                                currentPage={currentPage2}
                                setCurrentPage={()=>{}}  // Disable navigation for opponent
                                targetPage={targetPage}
                                clicks={clicks2}
                                setClicks={setClicks2}
                                navigatorId="navigator2"
                                isOpponent={true}
                                roomId={roomId}
                                user={opponentUser}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamePage;
