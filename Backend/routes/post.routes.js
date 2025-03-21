import { Router } from "express";
import {createpost,getpost,likepost,addcomment,getcomment} from '../controllers/post.controllers.js';
import { verifyjwt } from "../middlewares/authmiddleware.js";


const router=Router();

router.route('/create-post').post(verifyjwt,createpost);
router.route('/getpost').get(verifyjwt,getpost);
router.route('/likepost').post(verifyjwt,likepost);
router.route('/:postid/addcomment').post(verifyjwt,addcomment);
router.route('/:postid/getcomment').get(verifyjwt,getcomment);



export default router;