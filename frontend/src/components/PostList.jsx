import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./Post";
import api from "../services/api";
function PostList({ selectedTab }) {
  const [posts, setPosts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch posts based on the selected tab
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
           const result=await api.get('/post/getpost');
           console.log(result.data.data);
           setPosts(result.data.data);

           if(result){
            setIsLoading(false);
           }
        
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching posts:", error);
        setErrorMessage("Error fetching posts");
      }
    };

    fetchPosts();
  }, []); // Fetch posts whenever the tab changes

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="loader"></div> {/* Loading spinner */}
        </div>
      ) : errorMessage ? (
        <p className="text-center text-white">{errorMessage}</p> // Display error message
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <Post
            key={post._id}
            postId={post._id}
            createdBy={post.createdBy}
            title={post.title} // Use title property
            content={post.content} // Use content property
            likes={post.likes}
            createdAt={post.createdAt} // Added createdAt for formatting
            comments={post.comments} // Use comments property
          />
        ))
      ) : (
        <p className="text-center text-white">No posts available</p> // Display message if no posts
      )}
    </div>
  );
}

export default PostList;