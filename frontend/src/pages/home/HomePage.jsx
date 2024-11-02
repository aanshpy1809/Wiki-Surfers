import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSocketContext } from "../../context/SocketContext";
import { useLocation, useNavigate } from "react-router-dom";
import GeminiImage from "/display.png";
import Navbar from "../../components/common/Navbar";
import PlaywithFriendModal from "./PlaywithFriendModal";


const HomePage = () => {
  const { socket } = useSocketContext();
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate(); // Move useNavigate here
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  
  const queryClient = useQueryClient();
  const location = useLocation();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong!");
        }
        return res;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout Failed!");
    },
  });

  const handleLogout = (e) => {
    logout();
  };

  useEffect(() => {
    // if (!location.state || !location.state.fromInternal) {
      localStorage.removeItem("userPage");
      localStorage.removeItem("sourcePage");
      localStorage.removeItem("userClicks");
      localStorage.removeItem("opponentClicks");
      localStorage.removeItem("opponentPage");
      localStorage.removeItem("gameStarted");
    // }
  });

  useEffect(() => {
    if (!socket) return;
    
    socket.emit("clean", authUser._id);

    socket.on("Room_Joined", ({ roomId }) => {
      console.log(roomId);
      navigate(`/game/${roomId}`, { state: { fromInternal: true } });
      // navigate(`/game/${roomId}`);

      toast.success("Room joined successfully");
    });

    socket.on("Room_Full", ({ roomId }) => {
      toast.error(`Room ${roomId} is either full or does not exist!`);
    });

    return () => {
    
      socket.off("Room_Joined");
      socket.off("Room_Full");
    };
  }, [socket, navigate]);

  const joinGame = () => {
    // if(authUser.coins<100){
    //     toast.error("Insufficient coins");
    //     return
    // }
    socket.emit("joinGame", {userId: authUser._id, isPrivate: false});
  };

  const createRoom = () => {
    // if(authUser.coins<100){
    //     toast.error("Insufficient coins");
    //     return
    // }
    socket.emit("joinGame", {userId: authUser._id, isPrivate: true});
  };

  const joinRoom = () => {
    // if(authUser.coins<100){
    //     toast.error("Insufficient coins");
    //     return
    // }
    socket.emit("joinRoom", { roomId, userId: authUser._id });
  };

  return (
    <div className="flex flex-col  h-screen">
      
      <Navbar />
      <div className="flex flex-col justify-center mt-5">
        <div className="flex justify-center items-center ">
          <img src={GeminiImage} alt="Gemini img" className="object-contain" />
        </div>
        <h1 className="text-3xl font-bold text-center">
          Welcome to play the multiplayer game
        </h1>
      </div>
      
      <div className="flex flex-col items-center gap-5 mt-10 ">
        <button className="btn bg-gray-950 btn-primary size-xl flex items-center space-x-1" onClick={joinGame}>
          Join Game
          <span className="flex items-center ml-2  bg-yellow-300 text-black font-semibold px-1.5 py-0.5 rounded-md" style={{fontSize: "10px"}}>
                -100
                <img src="/coin.png" alt="coin" className="w-3 h-3 ml-1" />
                </span>
        </button>
        <button
            className="btn bg-gray-950 btn-primary size-xl flex items-center space-x-1"
            onClick={() => document.getElementById("my_modal_5").showModal()}
            >
            <span className="flex items-center">
                Play with Friend
                <span className="flex items-center ml-2  bg-yellow-300 text-black font-semibold px-1.5 py-0.5 rounded-md" style={{fontSize: "10px"}}>
                -100
                <img src="/coin.png" alt="coin" className="w-3 h-3 ml-1" />
                </span>
            </span>
            </button>
        <button className="btn bg-gray-950 size-lg" onClick={handleLogout}>
          Logout
        </button>
      </div>

      
      <PlaywithFriendModal createRoom={createRoom} joinRoom={joinRoom} roomId={roomId} setRoomId={setRoomId}/>
    </div>
  );
};

export default HomePage;
