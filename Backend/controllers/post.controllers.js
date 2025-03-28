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
        id: req.user._id,
        username: req.user.username
    };

     const newpost =await post.create({
        title,
        content,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(tag => tag.trim())) : [],
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

    
});

const unlikepost=asynchandler(async(req,res)=>{
    const {postid}=req.body;
    console.log(postid);

    // Check if the post ID is valid
    if (!mongoose.Types.ObjectId.isValid(postid)) {
        throw new Apierror(400, "Invalid post id");
    }
    const currentPost = await post.findById(postid);
    if (!currentPost) {
        throw new Apierror(404, "Unable to find the post");
    }

    const currentUser = req.user;
    console.log(currentUser);

    if (currentUser.likedPosts.includes(postid)) {
        currentPost.likes -= 1; // Decrement the likes count
        currentUser.likedPosts = currentUser.likedPosts.filter(id => id.toString() !== postid); // Remove post ID from likedPosts
    } else {
        throw new Apierror(400, "User has not liked the post");
    }
    await currentPost.save();
    await currentUser.save();

    return res.status(200).json(new Apiresponse(200, {}, "Post unliked successfully"));
})


const addcomment=asynchandler(async(req,res)=>{
    console.log("hello form  controller");
     const {postId}=req.params;
     console.log(postId)
     const {text}=req.body;
     console.log("hello 2");
     if (!mongoose.Types.ObjectId.isValid(postId)) {
        return new Apierror(400,"Invalid id ");
        }
        console.log("hello");
      const currentpost=await post.findById(postId);
      console.log(currentpost);
      if(!currentpost){
        throw new Apierror(404,"error occured while finding the post");

      }
      console.log(req.user);
      console.log(req.user.username);

  const createdby={

   id:req.user._id,
   username:req.user.username
  }
      const newcomment={
         text,
         createdby,
      };

      await currentpost.comments.push(newcomment);
      await currentpost.save();
      
      return res.status(200)
      .json(new Apiresponse(200,{},"Comment successfully added"));

 
})



const getcomment=asynchandler(async(req,res)=>{
    const {postid}=req.params;

    if (!mongoose.Types.ObjectId.isValid(postid)) {
    return new Apierror(400,"Invalid id ");
    }

     const currentpost=await post.findById(postid);

     if(!currentpost){
       throw new Apierror(404,"error occured while finding the post");

     }
     const result=currentpost.comments;

     return res.status(200)
     .json(new Apiresponse(200,{result},"Comments successfully sended"));


})
const deletepost = asynchandler(async (req, res) => {
    const { postid } = req.body;

    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(postid)) {
        throw new Apierror(400, "Invalid post ID");
    }

    // Find the post
    const currentpost = await post.findById(postid);
    if (!currentpost) {
        throw new Apierror(404, "Post not found");
    }

    // Check if the user is the creator of the post
    const currentuser = req.user;
    if (currentpost.createdBy.id.toString() !== currentuser._id.toString()) {
        throw new Apierror(403, "You are not authorized to delete this post");
    }

    // Delete the post
    await post.findByIdAndDelete(postid);

    return res.status(200).json(new Apiresponse(200, {}, "Post deleted successfully"));
});

export {createpost,getpost,likepost,addcomment,getcomment,unlikepost,deletepost};
