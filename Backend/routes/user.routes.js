
import { Router } from "express";
import {register,login,logout, getuserinfo, changepassword} from '../controllers/user.controllers.js';
import { verifyjwt } from "../middlewares/authmiddleware.js";


const router=Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(verifyjwt,logout);
router.route("/getuser").get(verifyjwt,getuserinfo);
router.route("/changepassword").get(verifyjwt,changepassword)
export default router;
