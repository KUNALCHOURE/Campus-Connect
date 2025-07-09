import { sanitizeFilter } from "mongoose";
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
const register=asynchandler(async(req,res)=>{
console.log("inside backeend register ")
  let { username, email, password, preferences, education, bio } = req.body;

    if (!username || !email || !password) {
      throw new Apierror(400, "please provide all details");
  }
  let existeduser = await user.findOne({
    $or: [{ username: username }, { email: email }]
});

    
    if(existeduser){
        throw new Apierror(400,"User already registered ")
    }

    const usersave = await user.create({
        username,
        email,
        password,
        preferences: preferences || [],
        education: education || {
          college: "",
          degree: "",
          branch: "",
          year: "",
          cgpa: ""
        },
        bio: bio || ""
    });

    const createduser = await user.findById(usersave._id).select("-password -profileimage");

if(!createduser){
    throw new Apierror(400,"Error occured while registering user");
}

console.log("Generating tokens...");
    
  // Generate tokens with role included
  const { accestoken,refreshtoken } = await generatetokens(usersave._id);

  // Set tokens in HTTP-only cookies
 console.log(accestoken);

  console.log("Register complete - sending response");
    
  const options = {
    httpOnly: true,
    secure: true,  // ✅ Always true for production
    sameSite: "None",  // ✅ Required for cross-origin requests
    path: "/",
  };
  
  res.cookie("accesstoken", accestoken, options);
  res.cookie("refreshtoken", refreshtoken, options);
  
  return res.status(201).json(new Apiresponse(
    200,
    {
      user: {
        ...createduser.toObject(),
        role: createduser.role,  // Explicitly include role in response
      },
      accestoken,
      refreshtoken,
    },
    "User registered successfully"
  ));
  
}
);
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


 res.cookie("accesstoken", accestoken, {
  httpOnly: true,
  secure: true,  // ✅ Always true for production
  sameSite: "None",  // ✅ Required for cross-origin requests
  path: "/",
});

res.cookie("refreshtoken", refreshtoken, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/",
});


return res.status(200).json(new Apiresponse(200, { user: loggedinuser, accestoken, refreshtoken }, "User logged in successfully"));


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
     httpOnly: true,
     secure: true,
     sameSite: "None",
     path: "/"
    }
 
       return res
      .status(200)  
      .clearCookie("accesstoken", options)
      .clearCookie("refreshtoken", options)
      .json(new Apiresponse(200,{},"user logged out successfully"));
 
})

 const getuserinfo=async(req,res)=>{
  let userinfo=req.user;

  return res.status(200)
  .json(new Apiresponse(200,{userinfo},"The user successfully found "));
 }
 

 const getcurrectuser=asynchandler(async(req,res)=>{
    let userobject=req.user;
        // select method dont work on js object 
        // they only work on mongoose query
      return res.status(200)
      .json(
        new Apiresponse(200,
        { userobject}
        ,"The user is succesfully found ")
    
      )
    
       
    })
    

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

 const profilesearch = asynchandler(async (req, res) => {
  const search = req.query.search;
  if (!search) {
    return res.status(400).json(new Apierror(400, "The search query is needed"));
  }

  
    console.log(search)
    const users = await user.find({
      $or: [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ],
    }).select("_id username name profileimage");
    console.log(users);
    return res.json(new Apiresponse(200,{users}, "User search completed"));
  
});


export  {register,login,logout,getuserinfo,changepassword,getcurrectuser,profilesearch};
