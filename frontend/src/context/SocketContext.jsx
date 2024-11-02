import {  createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";

const SocketContext=createContext();

export const useSocketContext=()=>{
    return useContext(SocketContext);
};

export const SocketContextProvider=({children})=>{
    const [socket, setSocket]=useState(null);
    const {data: authUser}=useQuery({queryKey: ["authUser"]});

    useEffect(() => {
        if (authUser ) {
            

            const socket = io("http://localhost:5000", {
                query: {
                    userId: authUser._id,
                }
            });
            setSocket(socket);

            return () => {
                socket.close();
                setSocket(null); // Optionally reset the socket on unmount
            };
        }
    }, [authUser]); 

    return (
        <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>
    )
}