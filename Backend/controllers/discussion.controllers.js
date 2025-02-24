import  {discussion} from '../models/Discussion.model.js';
import Apierror from '../utils/Apierror.js';
import Apiresponse from '../utils/Apiresponse.js';
import asynchandler from '../utils/asynchandler.js';

const creatediscussion=asynchandler(async(req,res)=>{
    const {title,content,tags}=req.body;

    if(!title || !content ||!tags){
        throw new Apierror(400,"Please provide details");

    }

  const createdby={
     id:req.user._id,
     username:req.user.username
   }
    const newdiscussion=await discussion.create({
        title,
        content,
        tags,
        createdby
    })

    if(!newdiscussion){
        throw new Apierror(400,"There was a problem while storing discussion");
    }

    return res.status(200)
    .json(new Apiresponse(200,{newdiscussion},"Discussion Succesfuly added "));

})

const getdiscussion=asynchandler(async(req,res)=>{

    const alldiscussions=await discussion.find().sort({createdAt:-1});
    if(!alldiscussions){
        throw new Apierror(404,"error while finding the dicussions");

    }
   
    return res.status(404)
    .json(new Apiresponse(200,{alldiscussions},"All discussions sended"));

})


const addcomment=asynchandler(async(req,res)=>{
    const {discussionid}=req.params;
    const{text}=req.body;

    const currentdiscussion=await discussion.findById(discussionid);
   
    if(!currentdiscussion){
        throw new Apierror(404," Unable to find the discussion");

    }

    const createdby={
    id:req.user._id,
    username:req.user.username
   }

   const newcomments={
      text,
      createdby
   }
   
   await currentdiscussion.comments.push(newcomments);

   return res.status(200)
   .json(new Apiresponse(200,{},"Comment added successfully"));


})

export {creatediscussion,getdiscussion,addcomment};

