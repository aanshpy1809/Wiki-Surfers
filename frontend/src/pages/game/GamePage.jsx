import React, { useState, useEffect, useRef } from "react";
import WikipediaNavigator from "./WikipediaNavigator";
import { useSocketContext } from "../../context/SocketContext";
import {
  unstable_usePrompt,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { set } from "mongoose";
import ResultModal from "../../components/common/ResultModal";
import  useUpdateCoins  from "../../hooks/useUpdateCoins";
import WaitingCard from "./WaitingCard";
import SkeletonWaitingCard from "./SkeletonWaitingCard";
import PrivateWaiting from "./PrivateWaiting";
import OpponentLeftTheGame from "./OpponentLeftTheGame";
import TimerBox from "./TimerBox";
import TimeOverModal from "./TimeOverModal";

const GamePage = () => {
  const { socket } = useSocketContext();
  const { roomId } = useParams();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const {data: gameData} =useQuery({
    queryKey: ["gamedata"],
  });
  const [opponentId, setOpponentId] = useState(null);
  const [opponentUser, setOpponentUser] = useState(null);
  const [result, setResult] = useState(localStorage.getItem("result") || false);
  const [targetPage, setTargetPage] = useState(null);
  const [currentPage1, setCurrentPage1] = useState(
    localStorage.getItem("userPage") || null
  );
  const [clicks1, setClicks1] = useState(
    Number(localStorage.getItem("userClicks")) || 0
  );
  const [currentPage2, setCurrentPage2] = useState(
    localStorage.getItem("opponentPage") || null
  );
  const [clicks2, setClicks2] = useState(
    Number(localStorage.getItem("opponentClicks")) || 0
  );
  const [opponentReachedTarget, setOpponentReachedTarget] = useState(localStorage.getItem("opponentReachedTarget") || false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [startCounter, setStartCounter] = useState(false);
  const [counter, setCounter] = useState(3);
  const [sourcePage, setSourcePage] =useState(localStorage.getItem("sourcePage") || null);
  const [coins, setCoins] = useState(gameData?.coins);
  const [isReducing, setIsReducing] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const {joinGame,gameLost,gameWon:gameWonUpdate, isPending}=useUpdateCoins();
  const [privateRoom, setPrivateRoom]=useState(false);
  const [timeOver, setTimeOver]=useState(false);
  const [gameStarted, setGameStarted]=useState(localStorage.getItem("gameStarted") || false);
  const [modal, setModal]=useState(localStorage.getItem("modal") || null);
  
  // const targetPage = "Instagram";

  const location = useLocation();
  const navigate = useNavigate();

  useState(()=>{
    setCoins(gameData?.coins);
  },[gameData]);

  const reduceCoins = () => {
    setIsReducing(true);
    joinGame();
    setTimeout(() => {
      setCoins((prev) => prev - 100);
      setIsReducing(false);
    }, 2000); // 1 second animation
  };

  const increaseCoins = () => {
    setGameWon(true);
    gameWonUpdate();
    setTimeout(() => {
      setCoins((prev) => prev + 200);
      setGameWon(false);
    }, 2000); // 1 second animation
  };

  const handleKeydown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      alert("Search functionality is disabled on this page.");
    }
  };

  useEffect(() => {
    // Add the event listener once when the component mounts
    document.addEventListener('keydown', handleKeydown);

    return () => {
      // Remove the event listener on unmount
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  useEffect(() => {
    // Check if the route was accessed via internal navigation
    if (!location.state || !location.state.fromInternal) {
      // Redirect to home or display a message
      navigate("/", { state: { fromInternal: true } });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!opponentId) return;
    const fetchOpponent = async () => {
      try {
        const res = await fetch(`/api/auth/user/${opponentId}`);
        const data = await res.json();
        console.log(data);
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong!");
        }
        setOpponentUser(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOpponent();
  }, [opponentId]);

  useEffect(() => {
    if (!startCounter) return;
    
    const countdown = setInterval(() => {
      setCounter((prevCounter) => prevCounter - 1);
    }, 1000);

    if (counter === 0) {
      clearInterval(countdown);
      setIsEmpty(false);
      setStartCounter(false);
      setGameStarted(true);
      localStorage.setItem("gameStarted", true);
    }

    return () => clearInterval(countdown); // Cleanup the interval
  }, [startCounter, counter]);

  useEffect(() => {
      if(!startCounter) return

      reduceCoins();
  },[startCounter])

  useEffect(() => {
    // Join a game room
    if (!socket) return;

    // Notify server of the room the user has joined
    socket.emit("roomDetails", roomId);

    // Listen for room details (e.g., if the room is empty or has other users)
    socket.on("roomDetails", ({ room }) => {
      console.log(room);
      if (room.lock) {
        if (!room.players.includes(authUser._id)) {
          toast.error("Room is already full! Please start a new game");
          navigate("/");
          return;
        }
      }
      if(room.isPrivate){
        setPrivateRoom(true);
      }
      if (room.isEmpty) {
        setIsEmpty(true);
      } else if (localStorage.getItem("gameStarted")) {
        setIsEmpty(false);
      } else {
        setStartCounter(true);
        socket.emit("roomLock", roomId);
      }
      if (!localStorage.getItem("gameStarted")) {
        setCurrentPage1(room.source);
        setCurrentPage2(room.source);
        setSourcePage(room.source);
        localStorage.setItem("userPage", room.source);
        localStorage.setItem("opponentPage", room.source);
        localStorage.setItem("sourcePage", room.source);
        localStorage.setItem("userClicks", 0);
        localStorage.setItem("opponentClicks", 0);
      }
      setTargetPage(room.target);
      for (const player in room.players) {
        if (room.players[player] !== authUser._id) {
          console.log(room.players[player]);
          setOpponentId(room.players[player]);
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
      localStorage.setItem("opponentClicks", clicks);
      localStorage.setItem("opponentPage", newPage);
    });

    // Listen for opponent winning the game
    socket.on("opponent_won", () => {
      setOpponentReachedTarget(true);
      setResult(true);
      localStorage.setItem("result", true);
      
    });

    socket.on("opponentLeft", () => {
      console.log("opponent left");
      
      setOpponentLeft(true);
        
      
    });

    socket.on("opponentMightHaveLeft", () => {
      setTimeout(() => {
        socket.emit("checkForOpponent", roomId);
      }, [5000]);
    });

    return () => {
      socket.off("roomDetails");
      socket.off("userJoined");
      socket.off("opponent_navigated");
      socket.off("opponent_won");
      socket.off("opponentLeft");
      socket.off("opponentMightHaveLeft");
    };
  }, [socket, roomId]);

  useEffect(()=>{
    if(timeOver){
      setModal("my_modal_3");
      setResult(true);
      localStorage.setItem("result", true);
    }
  },[timeOver]);

  useEffect(() => {
    console.log(result, opponentReachedTarget);
    // Perform any action you need with the updated state
    if (opponentReachedTarget && result) {
      // document.getElementById("my_modal_1").showModal();
      setModal("my_modal_1");
      localStorage.setItem("opponentReachedTarget", true);
      localStorage.setItem("result", true);
    }
  }, [result, opponentReachedTarget]);

  useEffect(() => {
    if (opponentLeft && !result) {
      // document.getElementById("my_modal_2").showModal();
      setModal("my_modal_2");
      setResult(true)
      localStorage.setItem("result", true);
      increaseCoins();
    }
  }, [opponentLeft]);

  useEffect(() => {
    if (currentPage1 !== null && currentPage1 === targetPage) {
      socket.emit("reached_target", roomId);
      setResult(true);
      increaseCoins();
      // document.getElementById("my_modal_1").showModal();
      setModal("my_modal_1");
    }

    
  }, [currentPage1]);

  useEffect(()=>{
    if(modal){
      document.getElementById(modal).showModal();
      localStorage.setItem("modal", modal);
    }
  },[modal])

  return (
    <div >
      <marquee
        className="text-white bg-gradient-to-r from-orange-600 via-yellow-500 to-blue-400"
        behavior="scroll"
        direction="left"
        delay="100"
      >
        Please do not click on the browser back button until the game is over!
      </marquee>
      <div className="flex flex-col justify-center items-center w-full relative">
        <h1 className="flex justify-center items-center text-2xl font-bold mb-2">Enjoy the Game!</h1>
        
        <div className="flex items-center absolute top-1 right-4">
            <img src="/coin.png" alt="coin" className="w-8 h-8" />
            <span>{coins || gameData?.coins}</span>
            
            {isReducing && (
            <span className="text-red-500 text-md absolute top-4 right-3 animate-fade-down">
                -100
            </span>
            )}
            {gameWon && (
            <span className="text-green-500 text-md absolute top-6 right-1 animate-fade-up">
                +200
            </span>
            )}
        </div>
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4">
            <p className="text-md text-center font-semibold">
              Source Page: {isEmpty && !result?"Wait for the Game to start...":sourcePage?.replace("_", " ")}
            </p>
            <p className="text-md text-center font-semibold">
              Target Page: {isEmpty && !result?"Wait for the Game to start...":targetPage?.replace("_", " ")}
            </p>
            {gameStarted && <div className="flex items-center mt-2  justify-center">
              <TimerBox timeOver={timeOver} setTimeOver={setTimeOver} result={result}/>
            </div>}
            {startCounter && (
              <p className="text-lg text-center text-green-500 font-semibold">Game starts in {counter}</p>
            )}
          </div>
        </div>
      </div>
      <hr className=" border-gray-300" />
      {/* {opponentLeft && (
        <div className="flex justify-center  border-gray-300">
          <p className="text-green-500 text-center mt-4">
            Opponent left the game and you won!
          </p>
        </div>
      )} */}
      {isEmpty && !result && (
        <div className="flex max-h-screen">
          <div className="w-1/2 overflow-auto">
            {/* <p className="text-green-500 text-center mt-4">
              {authUser?.username}
            </p> */}
            <WaitingCard username={authUser?.username} profilePic={authUser?.profileImg} playerNumber={1} />
          </div>
          <div className="w-1/2 overflow-auto">
            {/* <p
              className={`${
                opponentUser ? "text-green-500" : "text-red-500"
              } text-center mt-4`}
            >
              {opponentUser
                ? opponentUser.username
                : "Waiting for a user to join"}{" "}
            </p> */}
            {opponentUser && 
              <WaitingCard username={opponentUser?.username} profilePic={opponentUser?.profileImg} playerNumber={2}/>}
            {!opponentUser &&privateRoom && <PrivateWaiting roomId={roomId}/>}
            {!opponentUser && !privateRoom && <SkeletonWaitingCard/>}
            
          </div>
        </div>
      )}

      { !isEmpty && (
        <div className="flex max-h-screen ">
          
          
            <div className="w-1/2 overflow-auto border-r  border-gray-300">
            <div className="flex md:flex-row m-2 gap-2 ">
            <img 
                src={authUser?.profileImg}
                alt={`${authUser?.username}'s profile`}
                className="w-8 h-8 rounded-full object-cover"
              />
              <p className="text-sm font-semibold">{authUser?.username}</p>
            </div>
            <hr className=" border-gray-300" />
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
              
            </div>
          
          
          {isEmpty ? (
            <div className="w-1/2 overflow-auto">
              <p className="text-red-500 text-center mt-4">
                Waiting for a user to join
              </p>
            </div>
          ) : (
            <>
            <div className="w-1/2 max-h-screen ">
            <div className="flex md:flex-row m-2 gap-2 ">
              <img 
                src={opponentUser?.profileImg}
                alt={`${opponentUser?.username}'s profile`}
                className="w-8 h-8 rounded-full object-cover"
              />
              <p className="text-sm font-semibold">{opponentUser?.username}</p>
            </div>
            <hr className=" border-gray-300" />
              <WikipediaNavigator
                currentPage={currentPage2}
                setCurrentPage={() => {}} // Disable navigation for opponent
                targetPage={targetPage}
                clicks={clicks2}
                setClicks={setClicks2}
                navigatorId="navigator2"
                isOpponent={true}
                roomId={roomId}
                user={opponentUser}
              />
              
            </div>
            
            </>
          )}
          
        </div>
      )}
      
      <ResultModal opponentWon={opponentReachedTarget} />
      <OpponentLeftTheGame  />
      <TimeOverModal/>
    </div>
  );
};

export default GamePage;
