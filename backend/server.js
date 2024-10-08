import express from "express";
import http from 'http';
import { Server } from "socket.io";
import cors from "cors"
import ConnectMongoDB from "./db/connectMongoDB.js";
import dotenv from "dotenv";
import authRoutes from './routes/auth.route.js'
import wikiRoutes from './routes/wiki.route.js'
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io=new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET","POST"]
    },
});
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth',authRoutes);
app.use('/api/wiki', wikiRoutes);

// To keep track of users' current page and clicks
let users = {};

function generateRandomDigits(length = 6) {
    let result = '';
    const digits = '0123456789';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        result += digits[randomIndex];
    }
    
    return result;
}

const userSocketMap={}
const rooms=[];
const userRoomMap={};

io.on("connection", (socket) => {
    console.log('A user connected', socket.id)
    const userId=socket.handshake.query.userId;
    
    if(userId!="undefined") userSocketMap[userId]=socket.id;
    if(userId!="undefined" && userRoomMap[userId]){
        socket.join(userRoomMap[userId]);
    }

    socket.on("clean",(userId)=>{
        
        if(userRoomMap[userId]){
            console.log('here');
            socket.to(userRoomMap[userId]).emit("opponentleft");
            socket.leave(userRoomMap[userId]);
            delete userRoomMap[userId];
        }
    })

    socket.on("joinGame", (userId) => {
        let joined=false;
        let isEmpty=true;
        let roomId="";
        for(const room of rooms){
            if(room.isEmpty && !room.isPrivate){
                room.players.push(userId);
                room.isEmpty=false;
                isEmpty=false;
                roomId=room.roomId
                joined=true
                socket.to(roomId).emit("userJoined",{userId});
                break;
            }
        }
        if(!joined){
            roomId = generateRandomDigits(6);
            rooms.push({roomId:roomId,players:[userId],isEmpty:true,isPrivate:false});
        }

        
        socket.join(roomId);
        userRoomMap[userId]=roomId;
        console.log(`User ${socket.id}, ${userId} joined room ${roomId}`);
        socket.emit("Room_Joined", { roomId, isEmpty }); // Emit an object
    });

    socket.on("roomLock",(roomId)=>{
        
        console.log("room id for locking is :",roomId);         
        const room=rooms.find((room)=>room.roomId===roomId);
        if(room==undefined) return;
        room.lock=true;
    })

    socket.on("createRoom",(userId)=>{
        let roomId = generateRandomDigits(6);
        rooms.push({roomId:roomId,players:[userId],isEmpty:true, isPrivate:true, lock:false});
        socket.join(roomId);
        socket.emit("Room_Joined", { roomId });
    })
    //privateRoom 
    socket.on("joinRoom",({roomId,userId})=>{
        let joined=false;
        for(const room of rooms){
            if(room.roomId===roomId && room.isEmpty){
                room.players.push(userId);
                room.isEmpty=false;
                roomId=room.roomId
                joined=true
                socket.to(roomId).emit("userJoined",{userId});
                break;
            }
        }
        if(!joined){
            socket.emit("Room_Full",{roomId});
            return
        }
        socket.emit("Room_Joined", { roomId });

    });

    socket.on("roomDetails",(roomId)=>{
        // console.log("room id is :",roomId);
        const room=rooms.find((room)=>room.roomId===roomId);
        if(room==undefined) return;
        socket.emit("roomDetails",{room});
    });
    socket.on("navigate_page", (data) => {
        
        const { room, newPage, clicks } = data;
        console.log(room,":" ,newPage);
        socket.to(room).emit("opponent_navigated", { newPage, clicks });
      });
    
      
    socket.on('scroll', (data) => {
          // Broadcast the scroll position to the other player
        const {roomId, scrollPosition}=data;
        
        socket.to(roomId).emit('syncScroll', {scrollPosition});
    });
      
   
    
      socket.on("reached_target", (room) => {
        socket.to(room).emit("opponent_won");
        
      });
    

    socket.on("disconnect",()=>{
        console.log("user disconnected",socket.id)
        
        delete userSocketMap[userId];
        if(userRoomMap[userId]){
            socket.to(userRoomMap[userId]).emit("opponentleft");
            socket.leave(userRoomMap[userId]);
            delete userRoomMap[userId];
        }
    });

    

      
    

    // socket.on("join_game", (room) => {
    //   socket.join(room);
    //   console.log(`User ${socket.id} joined room ${room}`);
    // });
  
    // Listen for page navigation
    
  
    // socket.on("disconnect", () => {
    //   console.log("User disconnected", socket.id);
    // });
  });
  

server.listen(5000, () => {
ConnectMongoDB();
  console.log("Server is running on port 5000");
});
