import axios from 'axios';


/**
 * LeetCode tracker to fetch a user's solved problems and contest rating
 */
class LeetCodeTracker {
    constructor(username) {
        this.username = username;
        this.baseUrl = 'https://leetcode.com/graphql';
    }

    /**
     * Fetch the total number of solved problems and contest rating for a LeetCode user
     * @returns {Promise<Object>} Object containing totalSolved and contestRating
     */
    async fetchTotalSolvedProblems() {
        try {
            console.log(`📡 LeetCode: Starting fetch for username: "${this.username}"`);
            
            // Validate username format
            if (!this.username || typeof this.username !== 'string' || this.username.includes(' ')) {
                console.error(`❌ LeetCode: Invalid username format: "${this.username}"`);
                console.log(`⚠️ LeetCode usernames cannot contain spaces or be empty`);
                return { totalSolved: 0, contestRating: 0 };
            }
            
            // Updated query that only fetches the solved problems without the contest ranking
            // LeetCode API changed and no longer exposes userContestRanking in this query
            const query = `
                query userProblemsSolved($username: String!) {
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                count
                            }
                        }
                    }
                }
            `;

            console.log(`📡 LeetCode: Sending request for: "${this.username}"`);
            
            const response = await axios.post(this.baseUrl, {
                query,
                variables: { username: this.username }
            });

            console.log(`✅ LeetCode: Received response for: "${this.username}"`);
            
            const data = response.data.data;
            if (!data || !data.matchedUser) {
                console.error(`❌ LeetCode: User "${this.username}" not found on LeetCode. Please check the username is correct.`);
                return { totalSolved: 0, contestRating: 0 };
            }

            const totalSolved = data.matchedUser.submitStats?.acSubmissionNum[0]?.count || 0;
            // Since we can't get contest rating directly through this API anymore
            const contestRating = 0;

            console.log(`✅ LeetCode: Successfully extracted data for "${this.username}": ${totalSolved} problems solved, rating: ${contestRating}`);
            
            return { totalSolved, contestRating };
        } catch (error) {
            console.error(`❌ LeetCode: Error fetching stats for "${this.username}":`, error.message);
            
            // More detailed error logging
            if (error.response) {
                console.error(`❌ LeetCode: Server responded with status code ${error.response.status}`);
                console.error(`❌ LeetCode: Response data:`, error.response.data);
            } else if (error.request) {
                console.error(`❌ LeetCode: No response received from server`);
            }
            
            console.log(`⚠️ LeetCode: Make sure the username "${this.username}" is correct and the profile is public`);
            
            return { totalSolved: 0, contestRating: 0 };
        }
    }
}

export { LeetCodeTracker }; 