import { Router } from "express";
import { getUserProfile, updateUserProfile } from "../controllers/pofilecontroller.js";
import { verifyjwt as isAuthenticated } from "../middlewares/authmiddleware.js";

const router = Router();

router.get("/:userId", getUserProfile);
router.put("/:userId", isAuthenticated, updateUserProfile);

export default router;