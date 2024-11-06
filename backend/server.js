import express from "express";
import http from 'http';
import { Server } from "socket.io";
import cors from "cors"
import ConnectMongoDB from "./db/connectMongoDB.js";
import dotenv from "dotenv";
import authRoutes from './routes/auth.route.js'
import wikiRoutes from './routes/wiki.route.js'
import userRoutes from './routes/user.route.js'
import gameRoutes from './routes/game.route.js'
import cookieParser from "cookie-parser";
import { generateSourceAndTargetPage } from "./utils/generateSourceAndTargetPage.js";
import {v2 as cloudinary} from "cloudinary";
import path from "path";


const __dirname=path.resolve();
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const app = express();
const server = http.createServer(app);
const io=new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET","POST"]
    },
});
app.use(express.json({limit:"5mb"}));
app.use(cookieParser());
app.use('/api/auth',authRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);

app.use(express.static(path.join(__dirname,'/frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
})

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
const rooms={};
const userRoomMap={};
// I am going to improve you tomorro
io.on("connection", (socket) => {
    console.log('A user connected', socket.id)
    const userId=socket.handshake.query.userId;
    
    if(userId!="undefined" ){
        if(userSocketMap[userId]){
            userSocketMap[userId].push(socket.id)
        }else{
            userSocketMap[userId]=[socket.id];
        }
        
    } 
    console.log(userSocketMap);
    if(userId!="undefined" && userRoomMap[userId]){
        
        if(rooms[userRoomMap[userId]] && rooms[userRoomMap[userId]].players.length<2 && !rooms[userRoomMap[userId]].players.includes(userId)){
            rooms[userRoomMap[userId]].players.push(userId);
            socket.join(userRoomMap[userId]);
        }
        // console.log(rooms[userRoomMap[userId]]);
    }

    socket.on("clean",(userId)=>{
        console.log(userId,userRoomMap);
        if(userRoomMap[userId] ){
            console.log("clean")
            // rooms[userRoomMap[userId]].players = rooms[userRoomMap[userId]].players.filter(item => item !== userId);
            
            // console.log(rooms[userRoomMap[userId]]);
            console.log(userRoomMap[userId]);
            socket.to(userRoomMap[userId]).emit("opponentLeft");
            // delete userRoomMap[userId];
            socket.leave(userRoomMap[userId]);
            delete rooms[userRoomMap[userId]];
            delete userRoomMap[userId];
            
        }
    })

    socket.on("joinGame", ({userId, isPrivate}) => {
        let joined=false;
        let isEmpty=true;
        let roomId="";
        console.log("joinGame")
        if(!isPrivate){
            for(const room in rooms){
            if(rooms[room].isEmpty && !rooms[room].isPrivate){
                rooms[room].players.push(userId);
                rooms[room].isEmpty=false;
                isEmpty=false;
                roomId=room
                joined=true
                socket.to(roomId).emit("userJoined",userId);
                break;
            }
        }
        }
        if(!joined){
            roomId = generateRandomDigits(6);
            const {source,target}=generateSourceAndTargetPage();
            console.log(source,target);
            rooms[roomId]={roomId:roomId,players:[userId],isEmpty:true,isPrivate:isPrivate,source:source,target:target};
        }

        
        socket.join(roomId);
        userRoomMap[userId]=roomId;
        console.log(`User ${socket.id}, ${userId} joined room ${roomId}`);
        socket.emit("Room_Joined", { roomId }); // Emit an object
    });

    
    // socket.on("createRoom",(userId)=>{
    //     let roomId = generateRandomDigits(6);
    //     const {source,target}=generateSourceAndTargetPage();
    //     rooms[roomId]={roomId:roomId,players:[userId],isEmpty:true, isPrivate:true, source:source,target:target};
    //     userRoomMap[userId]=roomId;
    //     socket.join(roomId);
    //     console.log(roomId);
    //     socket.emit("Room_Joined", { roomId });
    // })
    //privateRoom 
    socket.on("joinRoom",({roomId,userId})=>{
        let joined=false;
        console.log(roomId);
        for(const room in rooms){
            if(rooms[room].roomId===roomId && rooms[room].isEmpty){
                rooms[room].players.push(userId);
                rooms[room].isEmpty=false;
                roomId=rooms[room].roomId
                joined=true
                userRoomMap[userId]=roomId;
                socket.join(roomId);
                socket.to(roomId).emit("userJoined",userId);
                break;
            }
        }
        if(!joined){
            socket.emit("Room_Full",{roomId});
            return
        }
        
        socket.emit("Room_Joined", { roomId });
        
    });
    
    socket.on("roomLock",(roomId)=>{
        
        console.log("room id for locking is :",roomId);         
        const room=rooms[roomId];
        if(room==undefined) return;
        room.lock=true;
    })
    socket.on("roomDetails",(roomId)=>{
        // console.log("room id is :",roomId);
        const room=rooms[roomId]
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

      socket.on("checkForOpponent", (roomId) => {
        
        console.log(rooms[roomId]);
        if(rooms[roomId]?.players.length===1){
            socket.emit("opponentLeft");
        }
      })
    

    socket.on("disconnect",()=>{
        console.log("user disconnected",socket.id)
        
        userSocketMap[userId]=userSocketMap[userId].filter(user=>user!==socket.id);
        
        if(userRoomMap[userId] && userSocketMap[userId].length===0 && rooms[userRoomMap[userId]]){
            delete userSocketMap[userId];
            rooms[userRoomMap[userId]].players = rooms[userRoomMap[userId]].players.filter(item => item !== userId);
            // console.log(rooms[userRoomMap[userId]]);
            // if(rooms[userRoomMap[userId]].players.length===0){
            //     delete rooms[userRoomMap[userId]];
            // }
            socket.to(userRoomMap[userId]).emit("opponentMightHaveLeft");
            
            socket.leave(userRoomMap[userId]); 
            // delete userRoomMap[userId];
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
