import React, { useState, useEffect } from "react";
import Post from "./Post";
import api from "../services/api";
import PostInput from "./PostInput";

function PostList({ selectedTab, setSelectedTab }) {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("PostList mounted");
    return () => console.log("PostList unmounted");
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const result = await api.get("/post/getpost");
        console.log(result.data.data);
        setPosts(result.data.data);
        setFilteredPosts(result.data.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching posts:", error);
        setErrorMessage("Error fetching posts");
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedTab === "all") {
      setFilteredPosts(posts);
    } else if (selectedTab === "hybrid") {
      setFilteredPosts(posts.filter((post) => post.likes > 0));
    }
  }, [selectedTab, posts]);

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

  // Handle post deletion
  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <div>
      <PostInput onPostCreated={handlePostCreated} />
      
      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <div className="loader"></div>
        </div>
      ) : errorMessage ? (
        <p className="text-center text-white">{errorMessage}</p>
      ) : filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <Post
            key={post._id}
            postId={post._id}
            posts={post}
            createdBy={post.createdBy}
            title={post.title}
            content={post.content}
            likes={post.likes}
            createdAt={post.createdAt}
            comments={post.comments}
            addCommentToPost={addCommentToPost}
            onDelete={handlePostDeleted} // Pass the onDelete callback
          />
        ))
      ) : (
        <p className="text-center text-white">No posts available</p>
      )}
    </div>
  );
}

export default PostList;