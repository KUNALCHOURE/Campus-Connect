import mongoose from "mongoose";
import { post, post, post } from "../models/Post.model";
import asynchandler from "../utils/asynchandler";
import Apierror from "../utils/Apierror";
import { user } from "../models/User.model";
import Apiresponse from "../utils/Apiresponse";

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

const likepost=asynchandler(async(req,res)=>{
    const postid=req.body;

    if(!mongoose.Types.ObjectId.isValid(postid)){
        throw new Apierror(400,"Invalid post id ");

    }
    
    const currentpost=await post.findById(postid);
    if(!currentpost){
        throw new Apierror(404,"Unable to fing the post");
    }
     const currentuser=req.user;
    if(!currentuser.likepost.includes(postid)){
        currentpost.likes+=1;
        currentuser.likepost.push(postid);

    }
    else{
        throw new Apierror(400,"user already liked the post ");
    }
    await currentpost.save();
    await currentuser.save();

    return res.status(200)
    .json(new Apiresponse(200,{},"Post liked successfully"))

    
})

export {createpost,getpost,likepost};
