import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
	{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        gamesPlayed: {
            type: Number,
            default: 0  
        },
        gamesWon: {
            type: Number,
            default: 0  
        },
        gamesLost: {
            type: Number,
            default: 0
        },
        coins: {
            type: Number,
            default: 1000
        }
	},
	{ timestamps: true }
);

const Game = mongoose.model("Game", gameSchema);

export default Game;