import {user} from "../models/User.model"
import Apierror from "../utils/Apierror";

const register=async(req,res)=>{

    let{username,email,password}=req.body;

    if(!(username && email && password )){
        throw new Apierror(400,"please provide all details");
    }
     
    let existeduser=await user.findOne({
        $or:[{username},[email]]
    })
    
    if(existeduser){
        throw new Apierror(400,"User already registered ")
    }

    const usersave =user.create({
        username,
        email,
        password
    })

    const createduser=await user.findOne(usersave._id).select("-password -profileimage");

if(!createduser){
    throw new Apierror(400,"Error occured while registering user");
}
return res.status(200).json(new Apiresponse(200,"User Registered Succesfully"));

}

export default {register};