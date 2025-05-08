import express from 'express';
const router=express.Router();
import  {createResource,getResources} from '../controllers/Resource.controllers.js';
import { verifyjwt } from "../middlewares/authmiddleware.js";
router.get('/',getResources);

router.post('/upload',verifyjwt,createResource);

export default router;