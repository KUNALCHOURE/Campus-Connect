import React, { useEffect, useState } from 'react';
import { recommendPosts } from '../utils/collaborativeFiltering';

function RecommendationTest() {
  const [recommendedPostIds, setRecommendedPostIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('userProfile'));
        console.log(user._id);

        const postIds = await recommendPosts(user._id);
        console.log(postIds);
        
        setRecommendedPostIds(postIds);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Recommended Post IDs:</h2>
      <ul>
        {recommendedPostIds.map(postId => (
          <li key={postId}>{postId}</li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationTest;