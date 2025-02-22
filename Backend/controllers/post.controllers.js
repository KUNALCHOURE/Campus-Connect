import mongoose from "mongoose";
import { post, post } from "../models/Post.model";
import asynchandler from "../utils/asynchandler";
import Apierror from "../utils/Apierror";

const createpost=asynchandler(async(req,res)=>{
    const{title,content,tags}=req.body;
   
    if(!mongoose.Types.ObjectId.isValid(req.user._id)){
        throw new Apierror(400,"Invalid user ID");
    }

    const createdBy = {
        id: req.user.id,
        username: req.user.username
    };

     const newpost =await post.create({
        title,
        content,
        tags,
        createdBy

     })

     return res.status(200)
     .json(201,newpost,"Post created Successfully");


});

const getpost=asynchandler(async(req,res)=>{
     const posts=await post.find().populate('createdBy.id','username').sort({ createdAt: -1 });

     if(!posts?.lenght){
        throw new Apierror(400,"post not found");
     }
     return res.status(200)
     .json(
         new ApiResponse(
             200,
             posts,
             "Posts fetched successfully"
         )
     );
})
export {createpost,getpost};
