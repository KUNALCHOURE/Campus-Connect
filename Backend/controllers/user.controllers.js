// import { user } from "../models/User.model.js";
// import Apierror from "../utils/Apierror.js";
// import Apiresponse from "../utils/Apiresponse.js";
// import asynchandler from "../utils/asynchandler.js";

// const generateTokens = async (userid) => {
//   try {
//     let userinfo = await user.findById(userid).select("-password -refreshtoken");

//     if (!userinfo) {
//       throw new Apierror(405, "User not found, cannot generate tokens");
//     }

//     // ✅ Fixed spelling mistake
//     const accesstoken = await userinfo.generateAcessToken();
//     const refreshtoken = await userinfo.generateRefreshToken();

//     console.log("Access Token Generated:", accesstoken);
//     return { accesstoken, refreshtoken };
//   } catch (e) {
//     console.error("Error while generating tokens:", e);
//     throw new Apierror(401, "ERROR while generating tokens");
//   }
// };

// const register = asynchandler(async (req, res) => {
//   console.log("Inside backend register");
//   let { username, email, password, preferences } = req.body;

//   if (!username || !email || !password) {
//     throw new Apierror(400, "Please provide all details");
//   }

//   let existedUser = await user.findOne({
//     $or: [{ username: username }, { email: email }],
//   });

//   if (existedUser) {
//     throw new Apierror(400, "User already registered");
//   }

//   const usersave = await user.create({
//     username,
//     email,
//     password,
//     preferences: preferences || [],
//   });

//   const createdUser = await user.findById(usersave._id).select("-password -profileimage");

//   if (!createdUser) {
//     throw new Apierror(400, "Error occurred while registering user");
//   }

//   console.log("Generating tokens...");
//   const { accesstoken, refreshtoken } = await generateTokens(usersave._id);

//   const options = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production", // ✅ Secure only in production
//     sameSite: "None",
//     path: "/",
//   };

//   console.log("Register complete - sending response");

//   return res
//     .status(201)
//     .cookie("accesstoken", accesstoken, options)
//     .cookie("refreshtoken", refreshtoken, options)
//     .json(
//       new Apiresponse(
//         200,
//         {
//           user: {
//             ...createdUser.toObject(),
//             role: createdUser.role,
//           },
//           accesstoken,
//           refreshtoken,
//         },
//         "User registered successfully"
//       )
//     );
// });

// const login = asynchandler(async (req, res) => {
//   let { username, password } = req.body;

//   if (!(username && password)) {
//     throw new Apierror(400, "Please add credentials");
//   }

//   const loggingUser = await user.findOne({ username });

//   if (!loggingUser) {
//     throw new Apierror(400, "User has not registered yet");
//   }

//   if (!(await loggingUser.ispasswordcorrect(password))) {
//     throw new Apierror(400, "Incorrect password");
//   }

//   console.log("User ID:", loggingUser._id);

//   const { accesstoken, refreshtoken } = await generateTokens(loggingUser._id);

//   const loggedInUser = await user.findById(loggingUser._id).select("-password -refreshtoken");

//   const options = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "None",
//     path: "/",
//   };

//   res.cookie("accesstoken", accesstoken, {
//     httpOnly: true,
//     secure: true,  // ✅ Always true for production
//     sameSite: "None",  // ✅ Required for cross-origin requests
//     path: "/",
//   });

//   res.cookie("refreshtoken", refreshtoken, {
//     httpOnly: true,
//     secure: true,
//     sameSite: "None",
//     path: "/",
//   });


//   return res
//     .status(200)
//     .json(new Apiresponse(200, { user: loggedInUser, accesstoken, refreshtoken }, "User logged in successfully"));
// });

// const logout = asynchandler(async (req, res) => {
//   let userid = req.user?._id;
//   console.log("Logging out user ID:", userid);

//   if (!userid) {
//     return res.status(401).json(new Apiresponse(401, {}, "User not authenticated"));
//   }

//   // Clear the refresh token in the database
//   await user.findByIdAndUpdate(userid, { $set: { refreshtoken: undefined } }, { new: true });

//   // Options for clearing cookies
//   const options = {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production", // Ensure this matches your environment
//     sameSite: "None", // Required for cross-origin requests
//     path: "/", // Ensure this matches the path used when setting the cookies
//   };

//   // Clear the cookies

//   return res
//     .status(200)
//     .clearCookie("accesstoken", options)
//     .clearCookie("refreshtoken", options)
//     .json(new Apiresponse(200, {}, "User logged out successfully"));
// });

// const getuserinfo = async (req, res) => {
//   let userinfo = req.user;

//   return res.status(200).json(new Apiresponse(200, { userinfo }, "User successfully found"));
// };

// const changepassword = asynchandler(async (req, res) => {
//   const { oldpassword, newpassword } = req.body;

//   if (!(oldpassword && newpassword)) {
//     throw new Apierror(400, "Please provide all credentials");
//   }

//   let userinfo = await user.findById(req.user?._id);
//   if (!userinfo) {
//     throw new Apierror(400, "Problem occurred while finding user");
//   }

//   if (!(await userinfo.ispasswordcorrect(oldpassword))) {
//     throw new Apierror(401, "Please enter correct old password");
//   }

//   userinfo.password = newpassword;
//   await userinfo.save({ validateBeforeSave: false });

//   return res.status(200).json(new Apiresponse(200, {}, "Password changed successfully"));
// });

// const getcurrectuser=asynchandler(async(req,res)=>{
//   let userobject=req.user;
//       // select method dont work on js object 
//       // they only work on mongoose query
//     return res.status(200)
//     .json(
//       new Apiresponse(200,
//       { userobject}
//       ,"The user is succesfully found ")
  
//     )
  
     
//   })
  
// export { register, login, logout, getuserinfo, changepassword ,getcurrectuser};


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

export  {register,login,logout,getuserinfo,changepassword,getcurrectuser};
