import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import profile from ".././assets/vhjkl.jpeg";
import { FaPen, FaTimes } from "react-icons/fa";
import { useAuth } from "../utils/autcontext.jsx";
function PostInput({ onPostCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  // Debug mounting
  useEffect(() => {
    console.log("PostInput mounted");
    return () => console.log("PostInput unmounted");
  }, []);

  const handleInputClick = () => setShowModal(true);

  const closeModal = () => {
    setShowModal(false);
    setPostContent("");
    setTitle("");
    setTags("");
    setError(null);
  };

  const handlePostSubmit = async () => {
    if (!title.trim() || !postContent.trim()) {
      setError("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const postData = {
      title: title.trim(),
      content: postContent.trim(),
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    };

    try {
      const response = await api.post("/post/create-post", postData, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Post successful: ", response.data);
      onPostCreated(response.data.data);
      closeModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create post";
      setError(errorMessage);
      console.error("Error creating post: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-secondary p-5 rounded-lg shadow-md w-full max-w-lg mx-auto">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=random&size=160`}
          alt="Profile"
          className="w-12 h-12 rounded-full border-2 border-accent"
        />
        <input
          type="text"
          placeholder="What's Happening?"
          className="flex-grow bg-input text-text-primary p-3 rounded-full outline-none cursor-pointer border border-card-border hover:border-accent/50 transition-colors"
          onClick={handleInputClick}
        />
      </div>

      <div className="flex justify-center mb-4">
        <button
          className="py-2 px-6 rounded-full transition-all duration-300 flex items-center bg-accent text-white shadow-md"
          onClick={handleInputClick}
        >
          <FaPen className="mr-2 text-white" />
         Create Post
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-primary/80 z-50 backdrop-blur-sm">
          <div className="bg-secondary p-6 rounded-lg w-full max-w-md mx-auto relative shadow-lg border border-card-border">
            <h3 className="text-text-primary text-xl font-semibold mb-4 flex items-center">
              <FaPen className="text-accent mr-2" />
              Create a Post
            </h3>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter the title"
              className="w-full mb-3 bg-input text-text-primary p-3 rounded-lg outline-none border border-card-border focus:border-accent"
              disabled={isSubmitting}
            />

            <textarea
              className="w-full bg-input text-text-primary p-3 rounded-lg outline-none border border-card-border focus:border-accent"
              rows="5"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write something for Updates"
              disabled={isSubmitting}
            ></textarea>

            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags (comma separated)"
              className="w-full mt-3 bg-input text-text-primary p-3 rounded-lg outline-none border border-card-border focus:border-accent"
              disabled={isSubmitting}
            />

            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="bg-input text-text-secondary px-4 py-2 rounded-lg hover:bg-card transition-colors"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                onClick={handlePostSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>

            <button
              className="absolute top-3 right-3 text-text-muted hover:text-text-primary transition-colors bg-input hover:bg-card rounded-full p-2"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostInput;