import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/api";
import { useAuth } from "../utils/autcontext";
import Loading from "../components/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaGithub, FaLinkedin, FaPen, FaSave, FaTimes, FaGraduationCap, 
  FaCode, FaLink, FaGlobe, FaTrophy, FaCertificate, FaUniversity 
} from "react-icons/fa";
import { SiCodeforces, SiCodechef, SiLeetcode, SiHackerrank } from "react-icons/si";

const ProfilePage = () => {
  // Get userId from URL params (if available)
  const { userId: urlUserId } = useParams();
  // Get current user from auth context
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    bio: "",
    education: {
      college: "",
      degree: "",
      branch: "",
      year: "",
      cgpa: ""
    },
    competitiveLinks: {
      codeforces: "",
      codechef: "",
      leetcode: "",
      hackerrank: ""
    },
    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: ""
    },
    certifications: []
  });

  useEffect(() => {
    setIsLoading(true);
    setError("");
    
    // If we're on the /profile route (no userId in URL) and user is logged in
    if (!urlUserId) {
      // Check if user is logged in
      if (!currentUser) {
        setError("Please log in to view your profile");
        setIsLoading(false);
        return;
      }
      
      // User is logged in but no userId in URL - show current user's profile
      console.log("No userId in URL, showing current user's profile");
      setIsCurrentUser(true);
      setProfile(currentUser);
      initializeFormData(currentUser);
      setIsLoading(false);
    } else {
      // URL has a userId - check if it's the current user
      const isViewingOwnProfile = currentUser && urlUserId === currentUser._id;
      setIsCurrentUser(isViewingOwnProfile);
      
      if (isViewingOwnProfile) {
        // Viewing own profile with URL param
        console.log("Viewing own profile with URL parameter");
        setProfile(currentUser);
        initializeFormData(currentUser);
        setIsLoading(false);
      } else {
        // Viewing someone else's profile
        fetchUserProfile(urlUserId);
      }
    }
  }, [urlUserId, currentUser]);

  const fetchUserProfile = async (userId) => {
    try {
      console.log("Fetching profile for user:", userId);
      const response = await getUserProfile(userId);
      
      if (response && response.data && response.data.data) {
        setProfile(response.data.data);
        initializeFormData(response.data.data);
      } else {
        setError("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response && error.response.status === 404) {
        setError("User not found");
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFormData = (userData) => {
    if (!userData) return;
    
    setFormData({
      bio: userData.bio || "",
      education: {
        college: userData.education?.college || "",
        degree: userData.education?.degree || "",
        branch: userData.education?.branch || "",
        year: userData.education?.year || "",
        cgpa: userData.education?.cgpa || ""
      },
      competitiveLinks: {
        codeforces: userData.competitiveLinks?.codeforces || "",
        codechef: userData.competitiveLinks?.codechef || "",
        leetcode: userData.competitiveLinks?.leetcode || "",
        hackerrank: userData.competitiveLinks?.hackerrank || ""
      },
      socialLinks: {
        github: userData.socialLinks?.github || "",
        linkedin: userData.socialLinks?.linkedin || "",
        portfolio: userData.socialLinks?.portfolio || ""
      },
      certifications: userData.certifications || []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get the userId to update - use currentUser._id if available
    const userIdToUpdate = currentUser?._id;
    
    if (!userIdToUpdate) {
      setError("You must be logged in to update your profile");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Updating profile for user:", userIdToUpdate);
      const response = await updateUserProfile(userIdToUpdate, formData);
      
      if (response && response.data && response.data.data) {
        setProfile(response.data.data);
        setIsEditing(false);
      } else {
        setError("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
        when: "beforeChildren"
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white bg-secondary p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/home')} 
            className="mt-4 px-4 py-2 bg-accent rounded-lg hover:bg-accent-dark transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white bg-secondary p-8 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <p>We couldn't find the profile you're looking for.</p>
          <button 
            onClick={() => navigate('/home')} 
            className="mt-4 px-4 py-2 bg-accent rounded-lg hover:bg-accent-dark transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto p-4 py-8 min-h-screen font-['Inter']"
    >
      <motion.div 
        className="bg-card/30 backdrop-blur-xl rounded-2xl shadow-lg border border-white/10 overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Enhanced Profile Header with Blob Background */}
        <div className="relative h-72 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600">
            <motion.div
              className="absolute inset-0"
              initial={{ backgroundPosition: "0% 50%" }}
              animate={{ backgroundPosition: "100% 50%" }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)",
                backgroundSize: "100% 100%",
              }}
            />
            {/* Blob SVG Background */}
            <div className="absolute inset-0 opacity-30">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="rgba(255, 255, 255, 0.3)" d="M45.7,-58.9C59.3,-51.4,70.3,-37.7,75.9,-21.3C81.5,-4.9,81.7,14.3,74.5,30.5C67.3,46.7,52.7,60,36.1,67.1C19.5,74.2,0.9,75.2,-17.7,71.5C-36.3,67.8,-54.9,59.4,-67.4,44.9C-79.9,30.4,-86.3,9.7,-83.2,-8.8C-80.1,-27.3,-67.4,-43.7,-52.1,-51.5C-36.8,-59.4,-18.4,-58.7,-0.6,-58C17.3,-57.2,32.1,-66.3,45.7,-58.9Z" transform="translate(100 100)" />
              </svg>
            </div>
          </div>
          
          {/* Enhanced Profile Picture with Glassmorphism */}
          <motion.div 
            className="absolute bottom-0 transform translate-y-1/2 left-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div 
                className="relative w-40 h-40 rounded-full bg-card/30 backdrop-blur-xl p-1 border border-white/20 shadow-xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img
                  src={profile?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'User')}&background=random&size=160`}
                  alt={profile?.username || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
          
          {/* Enhanced Edit Button */}
          {isCurrentUser && (
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 px-6 py-2.5 rounded-full flex items-center space-x-2 border border-white/20 shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEditing ? (
                <>
                  <FaTimes className="text-red-400 mr-2" />
                  <span className="font-medium">Cancel</span>
                </>
              ) : (
                <>
                  <FaPen className="text-indigo-300 mr-2" />
                  <span className="font-medium">Edit Profile</span>
                </>
              )}
            </motion.button>
          )}
        </div>
        
        {/* Enhanced Content Section */}
        <div className="pt-24 px-8 pb-8 bg-gradient-to-b from-transparent to-card/50">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-text-primary bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {profile?.username || "User"}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-lg text-text-secondary/80">{profile?.education?.branch || ''}</p>
              {profile?.education?.branch && profile?.education?.year && (
                <span className="text-text-muted">•</span>
              )}
              <p className="text-lg text-text-secondary/80">{profile?.education?.year || ''}</p>
            </div>
            <p className="text-text-secondary/90 mt-4 leading-relaxed text-lg">{profile?.bio || "No bio available"}</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div 
                key="profile-view"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Enhanced Competitive Programming Section */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 mr-4 shadow-lg">
                      <FaTrophy className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-text-primary">Competitive Programming</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Codeforces */}
                    <motion.a
                      href={profile?.competitiveLinks?.codeforces}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.03, y: -2 }}
                    >
                      <SiCodeforces className="text-2xl text-[#1F8ACB] mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <div>
                        <h4 className="font-medium text-text-primary">Codeforces</h4>
                        
                      </div>
                    </motion.a>

                    {/* CodeChef */}
                    <motion.a
                      href={profile?.competitiveLinks?.codechef}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.03, y: -2 }}
                    >
                      <SiCodechef className="text-2xl text-[#5B4638] mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <div>
                        <h4 className="font-medium text-text-primary">CodeChef</h4>
                       
                      </div>
                    </motion.a>

                    {/* LeetCode */}
                    <motion.a
                      href={profile?.competitiveLinks?.leetcode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.03, y: -2 }}
                    >
                      <SiLeetcode className="text-2xl text-[#FFA116] mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <div>
                        <h4 className="font-medium text-text-primary">LeetCode</h4>
                        
                      </div>
                    </motion.a>

                    {/* HackerRank */}
                    <motion.a
                      href={profile?.competitiveLinks?.hackerrank}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.03, y: -2 }}
                    >
                      <SiHackerrank className="text-2xl text-[#00EA64] mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <div>
                        <h4 className="font-medium text-text-primary">HackerRank</h4>
                      
                      </div>
                    </motion.a>
                  </div>
                </motion.div>

                {/* Enhanced Education Section */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mr-4 shadow-lg">
                      <FaUniversity className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-text-primary">Education</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-text-primary mb-1">College</h4>
                        <p className="text-text-secondary/90">{profile?.education?.college || "Not specified"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-1">Degree</h4>
                        <p className="text-text-secondary/90">{profile?.education?.degree || "Not specified"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-1">Branch</h4>
                        <p className="text-text-secondary/90">{profile?.education?.branch || "Not specified"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary mb-1">Current Year</h4>
                        <p className="text-text-secondary/90">{profile?.education?.year || "Not specified"}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary mb-1">CGPA / Percentage</h4>
                      <p className="text-text-secondary/90">{profile?.education?.cgpa || "Not specified"}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Certifications Section */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 mr-4 shadow-lg">
                      <FaCertificate className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-text-primary">Certifications</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile?.certifications?.map((cert, index) => (
                      <motion.div
                        key={index}
                        className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:shadow-lg"
                        whileHover={{ scale: 1.03 }}
                      >
                        <h4 className="font-medium text-text-primary">{cert.name}</h4>
                        <p className="text-sm text-text-secondary/80 mt-1">{cert.platform}</p>
                        <p className="text-xs text-text-muted mt-1">{cert.completionDate}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Enhanced Social Links Section */}
                <motion.div 
                  variants={itemVariants}
                  className="bg-gradient-to-br from-gray-500/10 to-slate-500/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-gray-500 to-slate-600 mr-4 shadow-lg">
                      <FaLink className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-text-primary">Social & Professional Links</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {profile?.socialLinks?.github && (
                      <motion.a 
                        href={profile.socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, y: -2, rotate: 3 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-3 bg-[#24292e] hover:bg-[#24292e]/90 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
                      >
                        <FaGithub className="text-xl" />
                        <span className="font-medium">GitHub</span>
                      </motion.a>
                    )}
                    
                    {profile?.socialLinks?.linkedin && (
                      <motion.a 
                        href={profile.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, y: -2, rotate: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-3 bg-[#0077b5] hover:bg-[#0077b5]/90 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
                      >
                        <FaLinkedin className="text-xl" />
                        <span className="font-medium">LinkedIn</span>
                      </motion.a>
                    )}

                    {profile?.socialLinks?.portfolio && (
                      <motion.a 
                        href={profile.socialLinks.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, y: -2, rotate: 3 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
                      >
                        <FaGlobe className="text-xl" />
                        <span className="font-medium">Portfolio</span>
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.form 
                key="profile-edit"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Bio */}
                <div className="space-y-4">
                  <motion.div whileHover={{ y: -2 }} className="form-group">
                    <label className="block text-text-primary mb-2 font-medium">Bio</label>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      rows="4"
                    />
                  </motion.div>
                </div>

                {/* Education Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-text-primary">Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">College</label>
                      <input
                        type="text"
                        name="education.college"
                        value={formData.education.college}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">Degree</label>
                      <input
                        type="text"
                        name="education.degree"
                        value={formData.education.degree}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">Branch</label>
                      <input
                        type="text"
                        name="education.branch"
                        value={formData.education.branch}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">Year</label>
                      <input
                        type="text"
                        name="education.year"
                        value={formData.education.year}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">CGPA</label>
                      <input
                        type="text"
                        name="education.cgpa"
                        value={formData.education.cgpa}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Competitive Programming Links */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-text-primary">Competitive Programming Profiles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">Codeforces</label>
                      <input
                        type="text"
                        name="competitiveLinks.codeforces"
                        value={formData.competitiveLinks.codeforces}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">CodeChef</label>
                      <input
                        type="text"
                        name="competitiveLinks.codechef"
                        value={formData.competitiveLinks.codechef}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">LeetCode</label>
                      <input
                        type="text"
                        name="competitiveLinks.leetcode"
                        value={formData.competitiveLinks.leetcode}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">HackerRank</label>
                      <input
                        type="text"
                        name="competitiveLinks.hackerrank"
                        value={formData.competitiveLinks.hackerrank}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-text-primary">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">GitHub</label>
                      <input
                        type="text"
                        name="socialLinks.github"
                        value={formData.socialLinks.github}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">LinkedIn</label>
                      <input
                        type="text"
                        name="socialLinks.linkedin"
                        value={formData.socialLinks.linkedin}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                    <motion.div whileHover={{ y: -2 }} className="form-group">
                      <label className="block text-text-primary mb-2">Portfolio</label>
                      <input
                        type="text"
                        name="socialLinks.portfolio"
                        value={formData.socialLinks.portfolio}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 backdrop-blur-md p-3 rounded-xl border border-white/10 text-text-primary"
                      />
                    </motion.div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-indigo-500/30 transition-all duration-300 w-full md:w-auto"
                >
                  <FaSave />
                  <span>Save Changes</span>
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;