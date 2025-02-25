import { Router } from "express";
import {creatediscussion,getdiscussion,addcomment} from '../controllers/discussion.controllers.js'
import { verifyjwt } from "../middlewares/authmiddleware.js";

const router=Router();

router.route('/getdiscussion').get(verifyjwt,getdiscussion);
router.route('/creatediscussion').post(verifyjwt,creatediscussion);
router.route('/:discussionid/addcomment').post(verifyjwt,addcomment);

export default router;
