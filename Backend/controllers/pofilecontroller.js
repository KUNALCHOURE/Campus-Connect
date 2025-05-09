// Backend/controllers/profile.controllers.js
import { user as User } from "../models/User.model.js";
import asynchandler from "../utils/asynchandler.js";
import Apierror from "../utils/Apierror.js";
import Apiresponse from "../utils/Apiresponse.js";

const getUserProfile = asynchandler(async (req, res) => {
  const { userId } = req.params;
  
  // Validate userId before querying the database
  if (!userId || userId === 'undefined') {
    throw new Apierror(400, "Invalid user ID provided");
  }

  try {
    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      throw new Apierror(404, "User not found");
    }
    
    return res.status(200).json(
      new Apiresponse(200, user, "User profile fetched successfully")
    );
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Apierror(400, "Invalid user ID format");
    }
    throw error;
  }
});

const updateUserProfile = asynchandler(async (req, res) => {
  const { userId } = req.params;
  
  // Validate userId before querying the database
  if (!userId || userId === 'undefined') {
    throw new Apierror(400, "Invalid user ID provided");
  }
  
  const { 
    bio, 
    education, 
    competitiveLinks, 
    socialLinks, 
    certifications 
  } = req.body;
  
  try {
    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new Apierror(404, "User not found");
    }
    
    // If authentication is required, uncomment this
    // if (req.user && req.user._id.toString() !== userId) {
    //   throw new Apierror(403, "You can only update your own profile");
    // }
    
    // Prepare update object with only provided fields
    const updateFields = {};
    
    if (bio !== undefined) updateFields.bio = bio;
    
    if (education) {
      updateFields.education = {};
      if (education.college !== undefined) updateFields.education.college = education.college;
      if (education.degree !== undefined) updateFields.education.degree = education.degree;
      if (education.branch !== undefined) updateFields.education.branch = education.branch;
      if (education.year !== undefined) updateFields.education.year = education.year;
      if (education.cgpa !== undefined) updateFields.education.cgpa = education.cgpa;
    }
    
    if (competitiveLinks) {
      updateFields.competitiveLinks = {};
      if (competitiveLinks.codeforces !== undefined) updateFields.competitiveLinks.codeforces = competitiveLinks.codeforces;
      if (competitiveLinks.codechef !== undefined) updateFields.competitiveLinks.codechef = competitiveLinks.codechef;
      if (competitiveLinks.leetcode !== undefined) updateFields.competitiveLinks.leetcode = competitiveLinks.leetcode;
      if (competitiveLinks.hackerrank !== undefined) updateFields.competitiveLinks.hackerrank = competitiveLinks.hackerrank;
    }
    
    if (socialLinks) {
      updateFields.socialLinks = {};
      if (socialLinks.github !== undefined) updateFields.socialLinks.github = socialLinks.github;
      if (socialLinks.linkedin !== undefined) updateFields.socialLinks.linkedin = socialLinks.linkedin;
      if (socialLinks.portfolio !== undefined) updateFields.socialLinks.portfolio = socialLinks.portfolio;
    }
    
    if (certifications !== undefined) {
      updateFields.certifications = certifications;
    }
    
    console.log("Updating user profile with fields:", updateFields);
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      throw new Apierror(500, "Failed to update profile");
    }
    
    return res.status(200).json(
      new Apiresponse(200, updatedUser, "Profile updated successfully")
    );
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Apierror(400, "Invalid user ID format");
    }
    throw error;
  }
});

export { getUserProfile, updateUserProfile };