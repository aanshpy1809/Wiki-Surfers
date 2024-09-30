import express from  'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { fetchWikiPage } from '../controllers/wikipage.controller.js';


const router=express.Router();

router.post('/', protectRoute, fetchWikiPage);

export default router;