import Game from "../models/game.model.js";
import User from "../models/user.model.js";


// export const updateCoin=async(req,res)=>{
//     try {
//         // Find the user by ID and exclude the password field
//         const user = await User.findById(req.user._id).select("-password");
//         const {val}=req.body;
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Increment the user's coins by 100
//         user.coins += val;
        
//         // Save the updated user
//         await user.save();

//         // Send updated user details back
//         res.status(200).json({ coins: user.coins });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "An error occurred while adding coins" });
//     }
// }

export const gameJoined=async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const gameData=await Game.findOne({userId:user._id});
        if(!gameData){        
            return res.status(404).json({ message: "Game data not found" });
        }  
        gameData.gamesPlayed+=1;      
        gameData.coins-=100;
        await gameData.save();
        res.status(200).json({ gameData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while adding coins" });
    }
}

export const gameWon=async(req,res)=>{
    try {
        
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const gameData=await Game.findOne({userId:user._id});
        if(!gameData){        
            return res.status(404).json({ message: "Game data not found" });
        }
        gameData.gamesWon+=1; 
        gameData.coins+=200;
        await gameData.save();
        res.status(200).json({ gameData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while adding coins" });
    }
}

export const gameLost=async(req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const gameData=await Game.findOne({userId:user._id});
        if(!gameData){        
            return res.status(404).json({ message: "Game data not found" });
        }
        gameData.gamesLost+=1; 
        await gameData.save();
        res.status(200).json({ gameData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while adding coins" });
    }
}   

export const getGameData=async(req,res)=>{
    try {       
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {        
            return res.status(404).json({ message: "User not found" });
        }
        const gameData=await Game.findOne({userId:user._id});
        if(!gameData){
            return res.status(404).json({ message: "Game data not found" });
        }
        res.status(200).json({ gamesWon: gameData.gamesWon, gamesPlayed: gameData.gamesPlayed, gamesLost: gameData.gamesLost, coins: gameData.coins });
    } catch (error) {
        console.error(error);   
        res.status(500).json({ message: "An error occurred while adding coins" });
    }
}