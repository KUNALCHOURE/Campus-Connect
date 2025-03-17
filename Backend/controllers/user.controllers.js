import {user} from "../models/User.model.js"
import Apierror from "../utils/Apierror.js";
import Apiresponse from "../utils/Apiresponse.js"
import asynchandler from "../utils/asynchandler.js";

const generatetokens=async(userid)=>{
  try{
      
    let userinfo = await user.findById(userid).select("-password -refreshtoken");
 
    if (!userinfo) {
        throw new Apierror(405, "User not found, cannot generate tokens");
    }
      const accestoken=await userinfo.generateAcessToken();
      const refreshtoken=await userinfo.generateRefreshToken();
      console.log(accestoken);
      return {accestoken,refreshtoken};
  }
  catch(e){
        throw new Apierror(401,"ERROR while generating tokens",e);
  }
  
}
const register=async(req,res)=>{

    let{username,email,password}=req.body;

    if (!username || !email || !password) {
      throw new Apierror(400, "please provide all details");
  }
    let existeduser=await user.findOne({
        $or:[{username},{email}]
    })
    
    if(existeduser){
        throw new Apierror(400,"User already registered ")
    }

    const usersave =await user.create({
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

const login=asynchandler(async (req,res)=>{
  let{username,password}=req.body;

  if(!(username && password)){
    throw new Apierror(400,"Please add credentials");
  }
  const logginguser=await user.findOne({username});
  if(!logginguser){
    throw new Apierror(400,"User has not registered yet ");
  }

  if(!(await logginguser.ispasswordcorrect(password))){
    throw new Apierror(400,"Incorrect password ")
  }
 console.log(logginguser._id);
  const {accestoken,refreshtoken}=await generatetokens(logginguser._id);

  const loggedinuser = await user.findById(logginguser._id).select("-password -refreshtoken").lean();

 const options={
    httpOnly:true,
    secure:'production',
    path:'/'
 }


 res.cookie("accessToken", accesstoken, {
  httpOnly: true,
  secure: true,  // ✅ Always true for production
  sameSite: "None",  // ✅ Required for cross-origin requests
  path: "/",
});

res.cookie("refreshToken", refreshtoken, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/",
});


return res.status(200).json(new Apiresponse(200, { user: loggedinuser, accesstoken, refreshtoken }, "User logged in successfully"));


}
) 

const logout=asynchandler(async(req,res)=>{
    
  let userid= req.user._id
  console.log(user._id);
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

export  {register,login,logout,getuserinfo,changepassword};