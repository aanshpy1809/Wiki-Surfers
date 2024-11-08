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
  const {data: gamedata}=useQuery({queryKey: ['gamedata']});
  
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
      localStorage.removeItem("startTime");
      localStorage.removeItem("modal");
      localStorage.removeItem("opponentReachedTarget");
      localStorage.removeItem("result");
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
    if(gamedata.coins<100){
        toast.error("Insufficient coins");
        return
    }
    socket.emit("joinGame", {userId: authUser._id, isPrivate: false});
  };

  const createRoom = () => {
    if(gamedata.coins<100){
        toast.error("Insufficient coins");
        return
    }
    socket.emit("joinGame", {userId: authUser._id, isPrivate: true});
  };

  const joinRoom = () => {
    if(gamedata.coins<100){
        toast.error("Insufficient coins");
        return
    }
    socket.emit("joinRoom", { roomId, userId: authUser._id });
  };

  return (
    <div className="flex flex-col">
      
      <Navbar />
      <div className="flex flex-col justify-center mt-5">
        <div className="flex justify-center items-center ">
          <img src={GeminiImage} alt="Gemini img" className="object-contain" style={{ width: "500px" }} />
        </div>
        <h1 className="text-xl mt-2 p-2 font-bold font-serif text-center">
          A Wikipedia Game with a Desi Twist: Bollywood & Cricket Showdowns!
        </h1>
      </div>
      
      <div className="flex flex-col items-center gap-5 mt-6 ">
      
      <button
        className="relative inline-flex items-center justify-center bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
        onClick={joinGame}
      >
        <span className="absolute inset-0 bg-white opacity-10 rounded-full"></span> {/* Glossy overlay */}
        <span className="relative">Join Game</span>
        <span
          className="flex items-center ml-2 bg-yellow-300 text-black font-semibold px-2 py-1 rounded-full shadow-inner relative"
          style={{ fontSize: "10px" }}
        >
          -100
          <img src="/coin.png" alt="coin" className="w-3 h-3 ml-1" />
        </span>
      </button>


        <button
            className="relative inline-flex items-center justify-center bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
            onClick={() => document.getElementById("my_modal_5").showModal()}
            >
            <span className="flex items-center">
                Play with Friend
                <span className="flex items-center ml-2 bg-yellow-300 text-black font-semibold px-2 py-1 rounded-full shadow-inner relative" style={{fontSize: "10px"}}>
                -100
                <img src="/coin.png" alt="coin" className="w-3 h-3 ml-1" />
                </span>
            </span>
            </button>
        <button className="relative inline-flex items-center justify-center bg-gradient-to-r from-cyan-400 via-blue-400 to-blue-500 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 text-white font-bold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-transform transform hover:scale-105 duration-300" onClick={handleLogout}>
          Logout
        </button>
        <footer class="text-center text-gray-500 py-4">
          <p>Developed by <a href="https://www.linkedin.com/in/aansh-sagar/" class="text-blue-500 hover:underline">Aansh Sagar</a></p>
        </footer>
      </div>

      
      <PlaywithFriendModal createRoom={createRoom} joinRoom={joinRoom} roomId={roomId} setRoomId={setRoomId}/>
      
    </div>
  );
};

export default HomePage;
