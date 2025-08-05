import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/autcontext";
import api from "../services/api";

function ProfileCard() {
  const { user } = useAuth();
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    if (user) {
      console.log("User object in ProfileCard:", user);
      console.log("User ID exists:", user._id !== undefined);
      console.log("User ID value:", user._id);
    } else {
      console.log("User is null or undefined in ProfileCard");
    }
  }, [user]);

  useEffect(() => {
    const fetchPostCount = async () => {
      try {
        const response = await api.get("/post/getpost");
        const posts = response.data.data;
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

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="glassmorphism rounded-2xl p-8 text-center border border-[rgba(255,255,255,0.08)]">
        <div className="animate-pulse space-y-4">
          <div className="w-24 h-24 bg-secondary/30 rounded-full mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-secondary/30 rounded-lg w-3/4 mx-auto"></div>
            <div className="h-3 bg-secondary/30 rounded-lg w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="h-16 bg-secondary/30 rounded-xl"></div>
            <div className="h-16 bg-secondary/30 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glassmorphism rounded-2xl relative max-w-sm mx-auto shadow-card border border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-secondary/5 to-secondary/20">
      <div className="relative p-8">
        {/* Profile Section */}
        <div className="text-center mb-8">
          <div className="relative mx-auto w-28 h-28 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent via-accent/50 to-accent p-1">
              <div className="w-full h-full rounded-full bg-secondary"></div>
            </div>
            <div className="absolute inset-1 rounded-full overflow-hidden">
              <img
                src={
                  user.profileimage
                    ? user.profileimage
                    : `https://ui-avatars.com/api/?name=${user.username}&background=4f46e5&color=ffffff&size=200`
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold gradient-text mb-2">
              {user.username}
            </h2>
            <p className="text-text-muted font-medium mb-1">
              @{user.username.toLowerCase()}
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/30 border border-[rgba(255,255,255,0.05)]">
              <div className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs text-text-secondary font-medium">
                {formatJoinDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="bg-secondary/20 backdrop-blur-sm rounded-xl p-4 mb-6 border border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-text-secondary font-semibold truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="relative group hover:scale-[1.05] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
            <div className="relative bg-secondary/30 backdrop-blur-sm rounded-xl p-4 text-center border border-[rgba(255,255,255,0.05)]">
              <div className="text-3xl font-bold text-accent mb-2">
                {user.likedPosts.length}
              </div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Likes
              </div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-accent/40 rounded-full animate-ping"></div>
            </div>
          </div>

          <div className="relative group hover:scale-[1.05] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
            <div className="relative bg-secondary/30 backdrop-blur-sm rounded-xl p-4 text-center border border-[rgba(255,255,255,0.05)]">
              <div className="text-3xl font-bold text-accent mb-2">
                {postCount}
              </div>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Posts
              </div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-accent/40 rounded-full animate-ping delay-300"></div>
            </div>
          </div>
        </div>

        {/* Profile Button */}
        <div className="group relative block w-full hover:scale-[1.02] active:scale-95 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-primary rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-300"></div>
          <Link
            to={user && user._id ? `/profile/${user._id}` : "/profile"}
            className="relative bg-gradient-to from-slate-300 to-slate-500 rounded-xl py-4 px-6 text-center overflow-hidden flex items-center justify-center space-x-2"
          >
            <span className="text-white font-bold text-sm">View Full Profile</span>
            <svg className="w-4 h-4 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Decorative Dot */}
      <div className="absolute top-6 right-6 w-3 h-3 bg-accent/30 rounded-full animate-bounce"></div>
    </div>
  );
}

export default ProfileCard;
