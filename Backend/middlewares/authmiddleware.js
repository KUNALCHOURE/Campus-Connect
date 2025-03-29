import jwt from "jsonwebtoken";
import Apierror from "../utils/Apierror.js";
import { user } from "../models/User.model.js";
import asynchandler from "../utils/asynchandler.js";

const verifyjwt =asynchandler(async(req,_,next)=>{
try{
    const token=req.cookies?.accesstoken ||req.header("Authorization")?.replace("Bearer ","");
console.log(token);
    if(!token){
        throw new Apierror(401,"Token is missing");

    }
    
    const decodeduser= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    if(!decodeduser){
        throw new Apierror(401,"Unauthorised access");

    }
    // console.log("decoded id",decodeduser._id);
    
    const userdata=await user.findById(decodeduser?._id).select("-password -refreshtoken");


     if(!userdata){
        throw new Apierror(404,"SOMETHING WENT WRONG ");
     }
    req.user=userdata;
    next();

    }
    catch(e){
        if (e instanceof jwt.TokenExpiredError) {
            throw new Apierror(401, "Token has expired");
        } else if (e instanceof jwt.JsonWebTokenError) {
            throw new Apierror(401, "Invalid token");
        }
        
        throw new Apierror(500, e?.message || "Internal Server Error");
    }


}
)

export {verifyjwt};