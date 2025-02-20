import { user } from "../models/User.model";
import { Router } from "express";
import {register,login,logout} from '../controllers/user.controllers.js';
import { verifyjwt } from "../middlewares/authmiddleware.js";


const router=Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(verifyjwt,logout);

export default router;
