import React, { useState, useEffect, useRef } from 'react';
import WikipediaNavigator from './WikipediaNavigator';
import { useSocketContext } from '../../context/SocketContext';
import { unstable_usePrompt, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';





const GamePage = () => {
    
    
    const {socket} = useSocketContext();
    const {roomId} = useParams();
    const {data: authUser}=useQuery({queryKey: ["authUser"]});
    const [opponentId, setOpponentId]=useState(null);
    const [opponentUser, setOpponentUser]=useState(null);
    const [currentPage1, setCurrentPage1] = useState(localStorage.getItem("userPage") || "Shraddha_Kapoor");
    const [clicks1, setClicks1] = useState(Number(localStorage.getItem("userClicks"))|| 0);
    const [currentPage2, setCurrentPage2] = useState(localStorage.getItem("opponentPage") || "Shraddha_Kapoor");
    const [clicks2, setClicks2] = useState(Number(localStorage.getItem("opponentClicks")) || 0);
    const [opponentReachedTarget, setOpponentReachedTarget] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [opponentLeft,setOpponentLeft]=useState(false);
    const [startCounter, setStartCounter] = useState(false);
    const [counter,setCounter]=useState(3);
    const targetPage = "Instagram";
    

    const navigate = useNavigate();

    
  
    
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
        
    },[opponentId]);

    useEffect(() => {
        if (!startCounter) return;
        

        const countdown = setInterval(() => {
            setCounter((prevCounter) => prevCounter - 1);
        }, 1000);

        if (counter === 0) {
            clearInterval(countdown);
            setIsEmpty(false);
            setStartCounter(false);
            localStorage.setItem("gameStarted", true );
        }

        return () => clearInterval(countdown); // Cleanup the interval
    }, [startCounter, counter]);
    

    // useEffect(() => { 
    //     if(!startCounter) return
        
        
    //     setTimeout(()=>{
    //         setIsEmpty(false);
    //         setStartCounter(false);
    //     },[3000]);
    // },[startCounter])
    

    useEffect(() => {
        // Join a game room
        if (!socket ) return;
        

        // Notify server of the room the user has joined
        socket.emit("roomDetails", roomId);

        // Listen for room details (e.g., if the room is empty or has other users)
        socket.on("roomDetails", ( {room} ) => {
            if(room.lock && !room.players.includes(authUser._id) ){
                toast.error("Room is already full! Please start a new game");
                navigate('/');
                return ;
            }
            if (room.isEmpty) {
                setIsEmpty(true);
            }else if (localStorage.getItem("gameStarted")){
                setIsEmpty(false);
            }else{
                setStartCounter(true);
                socket.emit("roomLock", roomId)
            }
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
            setStartCounter(true);
        });

        // Listen for opponent's navigation updates
        socket.on("opponent_navigated", ({ newPage, clicks }) => {
            console.log("Event recieved");
            setCurrentPage2(newPage);
            setClicks2(clicks);
            localStorage.setItem("opponentClicks", clicks );
            localStorage.setItem("opponentPage", newPage);
        });

        // Listen for opponent winning the game
        socket.on("opponent_won", () => {
            setOpponentReachedTarget(true);
        });

        socket.on("opponentLeft",()=>{
            setOpponentLeft(true);
        })

        socket.on("opponentMightHaveLeft",()=>{
            setTimeout(()=>{
                socket.emit("checkForOpponent", roomId);
            }, [5000])
            
        });

        return () => {
            socket.off("roomDetails");
            socket.off("userJoined");
            socket.off("opponent_navigated");
            socket.off("opponent_won");
            socket.off("opponentLeft");
            socket.off("opponentMightHaveLeft")
        };
    }, [socket, roomId]);

    return (
        <div>
            <marquee className="text-white bg-red-500" behavior="scroll" direction="left" delay="100">Please do not click on the browser back button until the game is over!</marquee>
            <div className="flex flex-col justify-center items-center w-full">
                <h1 className="text-3xl font-bold mb-4">Wikipedia Navigator</h1>
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="mb-4">
                        <p className="text-xl font-semibold">You: {currentPage1.replace("_", " ")}</p>
                        <p className="text-xl font-semibold">Opponent: {currentPage2.replace("_", " ")}</p>
                        <p className="text-xl font-semibold">Target Page: {targetPage.replace("_", " ")}</p>
                        {startCounter && <p className="text-xl font-semibold">Game starts in {counter}</p>}
                    </div>
                </div>
            </div>

            {opponentLeft && <div className="flex justify-center  border-gray-300">
                    <p className="text-green-500 text-center mt-4">Opponent left the game and you won!</p> 
            </div>}
            {isEmpty && 
                <div className="flex h-screen">
                    <div className="w-1/2 overflow-auto">
                        <p className="text-green-500 text-center mt-4">{authUser.username}</p>
                    </div>
                    <div className="w-1/2 overflow-auto">
                        <p className="text-red-500 text-center mt-4">Waiting for a user to join</p>
                    </div>
                </div>
                
            }

            {!opponentLeft && !isEmpty && <div className="flex h-screen">
                
                {<div className="w-1/2 overflow-auto border-r border-gray-300">
                    <WikipediaNavigator
                        currentPage={currentPage1}
                        setCurrentPage={(newPage) => {
                            setCurrentPage1(newPage);
                        }}
                        targetPage={targetPage}
                        clicks={clicks1}
                        setClicks={setClicks1}
                        navigatorId="navigator1"
                        isOpponent={false}
                        roomId={roomId}
                        user={authUser}
                    />
                </div>}

                {isEmpty  ? (
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
            </div>}
            
        </div>
    );
};

export default GamePage;
