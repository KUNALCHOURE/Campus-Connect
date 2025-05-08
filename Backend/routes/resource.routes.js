import express from 'express';
const router=express.Router();
import  {createResource,getResource} from '../controllers/Resource.controllers';
import { verifyjwt } from "../middlewares/authmiddleware.js";
router.get('/',getResource);

router.post('/upload',verifyjwt,createResource);

export default router;