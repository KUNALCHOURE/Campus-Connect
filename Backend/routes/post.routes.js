import { Router } from "express";
import {createpost,getpost,likepost} from '../controllers/post.controllers.js';
import { verifyjwt } from "../middlewares/authmiddleware.js";


const router=Router();

router.route('/create-post').post(verifyjwt,createpost);
router.route('/getpost').get(verifyjwt,getpost);
router.route('/likepost').post(verifyjwt,likepost);


export default router;