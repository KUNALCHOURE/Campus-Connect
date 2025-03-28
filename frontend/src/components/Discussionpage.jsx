import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DiscussionInput from './DiscussionInput';
import DiscussionList from './DiscussionList';

function DiscussionsPage() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/discussions');
      setDiscussions(response.data.data.discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setError(error.response?.data?.message || 'Failed to fetch discussions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchDiscussions}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DiscussionInput fetchDiscussions={fetchDiscussions} />
      <DiscussionList discussions={discussions} fetchDiscussions={fetchDiscussions} />
    </div>
  );
}

export default DiscussionsPage;