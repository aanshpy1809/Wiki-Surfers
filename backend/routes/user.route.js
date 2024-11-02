import express from  'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { update } from '../controllers/user.controller.js';





const router=express.Router();

// router.post('/update', protectRoute, updateCoin);
router.post('/update', protectRoute, update);

export default router;  