import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useSocketContext } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';


const HomePage = () => {
    
    const {socket}  = useSocketContext();
    const [roomId, setRoomId] = useState("");
    const navigate = useNavigate(); // Move useNavigate here
    const { data: authUser } = useQuery({
        queryKey: ['authUser']
    });
    const queryClient = useQueryClient();
    

    const { mutate: logout } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch('/api/auth/logout', {
                    method: "POST"
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong!")
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
            toast.error("Logout Failed!")
        }
    });

    const handleLogout = (e) => {
        logout();
    };

    useEffect(() => {
        localStorage.removeItem("userPage");
        localStorage.removeItem("userClicks");
        localStorage.removeItem("opponentClicks" );
        localStorage.removeItem("opponentPage");
        localStorage.removeItem("gameStarted");
    })

    useEffect(() => {
        if (!socket) return; 

        socket.emit("clean", authUser._id);

        socket.on("Room_Joined", ({roomId}) => { 
            console.log(roomId);
            navigate(`/game/${roomId}`); 
            toast.success("Room joined successfully");
        });

        socket.on("Room_Full",({roomId})=>{
            toast.error(`Room ${roomId} is either full or does not exist!`);
        })

        return () => {
            socket.off("Room_Joined"); 
            socket.off("Room_Full");
        };
    }, [socket, navigate]); 

    const joinGame = () => {
        socket.emit("joinGame", authUser._id);
    };

    const createRoom=()=>{
        socket.emit("createRoom", authUser._id);
    }

    const joinRoom=()=>{
        socket.emit("joinRoom", {roomId, userId: authUser._id});
    }

    

    return (
        <div className='flex flex-col'>
            <div className='flex'>
                {authUser.email}
            </div>
            <button className='btn btn-primary mt-5 size-md' onClick={joinGame}>Join Game</button>
            <button className='btn btn-primary mt-5 size-md' onClick={()=>document.getElementById('my_modal_5').showModal()}>Play with Friend</button>
            <button className='btn  mt-5 size-md' onClick={handleLogout}>Logout</button>
            {/* Open the modal using document.getElementById('ID').showModal() method */}
        
            <dialog id="my_modal_5" className="modal max-w-lg bg-gray-500 modal-bottom sm:modal-middle">
            <div className="modal-box p-10">
                <h3 className="font-bold flex justify-center text-lg">Play with Friend</h3>
                <p className="py-4">Press ESC key or click the button below to close</p>
                <div className="modal-action">
                <form method="dialog" className='flex flex-col gap-5'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-primary text-white mt-5 size-md' onClick={createRoom} >Create Room</button>
                    <input type="text" placeholder="Enter Room Id" onChange={(e)=>setRoomId(e.target.value)} className="input input-bordered w-full max-w-xs mt-5" />
                    <button className='btn btn-primary text-white size-md' onClick={joinRoom} >Join Room</button>
                    <button className="btn text-white">Close</button>
                </form>
                </div>
            </div>
            </dialog>
        </div>
    )
}

export default HomePage;
