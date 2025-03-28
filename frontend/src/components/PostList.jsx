import React, { useState, useEffect } from "react";
import Post from "./Post";
import api from "../services/api";
import PostInput from "./PostInput";

function PostList({ selectedTab, setSelectedTab }) {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Debug mounting
  useEffect(() => {
    console.log("PostList mounted");
    return () => console.log("PostList unmounted");
  }, []);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const result = await api.get("/post/getpost");
        console.log(result.data.data);
        setPosts(result.data.data);
        setFilteredPosts(result.data.data); // Initially show all posts
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching posts:", error);
        setErrorMessage("Error fetching posts");
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on selected tab
  useEffect(() => {
    if (selectedTab === "all") {
      setFilteredPosts(posts);
    } else if (selectedTab === "hybrid") { // "hybrid" corresponds to "Recommended"
      // Example: Filter posts with likes > 0 for "Recommended"
      setFilteredPosts(posts.filter((post) => post.likes > 0));
    }
  }, [selectedTab, posts]);

  // Handle new post creation
  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const addCommentToPost = (postId, newComment) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

  return (
    <div>
      {/* Add PostInput at the top */}
      <PostInput onPostCreated={handlePostCreated} />

      {/* Tab Buttons */}
      <div className="flex justify-center my-6">
        <button
          className={`border border-accent/30 text-primary-color py-2 px-6 m-1 rounded-full transition-colors duration-300 hover:bg-accent hover:text-white ${
            selectedTab === "all" ? "bg-accent text-white" : "bg-transparent"
          }`}
          onClick={() => setSelectedTab("all")}
        >
          All
        </button>
        <button
          className={`border border-accent/30 text-primary-color py-2 px-6 m-1 rounded-full transition-colors duration-300 hover:bg-accent hover:text-white ${
            selectedTab === "hybrid" ? "bg-accent text-white" : "bg-transparent"
          }`}
          onClick={() => setSelectedTab("hybrid")}
        >
          Recommended
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="loader"></div>
        </div>
      ) : errorMessage ? (
        <p className="text-center text-white">{errorMessage}</p>
      ) : filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <Post
            key={post._id}
            postId={post._id}
            createdBy={post.createdBy}
            title={post.title}
            content={post.content}
            likes={post.likes}
            createdAt={post.createdAt}
            comments={post.comments}
            addCommentToPost={addCommentToPost}
          />
        ))
      ) : (
        <p className="text-center text-white">No posts available</p>
      )}
    </div>
  );
}

export default PostList;