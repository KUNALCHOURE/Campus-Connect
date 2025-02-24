import mongoose from "mongoose";
import {post} from "../models/Post.model.js";
import asynchandler from "../utils/asynchandler.js";
import Apierror from "../utils/Apierror.js";
import Apiresponse from "../utils/Apiresponse.js";

const createpost=asynchandler(async(req,res)=>{
    const{title,content,tags}=req.body;
   console.log(req.user);
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
     .json(new Apiresponse(201,newpost,"Post created Successfully"));


});

const getpost=asynchandler(async(req,res)=>{
     const posts=await post.find().populate('createdBy.id','username').sort({ createdAt: -1 });

     if (!posts || posts.length === 0) {
        throw new Apierror(400, "No posts found");
    }
     return res.status(200)
     .json(
         new Apiresponse(
             200,
             posts,
             "Posts fetched successfully"
         )
     );
})

const likepost=asynchandler(async(req,res)=>{
    const {postid}=req.body;
console.log(postid);
    if(!mongoose.Types.ObjectId.isValid(postid)){
        throw new Apierror(400,"Invalid post id ");

    }
    
    const currentpost=await post.findById(postid);
    if(!currentpost){
        throw new Apierror(404,"Unable to fing the post");
    }
     const currentuser=req.user;
     console.log(currentuser);
    if(!currentuser.likedPosts.includes(postid)){
        currentpost.likes+=1;
        currentuser.likedPosts.push(postid);

    }
    else{
        throw new Apierror(400,"user already liked the post ");
    }
    await currentpost.save();
    await currentuser.save();

    return res.status(200)
    .json(new Apiresponse(200,{},"Post liked successfully"))

    
})


const addcomment=asynchandler(async(req,res)=>{
     const {postid}=req.params;
     const {text}=req.body;
     if (!mongoose.Types.ObjectId.isValid(postid)) {
        return new Apierror(400,"Invalid id ");
        }
      const currentpost=await post.findById({postid});

      if(!currentpost){
        throw new Apierror(404,"error occured while finding the post");

      }
  const createdby={
   id:req.user._id,
   username:req.user.username
  }
      const newcomment={
         text,
         createdby,
      };

      post.comments.push(newcomment);
      await post.save();
      
      return res.status(200)
      .json(200,{},"Comment successfully added");

 
})



const getcomment=asynchandler(async(req,res)=>{
    const {postid}=req.params;

    if (!mongoose.Types.ObjectId.isValid(postid)) {
    return new Apierror(400,"Invalid id ");
    }

     const currentpost=await post.findById({postid});

     if(!currentpost){
       throw new Apierror(404,"error occured while finding the post");

     }
     const result=currentpost.comments;

     return res.status(200)
     .json(200,{result},"Comment successfully added");


})


export {createpost,getpost,likepost,addcomment,getcomment};
