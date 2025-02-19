import {user} from "../models/User.model"
import Apierror from "../utils/Apierror";
import jwt from "jsonwebtoken";
import asynchandler from "../utils/asynchandler";

const generatetokens=async(userid)=>{
  try{
      let userinfo=await user.findById(userid);
      if(!userinfo){
        throw new Apierror(405,"there was a problem will accessing user ");

      }
      const accestoken=await userinfo.generateaccestoken();
      const refreshtoken=await userinfo.generaterefreshtoken();

      return {accestoken,refreshtoken};
  }
  catch(e){
        throw new Apierror(401,"ERROR while generating tokens");
  }
  
}
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

const login=asynchandler(async ()=>{
  let{username,password}=req.body;

  if(!(username && password)){
    throw new Apierror(400,"Please add credentials");
  }
  const logginguser=user.findOne({username});
  if(!logginguser){
    throw new Apierror(400,"User has not registered yet ");
  }

  if(!logginguser.ispasswordcorrect(password)){
    throw new Apierror(400,"Incorrect password ")
  }

  const[accestoken,refreshtoken]=generatetokens(user._id);

  const loggedinuser=user.findOne(logginguser._id).select("-password -refreshtoken");

 const options={
    httpOnly:true,
    secure:'production',
    path:'/'
 }


  return res.status(200)
  .cookie("accesstoken",accestoken,options)
  .cookie("refreshtoken",refreshtoken.options)
  .json(new Apiresponse(200,
    {
        user:loggedinuser,accestoken,refreshtoken
    },"User Logged in Successfully "))


}
) 

const logout=asynchandler(async(req,res)=>{
    
  let userid= req.user._id
 await user.findByIdAndUpdate(userid,{
      $set:{
         refreshtoken:undefined,
       }
      },
      {
        new:true
      }
      )
 
    const options={   
     httpOnly:true,
    secure:true
    }
 
       return res
      .status(200)  
      .clearCookie("accesstoken",options)
      .clearCookie("refreshtoken",options)
      .json(new Apiresponse(200,{},"userlogged out"));
 
 
 })

 const getuserinfo=async(req,res)=>{
  let userinfo=req.user;

  return res.status(200)
  .json(new Apiresponse(200,{userinfo},"The user successfully found "));
 }
 



 const changepassword=asynchandler(async(req,res)=>{

    const{oldpassword,newpassword}=req.body;

    if(!(oldpassword && newpassword)){
      throw new Apierror(400,"please give all credentials");

    }

    let userinfo=await user.findById(req.user?._id);
    if(!userinfo){
      throw new Apierror(400,"Problem occured on finding user");

    }

     if(!(await userinfo.ispasswordcorrect(oldpassword))){
      throw new Apierror(401,"Plese enter correct old password ");
 
     }
     userinfo.password=newpassword;

     await userinfo.save({validateBeforeSave:false});
   
   return res.status(200)
   .json(
    new Apiresponse(200,{},"password changed")
   )

 })

export default {register,login,logout,getuserinfo,changepassword};