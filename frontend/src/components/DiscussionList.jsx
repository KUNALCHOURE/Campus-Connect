// import React, { useState } from 'react';
// import axios from 'axios';
// import { IoSendSharp } from 'react-icons/io5';

// function DiscussionList({ discussions, fetchDiscussions }) {
//   const [commentText, setCommentText] = useState({});

//   const handleCommentChange = (discussionId, e) => {
//     setCommentText({ ...commentText, [discussionId]: e.target.value });
//   };

//   const handleCommentSubmit = async (discussionId, e) => {
//     e.preventDefault();

//     const token = localStorage.getItem("token");

//     try {
//       await axios.post(
//         `http://localhost:5000/api/discussions/${discussionId}/comments`,
//         { text: commentText[discussionId] }, // Comment text
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`, // Include the token in the headers
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       setCommentText({ ...commentText, [discussionId]: "" }); // Clear input
//       fetchDiscussions(); // Refresh discussions after adding comment
//     } catch (error) {
//       console.error("Error adding comment:", error);
//     }
//   };

//   return (
//     <div>
//       {discussions.map((discussion) => (
//         <div key={discussion._id} className="bg-[#151f2a] p-6 rounded-lg shadow-lg mb-4">
//           {/* Discussion Title */}
//           <h2 className="font-bold text-lg text-white mb-2">{discussion.title}</h2>

//           {/* Discussion Content */}
//           <p className="text-gray-300 mb-4">{discussion.content}</p>

//           {/* User Info and Date */}
//           <div className="text-sm text-gray-500 mb-4">
//             <p>Posted by: <span className="font-medium text-gray-200">{discussion.createdBy.username}</span></p>
//             <p className="text-xs">{new Date(discussion.createdAt).toLocaleString()}</p>
//           </div>

//           <hr className="my-4 border-gray-700" />

//           {/* Comment Form */}
//           <form onSubmit={(e) => handleCommentSubmit(discussion._id, e)} className="mt-4 flex flex-row gap-4">
//             <textarea
//               placeholder="Add a comment..."
//               value={commentText[discussion._id] || ""}
//               onChange={(e) => handleCommentChange(discussion._id, e)}
//               className="p-3 bg-gray-800 border border-gray-700 rounded w-full h-16 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <button
//               type="submit"
//               className="bg-blue-600 h-fit w-fit text-white py-2 px-4 rounded-full mt-3 hover:bg-blue-700 transition duration-300 flex items-center space-x-2"
//             >
//               <span>Comment</span>
//               <IoSendSharp />
//             </button>
//           </form>

//           {/* Comments Section */}
//           <div className="mt-6 space-y-4">
//             {discussion.comments.map((comment, index) => (
//               <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
//                 <p className="text-gray-300 mb-2">{comment.text}</p>
//                 <div className="text-xs text-gray-400">
//                   <p>By: <span className="text-gray-200 font-medium">{comment.createdBy.username}</span></p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default DiscussionList;

import React, { useState } from 'react';
import api from '../services/api';
import { IoSendSharp } from 'react-icons/io5';
import { FaThumbsUp, FaRegThumbsUp } from 'react-icons/fa';

function DiscussionList({ discussions, fetchDiscussions }) {
  const [commentText, setCommentText] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});
  const [error, setError] = useState({});

  const handleCommentChange = (discussionId, e) => {
    setCommentText({ ...commentText, [discussionId]: e.target.value });
    setError({ ...error, [discussionId]: null });
  };

  const handleCommentSubmit = async (discussionId, e) => {
    e.preventDefault();
    if (!commentText[discussionId]?.trim()) return;

    setIsSubmitting({ ...isSubmitting, [discussionId]: true });
    setError({ ...error, [discussionId]: null });

    try {
      await api.post('/discussions/${discussionId}/comments', {
        text: commentText[discussionId]
      });
      
      setCommentText({ ...commentText, [discussionId]: "" });
      fetchDiscussions();
    } catch (error) {
      setError({
        ...error,
        [discussionId]: error.response?.data?.message || "Failed to post comment"
      });
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting({ ...isSubmitting, [discussionId]: false });
    }
  };

  const handleLike = async (discussionId) => {
    try {
      await api.post('/discussions/${discussionId}/like');
      fetchDiscussions();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div>
      {discussions.map((discussion) => (
        <div key={discussion._id} className="bg-[#151f2a] p-6 rounded-lg shadow-lg mb-4">
          {/* Discussion Title */}
          <h2 className="font-bold text-lg text-white mb-2">{discussion.title}</h2>

          {/* Discussion Content */}
          <p className="text-gray-300 mb-4">{discussion.content}</p>

          {/* User Info and Date */}
          <div className="text-sm text-gray-500 mb-4">
            <p>Posted by: <span className="font-medium text-gray-200">{discussion.createdBy.username}</span></p>
            <p className="text-xs">{new Date(discussion.createdAt).toLocaleString()}</p>
          </div>

          {/* Tags */}
          {discussion.tags && discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {discussion.tags.map((tag, index) => (
                <span key={index} className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <hr className="my-4 border-gray-700" />

          {/* Like Button */}
          <button
            onClick={() => handleLike(discussion._id)}
            className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors mb-4"
          >
            {discussion.likes.includes(localStorage.getItem('userId')) ? (
              <FaThumbsUp className="text-blue-500" />
            ) : (
              <FaRegThumbsUp />
            )}
            <span>{discussion.likes.length}</span>
          </button>

          {/* Comment Form */}
          <form onSubmit={(e) => handleCommentSubmit(discussion._id, e)} className="mt-4 flex flex-row gap-4">
            <textarea
              placeholder="Add a comment..."
              value={commentText[discussion._id] || ""}
              onChange={(e) => handleCommentChange(discussion._id, e)}
              className="p-3 bg-gray-800 border border-gray-700 rounded w-full h-16 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSubmitting[discussion._id]}
              className={`bg-blue-600 h-fit w-fit text-white py-2 px-4 rounded-full mt-3 hover:bg-blue-700 transition duration-300 flex items-center space-x-2 ${
                isSubmitting[discussion._id] ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>{isSubmitting[discussion._id] ? 'Posting...' : 'Comment'}</span>
              <IoSendSharp />
            </button>
          </form>

          {error[discussion._id] && (
            <div className="text-red-500 text-sm mt-2">{error[discussion._id]}</div>
          )}

          {/* Comments Section */}
          <div className="mt-6 space-y-4">
            {discussion.comments && discussion.comments.length > 0 ? (
              discussion.comments.map((comment, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <p className="text-gray-300 mb-2">{comment.text}</p>
                  <div className="text-xs text-gray-400">
                    <p>By: <span className="text-gray-200 font-medium">{comment.createdBy.username}</span></p>
                    <p>{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DiscussionList; 