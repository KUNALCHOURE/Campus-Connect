import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import coverimage from "../assets/coverimage.jpg";
import { useAuth } from "../utils/autcontext";
import api from "../services/api"; // Import API to fetch additional data if needed

function ProfileCard() {
  const { user } = useAuth();
  const [postCount, setPostCount] = useState(0); // State to store the user's post count

  // Debug user object
  useEffect(() => {
    if (user) {
      console.log("User object in ProfileCard:", user);
      console.log("User ID exists:", user._id !== undefined);
      console.log("User ID value:", user._id);
    } else {
      console.log("User is null or undefined in ProfileCard");
    }
  }, [user]);

  // Fetch the user's post count (optional, if not provided by backend)
  useEffect(() => {
    const fetchPostCount = async () => {
      try {
        const response = await api.get("/post/getpost");
        const posts = response.data.data;
        // Filter posts created by the current user
        const userPosts = posts.filter((post) => post.createdBy.id === user._id);
        console.log(userPosts.length);
        setPostCount(userPosts.length);
      } catch (error) {
        console.error("Error fetching post count:", error);
      }
    };

    if (user && user._id) {
      fetchPostCount();
    }
  }, [user]);

  // Format the join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
  };

  // Use a fallback if user data is not available
  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className="glassmorphism rounded-lg overflow-hidden relative max-w-xs mx-auto shadow-card border border-[rgba(255,255,255,0.08)]"
    >
      {/* Banner Image */}
      <motion.div className="relative h-28">
        <motion.div
          className="absolute inset-0 overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/80 z-10"></div>
          <img
            src={coverimage || "https://miro.medium.com/v2/resize:fit:1400/0*Eww7pEGuh5F3K8fm"}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Profile Image */}
        <motion.div 
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="relative">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              src={
                user.profileimage
                  ? user.profileimage
                  : `https://ui-avatars.com/api/?name=${user.username}&background=random`
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-secondary shadow-lg"
            />
            <motion.div
              className="absolute bottom-0 right-0 bg-accent w-8 h-8 rounded-full flex items-center justify-center border-2 border-secondary"
              whileHover={{ scale: 1.2, rotate: 15 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Profile Details */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-16 px-6 pb-6 text-center"
      >
        <motion.h2 
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-semibold gradient-text"
        >
          {user.username}
        </motion.h2>
        
        <motion.p 
          initial={{ y: -5 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-sm font-medium text-text-muted mt-1"
        >
          @{user.username.toLowerCase()}
        </motion.p>
        
        <motion.div 
          className="mt-4 px-4 py-3 rounded-lg bg-secondary/30 border border-[rgba(255,255,255,0.03)]"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.p className="text-sm text-text-secondary leading-relaxed">
            {user.email}
            <br />
            {formatJoinDate(user.createdAt)}
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-between mt-5 text-center text-sm"
        >
          <motion.div 
            whileHover={{ y: -3, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.15)" }}
            className="flex-1 mx-1 bg-secondary/40 rounded-lg py-3 px-2 border border-[rgba(255,255,255,0.03)]"
          >
            <motion.p 
              whileHover={{ scale: 1.1 }} 
              className="text-lg font-bold text-accent"
            >
              {user.likedPosts.length}
            </motion.p>
            <p className="text-xs font-medium text-text-muted mt-1">Likes</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -3, boxShadow: "0 4px 12px rgba(79, 70, 229, 0.15)" }}
            className="flex-1 mx-1 bg-secondary/40 rounded-lg py-3 px-2 border border-[rgba(255,255,255,0.03)]"
          >
            <motion.p 
              whileHover={{ scale: 1.1 }} 
              className="text-lg font-bold text-accent"
            >
              {postCount}
            </motion.p>
            <p className="text-xs font-medium text-text-muted mt-1">Posts</p>
          </motion.div>
        </motion.div>

        {/* Profile Link */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="block w-full text-center mt-5"
        >
          {user && user._id ? (
            <Link 
              to={`/profile/${user._id}`}
              className="block w-full py-2.5 rounded-lg bg-gradient-primary text-white font-medium text-sm shadow-sm hover:shadow-accent transition-all duration-300"
            >
              View Full Profile
            </Link>
          ) : (
            <Link 
              to="/profile"
              className="block w-full py-2.5 rounded-lg bg-gradient-primary text-white font-medium text-sm shadow-sm hover:shadow-accent transition-all duration-300"
            >
              View Full Profile
            </Link>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ProfileCard;