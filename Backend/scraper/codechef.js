import axios from 'axios';
import * as cheerio from 'cheerio';


/**
 * CodeChef tracker to fetch a user's solved problems
 */
class CodeChefProblemTracker {
    constructor(username) {
        this.username = username;
        this.baseUrl = `https://www.codechef.com/users/${username}`;
    }

    /**
     * Fetch the number of unique problems solved by a CodeChef user
     * @returns {Promise<Object>} Object containing totalSolved count
     */
    async fetchUniqueSolvedProblems() {
        try {
            const response = await axios.get(this.baseUrl);
            const $ = cheerio.load(response.data);
            
            // Find the "Problems Solved" section
            let totalSolved = 0;
            
            // Look for the rating section
            const problemsSection = $('section:contains("Problems Solved")');
            const problemsText = problemsSection.find('h5:contains("Solved")').text();
            
            // Extract the number using regex
            const match = problemsText.match(/\((\d+)\)/);
            if (match && match[1]) {
                totalSolved = parseInt(match[1]);
            }

            return { totalSolved };
        } catch (error) {
            console.error(`Error fetching CodeChef problems for ${this.username}:`, error.message);
            return { totalSolved: 0 };
        }
    }
}

/**
 * CodeChef tracker to fetch a user's contest rating
 */
class CodeChefRatingTracker {
    constructor(username) {
        this.username = username;
        this.baseUrl = `https://www.codechef.com/users/${username}`;
    }

    /**
     * Fetch the current rating of a CodeChef user
     * @returns {Promise<Object>} Object containing contestRating
     */
    async fetchRatings() {
        try {
            const response = await axios.get(this.baseUrl);
            const $ = cheerio.load(response.data);
            
            let contestRating = 0;
            
            // Look for the rating section
            const ratingText = $('div.rating-number').text().trim();
            if (ratingText) {
                contestRating = parseInt(ratingText);
            }
            
            if (isNaN(contestRating)) {
                contestRating = 0;
            }

            return { contestRating };
        } catch (error) {
            console.error(`Error fetching CodeChef rating for ${this.username}:`, error.message);
            return { contestRating: 0 };
        }
    }
}

export { CodeChefProblemTracker, CodeChefRatingTracker }; 