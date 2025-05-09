import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Codeforces tracker to fetch a user's solved problems
 */
class CodeforcesProblemTracker {
    constructor(username) {
        this.username = username;
        this.apiUrl = 'https://codeforces.com/api';
    }

    /**
     * Fetch the total number of unique problems solved by a Codeforces user
     * @returns {Promise<Object>} Object containing totalSolved count
     */
    async getUserSubmissions() {
        try {
            const response = await axios.get(`${this.apiUrl}/user.status`, {
                params: {
                    handle: this.username,
                    from: 1,
                    count: 1000 // Limit to the latest 1000 submissions
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`API returned status: ${response.data.status}`);
            }

            const submissions = response.data.result;
            const acceptedProblems = new Set();

            // Count unique problems that have been accepted (verdict == "OK")
            submissions.forEach(submission => {
                if (submission.verdict === 'OK') {
                    const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
                    acceptedProblems.add(problemKey);
                }
            });

            return { totalSolved: acceptedProblems.size };
        } catch (error) {
            console.error(`Error fetching Codeforces submissions for ${this.username}:`, error.message);
            return { totalSolved: 0 };
        }
    }
}

/**
 * Codeforces tracker to fetch a user's contest rating
 */
class CodeforcesRatingTracker {
    constructor(username) {
        this.username = username;
        this.apiUrl = 'https://codeforces.com/api';
    }

    /**
     * Fetch the current rating of a Codeforces user
     * @returns {Promise<Object>} Object containing contestRating
     */
    async getCurrentRating() {
        try {
            const response = await axios.get(`${this.apiUrl}/user.info`, {
                params: {
                    handles: this.username
                }
            });

            if (response.data.status !== 'OK') {
                throw new Error(`API returned status: ${response.data.status}`);
            }

            const userData = response.data.result[0];
            const contestRating = userData.rating || 0;

            return { contestRating };
        } catch (error) {
            console.error(`Error fetching Codeforces rating for ${this.username}:`, error.message);
            return { contestRating: 0 };
        }
    }
}

export { CodeforcesProblemTracker, CodeforcesRatingTracker }; 