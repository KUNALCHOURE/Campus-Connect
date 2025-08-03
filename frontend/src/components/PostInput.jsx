import React, { useState, useEffect } from "react";
import api from "../services/api.js";
import { FaPen, FaTimes, FaHashtag, FaRocket } from "react-icons/fa";
import { useAuth } from "../utils/autcontext.jsx";

function PostInput({ onPostCreated }) {
  const [showModal, setShowModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

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
      window.location.reload();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create post";
      setError(errorMessage);
      console.error("Error creating post: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Main Post Input Card */}
      <div className="bg-secondary rounded-2xl shadow-lg w-full max-w-2xl mx-auto border border-card-border">
        
        {/* Header Section */}
        <div className="p-6 border-b border-card-border">
          <div className="flex items-center space-x-4">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={
                  user?.profileimage
                    ? user.profileimage
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=4f46e5&color=ffffff&size=160`
                }
                alt="Profile"
                className="w-14 h-14 rounded-full border-2 border-accent object-cover"
              />
            </div>

            {/* Input Field */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="What's on your mind?."
                className="w-full bg-input text-text-primary p-4 rounded-xl outline-none cursor-pointer border border-card-border hover:border-accent transition-all duration-300 text-lg placeholder-text-muted"
                onClick={handleInputClick}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="p-6">
          <div className="flex items-center justify-center ">
         

            {/* Create Post Button */}
            <button
              className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 bg-blue-600"
              onClick={handleInputClick}
            >
              <FaPen className="text-sm" />
              <span>Write Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-secondary rounded-2xl w-full max-w-3xl mx-auto shadow-2xl border border-card-border max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-card-border bg-secondary">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                    <FaPen className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-text-primary text-2xl font-bold">Create New Post</h3>
                    <p className="text-text-muted text-sm">Share your thoughts with the community</p>
                  </div>
                </div>
                
                <button
                  className="w-10 h-10 bg-input hover:bg-card rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 bg-secondary">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-text-primary font-semibold mb-2 text-lg">
                  Post Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter an engaging title..."
                  className="w-full bg-input text-text-primary p-4 rounded-xl outline-none border border-card-border focus:border-accent transition-colors text-lg placeholder-text-muted"
                  disabled={isSubmitting}
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-text-primary font-semibold mb-2 text-lg">
                  Content
                </label>
                <textarea
                  className="w-full bg-input text-text-primary p-4 rounded-xl outline-none border border-card-border focus:border-accent transition-colors text-lg placeholder-text-muted resize-none"
                  rows="8"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Write your post content here. Share your thoughts, experiences, or any valuable information..."
                  disabled={isSubmitting}
                ></textarea>
                <div className="mt-2 text-sm text-text-muted">
                  {postContent.length} characters
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-text-primary font-semibold mb-2 text-lg">
                  Tags (Optional)
                </label>
                <div className="relative">
                  <FaHashtag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent" />
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Add tags separated by commas (e.g. technology, coding, tips)"
                    className="w-full bg-input text-text-primary p-4 pl-12 rounded-xl outline-none border border-card-border focus:border-accent transition-colors text-lg placeholder-text-muted"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="mt-2 text-sm text-text-muted">
                  Tags help others discover your post
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-card-border bg-secondary">
              <div className="flex justify-end space-x-4">
                <button
                  className="px-6 py-3 bg-input text-text-secondary rounded-xl hover:bg-card transition-colors font-semibold"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                
                <button
                  className="px-8 py-3 bg-gradient-primary text-white rounded-xl font-semibold disabled:opacity-50 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
                  onClick={handlePostSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <FaRocket />
                      <span>Publish Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PostInput;