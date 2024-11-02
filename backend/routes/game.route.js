import express from  'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { gameJoined, gameLost, gameWon, getGameData } from '../controllers/game.controller.js';




const router=express.Router();

// router.post('/update', protectRoute, updateCoin);
router.get('/', protectRoute, getGameData);
router.post('/joined',protectRoute, gameJoined);
router.post('/won',protectRoute,gameWon);
router.post('/lost',protectRoute,gameLost);

export default router;  