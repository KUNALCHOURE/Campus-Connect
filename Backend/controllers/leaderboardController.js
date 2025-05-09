import { Leaderboard } from '../models/Leaderboard.model.js';
import { LeetCodeTracker } from '../scraper/leetcode.js';
import { CodeforcesProblemTracker, CodeforcesRatingTracker } from '../scraper/codeforces.js';
import { user as User } from '../models/User.model.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Helper function to extract username from competitive programming URLs
 * @param {string} url The URL to extract username from
 * @param {string} platform The platform (leetcode, codeforces)
 * @returns {string|null} The extracted username or null if invalid
 */
const extractUsernameFromURL = (url, platform) => {
    if (!url) return null;
    
    try {
        // Log the input for debugging
        console.log(`👉 Extracting ${platform} username from: "${url}"`);
        
        // If it's already just a username, return it directly
        if (!url.includes('http') && !url.includes('/')) {
            console.log(`✅ Detected plain username: "${url}"`);
            return url.trim();
        }
        
        // Try to parse as URL
        try {
            const urlObj = new URL(url);
            
            if (platform === 'leetcode') {
                // New format: https://leetcode.com/u/username/
                if (urlObj.pathname.includes('/u/')) {
                    const parts = urlObj.pathname.split('/').filter(Boolean);
                    // The pattern is ["u", "username"]
                    if (parts.length >= 2 && parts[0] === 'u') {
                        const extractedUsername = parts[1] || null;
                        console.log(`✅ Extracted LeetCode username from URL with /u/ format: "${extractedUsername}"`);
                        return extractedUsername ? extractedUsername.trim() : null;
                    }
                }
                
                // Old format: https://leetcode.com/username/
                const path = urlObj.pathname.split('/').filter(Boolean);
                const extractedUsername = path[0] || null;
                console.log(`✅ Extracted LeetCode username from URL: "${extractedUsername}"`);
                return extractedUsername ? extractedUsername.trim() : null;
            } else if (platform === 'codeforces') {
                // Format: https://codeforces.com/profile/username
                if (urlObj.pathname.includes('/profile/')) {
                    const path = urlObj.pathname.split('/').filter(Boolean);
                    const extractedUsername = path[1] || null;
                    console.log(`✅ Extracted Codeforces username from URL: "${extractedUsername}"`);
                    return extractedUsername ? extractedUsername.trim() : null;
                }
                return null;
            }
        } catch (urlError) {
            // URL parsing failed, try manual extraction
            console.log(`⚠️ URL parsing failed, trying manual extraction for: "${url}"`);
            
            // Check for LeetCode /u/ format
            if (platform === 'leetcode' && url.includes('leetcode.com/u/')) {
                const match = url.match(/leetcode\.com\/u\/([^\/]+)/i);
                if (match && match[1]) {
                    console.log(`✅ Manually extracted LeetCode username: "${match[1]}"`);
                    return match[1].trim();
                }
            }
            
            // If all else fails, treat as plain username if it doesn't look like a URL
            if (!url.includes('http') && !url.includes('www.')) {
                console.log(`⚠️ Treating as plain username: "${url}"`);
                return url.trim();
            }
        }
        
        return null;
    } catch (error) {
        console.error(`❌ Error extracting username from ${url} for ${platform}:`, error);
        // If we reached here, just return the original input if it doesn't look like a URL
        if (!url.includes('http') && !url.includes('/')) {
            return url.trim();
        }
        return null;
    }
};

/**
 * Helper function to refresh leaderboard data from scrapers
 * This function syncs users from the User model and then updates their stats
 */
const refreshLeaderboardData = async () => {
    console.log('⭐ Starting leaderboard data refresh...');
    
    try {
        // First, ensure all users with competitive links are in the leaderboard
        const users = await User.find({
            $or: [
                { 'competitiveLinks.leetcode': { $exists: true, $ne: '' } },
                { 'competitiveLinks.codeforces': { $exists: true, $ne: '' } }
            ]
        });
        
        console.log(`Found ${users.length} users with competitive links`);
        let addedCount = 0;
        let updatedCount = 0;
        let errors = [];

        // Process each user to ensure they're in the leaderboard
        for (const user of users) {
            try {
                console.log(`\n📊 Processing user: ${user.username}`);
                
                // Extract usernames from competitiveLinks
                const leetcodeUsername = user.competitiveLinks?.leetcode || '';
                const codeforcesUsername = user.competitiveLinks?.codeforces || '';

                console.log(`- LeetCode link/username: "${leetcodeUsername}"`);
                console.log(`- Codeforces link/username: "${codeforcesUsername}"`);

                // Skip users with no competitive links
                if (!leetcodeUsername && !codeforcesUsername) {
                    console.log(`⚠️ No competitive links found for user ${user.username}, skipping`);
                    continue;
                }

                // Check if user already has a leaderboard entry
                let leaderboardEntry = await Leaderboard.findOne({ 
                    $or: [
                        { user: user._id },
                        { localUsername: user.username }
                    ] 
                });
                
                if (leaderboardEntry) {
                    // Update existing entry
                    console.log(`✅ Found existing leaderboard entry for ${user.username}, updating...`);
                    leaderboardEntry.leetcodeUsername = leetcodeUsername;
                    leaderboardEntry.codeforcesUsername = codeforcesUsername;
                    leaderboardEntry.localUsername = user.username;
                    leaderboardEntry.user = user._id;
                    
                    await leaderboardEntry.save();
                    updatedCount++;
                } else {
                    // Create new entry with initialized stats objects
                    console.log(`🆕 Creating new leaderboard entry for ${user.username}`);
                    const leetcodeStats = leetcodeUsername ? { totalSolved: 0, contestRating: 0 } : null;
                    const codeforcesStats = codeforcesUsername ? { totalSolved: 0, contestRating: 0 } : null;
                    
                    leaderboardEntry = new Leaderboard({
                        user: user._id,
                        localUsername: user.username,
                        leetcodeUsername,
                        codeforcesUsername,
                        leetcodeStats,
                        codeforcesStats,
                        totalSolved: 0,
                        maxContestRating: 0
                    });
                    
                    await leaderboardEntry.save();
                    addedCount++;
                }
            } catch (userError) {
                console.error(`❌ Error syncing user ${user.username}:`, userError);
                errors.push({
                    userId: user._id,
                    username: user.username,
                    error: userError.message
                });
            }
        }
        
        console.log(`Synced ${addedCount} new users and updated ${updatedCount} existing users`);
        
        // Now, update stats for all users in the leaderboard
        const leaderboardUsers = await Leaderboard.find({});
        console.log(`Found ${leaderboardUsers.length} users in leaderboard`);
        
        for (const user of leaderboardUsers) {
            const updates = {};
            console.log(`\n📊 Updating stats for user: ${user.localUsername}`);
            
            // Process LeetCode stats
            if (user.leetcodeUsername) {
                try {
                    console.log(`Original LeetCode username/URL: "${user.leetcodeUsername}"`);
                    const leetcodeUsername = extractUsernameFromURL(user.leetcodeUsername, 'leetcode');
                    
                    if (leetcodeUsername) {
                        console.log(`🚀 Fetching LeetCode stats for username: "${leetcodeUsername}"`);
                        
                        // Extra check to ensure no spaces
                        const cleanUsername = leetcodeUsername.trim();
                        console.log(`Cleaned LeetCode username being used: "${cleanUsername}"`);
                        
                        const leetcodeTracker = new LeetCodeTracker(cleanUsername);
                        const result = await leetcodeTracker.fetchTotalSolvedProblems();
                        console.log(`✅ LEETCODE RESULT FOR ${cleanUsername}:`, JSON.stringify(result, null, 2));
                        updates.leetcodeStats = result;
                    } else {
                        console.log(`⚠️ Failed to extract valid LeetCode username from "${user.leetcodeUsername}"`);
                    }
                } catch (leetcodeError) {
                    console.error(`❌ Error fetching LeetCode stats for ${user.leetcodeUsername}:`, leetcodeError);
                }
            }
            
            // Process Codeforces stats
            if (user.codeforcesUsername) {
                try {
                    console.log(`Original Codeforces username/URL: "${user.codeforcesUsername}"`);
                    const codeforcesUsername = extractUsernameFromURL(user.codeforcesUsername, 'codeforces');
                    
                    if (codeforcesUsername) {
                        console.log(`🚀 Fetching Codeforces stats for username: "${codeforcesUsername}"`);
                        
                        // Extra check to ensure no spaces
                        const cleanUsername = codeforcesUsername.trim();
                        console.log(`Cleaned Codeforces username being used: "${cleanUsername}"`);
                        
                        const problemTracker = new CodeforcesProblemTracker(cleanUsername);
                        const ratingTracker = new CodeforcesRatingTracker(cleanUsername);
                        
                        const problems = await problemTracker.getUserSubmissions();
                        const rating = await ratingTracker.getCurrentRating();
                        
                        console.log(`✅ CODEFORCES PROBLEMS RESULT FOR ${cleanUsername}:`, JSON.stringify(problems, null, 2));
                        console.log(`✅ CODEFORCES RATING RESULT FOR ${cleanUsername}:`, JSON.stringify(rating, null, 2));
                        
                        updates.codeforcesStats = {
                            totalSolved: problems.totalSolved,
                            contestRating: rating.contestRating
                        };
                    } else {
                        console.log(`⚠️ Failed to extract valid Codeforces username from "${user.codeforcesUsername}"`);
                    }
                } catch (codeforcesError) {
                    console.error(`❌ Error fetching Codeforces stats for ${user.codeforcesUsername}:`, codeforcesError);
                }
            }
            
            if (Object.keys(updates).length > 0) {
                try {
                    // Calculate total solved for this user
                    const leetcodeSolved = updates.leetcodeStats?.totalSolved || user.leetcodeStats?.totalSolved || 0;
                    const codeforcesSolved = updates.codeforcesStats?.totalSolved || user.codeforcesStats?.totalSolved || 0;
                    
                    updates.totalSolved = leetcodeSolved + codeforcesSolved;
                    
                    // Calculate max rating - only use Codeforces since LeetCode API no longer supports contest rating
                    const codeforcesRating = updates.codeforcesStats?.contestRating || user.codeforcesStats?.contestRating || 0;
                    
                    updates.maxContestRating = codeforcesRating;
                    
                    console.log(`👉 Updates for ${user.localUsername}:`, JSON.stringify(updates, null, 2));
                    
                    // Perform the update
                    await Leaderboard.findByIdAndUpdate(
                        user._id,
                        { $set: updates },
                        { new: true }
                    );
                    
                    console.log(`✅ Successfully updated stats for user ${user.localUsername}`);
                } catch (updateError) {
                    console.error(`❌ Error updating stats for user ${user.localUsername}:`, updateError);
                }
            } else {
                console.log(`⚠️ No updates to save for user ${user.localUsername}`);
            }
        }
        
        console.log('✅ Leaderboard refresh completed successfully!');
    } catch (error) {
        console.error('❌ Error refreshing leaderboard data:', error);
    }
};

/**
 * Update user's competitive programming stats
 * This now extracts usernames from the User model's competitiveLinks
 */
export const updateUserStats = async (req, res) => {
    try {
        const { localUsername } = req.body;

        if (!localUsername) {
            return res.status(400).json({ error: 'Local username is required' });
        }

        // Find the user to get their competitive programming usernames
        const userRecord = await User.findOne({ username: localUsername });
        
        if (!userRecord) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Extract competitive programming usernames from the user profile
        const leetcodeUsername = userRecord.competitiveLinks?.leetcode || null;
        const codeforcesUsername = userRecord.competitiveLinks?.codeforces || null;
        
        // Find existing leaderboard entry or create new one
        const leaderboardEntry = await Leaderboard.findOneAndUpdate(
            { localUsername },
            {
                leetcodeUsername,
                codeforcesUsername,
                user: userRecord._id
            },
            { 
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        // If the user has competitive profiles, update their stats immediately
        if (leetcodeUsername || codeforcesUsername) {
            const updates = {};

            if (leetcodeUsername) {
                try {
                    console.log(`Fetching LeetCode stats for username: ${leetcodeUsername}`);
                    const leetcodeTracker = new LeetCodeTracker(leetcodeUsername);
                    const result = await leetcodeTracker.fetchTotalSolvedProblems();
                    console.log(`✅ LEETCODE RESULT FOR ${leetcodeUsername}:`, JSON.stringify(result, null, 2));
                    updates.leetcodeStats = result;
                } catch (error) {
                    console.error(`❌ Error fetching LeetCode stats for ${leetcodeUsername}:`, error);
                }
            }

            if (codeforcesUsername) {
                try {
                    console.log(`Fetching Codeforces stats for username: ${codeforcesUsername}`);
                    const problemTracker = new CodeforcesProblemTracker(codeforcesUsername);
                    const ratingTracker = new CodeforcesRatingTracker(codeforcesUsername);
                    
                    const problems = await problemTracker.getUserSubmissions();
                    const rating = await ratingTracker.getCurrentRating();
                    
                    console.log(`✅ CODEFORCES PROBLEMS RESULT FOR ${codeforcesUsername}:`, JSON.stringify(problems, null, 2));
                    console.log(`✅ CODEFORCES RATING RESULT FOR ${codeforcesUsername}:`, JSON.stringify(rating, null, 2));
                    
                    updates.codeforcesStats = {
                        totalSolved: problems.totalSolved,
                        contestRating: rating.contestRating
                    };
                    console.log(`✅ FINAL CODEFORCES STATS FOR ${codeforcesUsername}:`, JSON.stringify(updates.codeforcesStats, null, 2));
                } catch (error) {
                    console.error(`❌ Error fetching Codeforces stats for ${codeforcesUsername}:`, error);
                }
            }

            if (Object.keys(updates).length > 0) {
                await Leaderboard.findByIdAndUpdate(
                    leaderboardEntry._id,
                    { $set: updates },
                    { new: true }
                );
            }
        }

        res.status(200).json({
            message: 'User added to leaderboard successfully',
            leaderboardEntry
        });
    } catch (error) {
        console.error('Error adding user to leaderboard:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Sync users from the User model with the Leaderboard model
 * This will add all users with competitive links to the leaderboard
 */
export const syncUsersToLeaderboard = async (req, res) => {
    try {
        // Get all users with any competitive programming links
        const users = await User.find({
            $or: [
                { 'competitiveLinks.leetcode': { $exists: true, $ne: '' } },
                { 'competitiveLinks.codeforces': { $exists: true, $ne: '' } }
            ]
        });

        let addedCount = 0;
        let updatedCount = 0;
        let errors = [];

        // Process each user
        for (const user of users) {
            try {
                console.log(`\n📊 Processing user: ${user.username}`);
                
                // Extract usernames from competitiveLinks
                const leetcodeUsername = user.competitiveLinks?.leetcode || '';
                const codeforcesUsername = user.competitiveLinks?.codeforces || '';

                console.log(`- LeetCode link/username: "${leetcodeUsername}"`);
                console.log(`- Codeforces link/username: "${codeforcesUsername}"`);

                // Skip users with no competitive links
                if (!leetcodeUsername && !codeforcesUsername) {
                    console.log(`⚠️ No competitive links found for user ${user.username}, skipping`);
                    continue;
                }

                // Check if user already has a leaderboard entry
                let leaderboardEntry = await Leaderboard.findOne({ 
                    $or: [
                        { user: user._id },
                        { localUsername: user.username }
                    ] 
                });
                
                if (leaderboardEntry) {
                    // Update existing entry
                    console.log(`✅ Found existing leaderboard entry for ${user.username}, updating...`);
                    leaderboardEntry.leetcodeUsername = leetcodeUsername;
                    leaderboardEntry.codeforcesUsername = codeforcesUsername;
                    leaderboardEntry.localUsername = user.username;
                    leaderboardEntry.user = user._id;
                    
                    // Initialize stats objects if they don't exist
                    if (!leaderboardEntry.leetcodeStats && leetcodeUsername) {
                        leaderboardEntry.leetcodeStats = { totalSolved: 0, contestRating: 0 };
                    }
                    if (!leaderboardEntry.codeforcesStats && codeforcesUsername) {
                        leaderboardEntry.codeforcesStats = { totalSolved: 0, contestRating: 0 };
                    }
                    
                    // Calculate totalSolved and maxContestRating
                    const leetcodeSolved = leaderboardEntry.leetcodeStats?.totalSolved || 0;
                    const codeforcesSolved = leaderboardEntry.codeforcesStats?.totalSolved || 0;
                    
                    leaderboardEntry.totalSolved = leetcodeSolved + codeforcesSolved;
                    
                    // Use Codeforces rating for maxContestRating since LeetCode API no longer supports contest rating
                    const codeforcesRating = leaderboardEntry.codeforcesStats?.contestRating || 0;
                    
                    leaderboardEntry.maxContestRating = codeforcesRating;
                    
                    await leaderboardEntry.save();
                    updatedCount++;
                } else {
                    // Create new entry with initialized stats objects
                    console.log(`🆕 Creating new leaderboard entry for ${user.username}`);
                    const leetcodeStats = leetcodeUsername ? { totalSolved: 0, contestRating: 0 } : null;
                    const codeforcesStats = codeforcesUsername ? { totalSolved: 0, contestRating: 0 } : null;
                    
                    leaderboardEntry = new Leaderboard({
                        user: user._id,
                        localUsername: user.username,
                        leetcodeUsername,
                        codeforcesUsername,
                        leetcodeStats,
                        codeforcesStats,
                        totalSolved: 0,
                        maxContestRating: 0
                    });
                    
                    await leaderboardEntry.save();
                    addedCount++;
                }
            } catch (userError) {
                console.error(`❌ Error syncing user ${user.username}:`, userError);
                errors.push({
                    userId: user._id,
                    username: user.username,
                    error: userError.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: `Synced ${addedCount + updatedCount} users with competitive profiles`,
            addedCount,
            updatedCount,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error syncing users to leaderboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to sync users to leaderboard',
            error: error.message
        });
    }
};

/**
 * Get the leaderboard sorted by total problems solved
 * Now updates data from scrapers first before returning results
 */
export const getSolvedLeaderboard = async (req, res) => {
    try {
        const { platform } = req.query;
        console.log(`Fetching solved leaderboard for platform: ${platform}`);
        
        // First, refresh data by calling the scrapers for all users
        await refreshLeaderboardData();
        
        if (platform && ['leetcode', 'codeforces'].includes(platform)) {
            // If a platform filter is provided, only return problems solved for that platform
            const users = await Leaderboard.find()
                .sort({ [`${platform}Stats.totalSolved`]: -1 })
                .populate('user', 'username profileimage')
                .lean();
                
            const filteredUsers = users.map(user => ({
                localUsername: user.localUsername,
                user: user.user,
                [`${platform}Stats`]: user[`${platform}Stats`] || { totalSolved: 0, contestRating: 0 },
                [`${platform}Username`]: user[`${platform}Username`],
                [`${platform}Solved`]: user[`${platform}Stats`]?.totalSolved || 0,
                [`${platform}Rating`]: user[`${platform}Stats`]?.contestRating || 0
            }));
            
            return res.status(200).json(filteredUsers);
        }

        // If no platform is provided, return total solved across leetcode and codeforces
        const users = await Leaderboard.aggregate([
            {
                $addFields: {
                    totalSolved: {
                        $add: [
                            { $ifNull: ['$leetcodeStats.totalSolved', 0] },
                            { $ifNull: ['$codeforcesStats.totalSolved', 0] }
                        ]
                    }
                }
            },
            { $sort: { totalSolved: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $project: {
                    localUsername: 1,
                    totalSolved: 1,
                    leetcodeStats: 1,
                    codeforcesStats: 1,
                    leetcodeUsername: 1,
                    codeforcesUsername: 1,
                    userDetails: { $arrayElemAt: ['$userDetails', 0] }
                }
            }
        ]);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching solved leaderboard:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get the leaderboard sorted by contest rating
 * Now only uses Codeforces for rating since LeetCode API no longer provides contest ratings
 */
export const getContestLeaderboard = async (req, res) => {
    try {
        const { platform } = req.query;
        console.log(`Fetching contest leaderboard for platform: ${platform}`);
        
        // First, refresh data by calling the scrapers for all users
        await refreshLeaderboardData();

        // Only return Codeforces ratings since LeetCode no longer provides contest ratings
        if (platform === 'codeforces') {
            const users = await Leaderboard.find()
                .sort({ 'codeforcesStats.contestRating': -1 })
                .populate('user', 'username profileimage')
                .lean();
                
            const filteredUsers = users.map(user => ({
                localUsername: user.localUsername,
                user: user.user,
                codeforcesStats: user.codeforcesStats || { totalSolved: 0, contestRating: 0 },
                codeforcesUsername: user.codeforcesUsername,
                codeforcesRating: user.codeforcesStats?.contestRating || 0,
                codeforcesSolved: user.codeforcesStats?.totalSolved || 0
            }));
            
            return res.status(200).json(filteredUsers);
        }

        // If no platform is provided, just return the Codeforces rating
        const users = await Leaderboard.aggregate([
            {
                $addFields: {
                    maxContestRating: { $ifNull: ['$codeforcesStats.contestRating', 0] }
                }
            },
            { $sort: { maxContestRating: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $project: {
                    localUsername: 1,
                    maxContestRating: 1,
                    codeforcesStats: 1,
                    codeforcesUsername: 1,
                    userDetails: { $arrayElemAt: ['$userDetails', 0] }
                }
            }
        ]);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching contest leaderboard:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update all user stats by fetching from platforms
 */
export const updateAllUserStats = async (req, res) => {
    try {
        const users = await Leaderboard.find({});
        console.log(`Found ${users.length} users in database`);
        let updatedCount = 0;
        let errorCount = 0;
        let errors = [];

        for (const user of users) {
            try {
                const updates = {};
                let userUpdated = false;
                console.log(`\nProcessing user: ${user.localUsername}`);

                // Process LeetCode stats
                if (user.leetcodeUsername) {
                    try {
                        // Extract username if it's a URL
                        const leetcodeUsername = extractUsernameFromURL(user.leetcodeUsername, 'leetcode');
                        
                        if (!leetcodeUsername) {
                            console.log(`Invalid LeetCode username: ${user.leetcodeUsername}. Skipping.`);
                            continue;
                        }
                        
                        console.log(`Fetching LeetCode stats for username: ${leetcodeUsername}`);
                        const leetcodeTracker = new LeetCodeTracker(leetcodeUsername);
                        const result = await leetcodeTracker.fetchTotalSolvedProblems();
                        console.log(`✅ LEETCODE RESULT FOR ${leetcodeUsername}:`, JSON.stringify(result, null, 2));
                        updates.leetcodeStats = result;
                        userUpdated = true;
                    } catch (leetcodeError) {
                        console.error(`❌ Error fetching LeetCode stats for ${user.leetcodeUsername}:`, leetcodeError);
                        errors.push({
                            username: user.localUsername,
                            platform: 'leetcode',
                            error: leetcodeError.message
                        });
                    }
                }

                // Process Codeforces stats
                if (user.codeforcesUsername) {
                    try {
                        // Extract username if it's a URL
                        const codeforcesUsername = extractUsernameFromURL(user.codeforcesUsername, 'codeforces');
                        
                        if (!codeforcesUsername) {
                            console.log(`Invalid Codeforces username: ${user.codeforcesUsername}. Skipping.`);
                            continue;
                        }
                        
                        console.log(`Fetching Codeforces stats for username: ${codeforcesUsername}`);
                        const problemTracker = new CodeforcesProblemTracker(codeforcesUsername);
                        const ratingTracker = new CodeforcesRatingTracker(codeforcesUsername);
                        
                        const problems = await problemTracker.getUserSubmissions();
                        const rating = await ratingTracker.getCurrentRating();
                        
                        console.log(`✅ CODEFORCES PROBLEMS RESULT FOR ${codeforcesUsername}:`, JSON.stringify(problems, null, 2));
                        console.log(`✅ CODEFORCES RATING RESULT FOR ${codeforcesUsername}:`, JSON.stringify(rating, null, 2));
                        
                        updates.codeforcesStats = {
                            totalSolved: problems.totalSolved,
                            contestRating: rating.contestRating
                        };
                        console.log(`✅ FINAL CODEFORCES STATS FOR ${codeforcesUsername}:`, JSON.stringify(updates.codeforcesStats, null, 2));
                        userUpdated = true;
                    } catch (codeforcesError) {
                        console.error(`❌ Error fetching Codeforces stats for ${user.codeforcesUsername}:`, codeforcesError);
                        errors.push({
                            username: user.localUsername,
                            platform: 'codeforces',
                            error: codeforcesError.message
                        });
                    }
                }

                if (Object.keys(updates).length > 0) {
                    try {
                        // Calculate total solved for this user
                        const leetcodeSolved = updates.leetcodeStats?.totalSolved || user.leetcodeStats?.totalSolved || 0;
                        const codeforcesSolved = updates.codeforcesStats?.totalSolved || user.codeforcesStats?.totalSolved || 0;
                        
                        updates.totalSolved = leetcodeSolved + codeforcesSolved;
                        
                        // Calculate max rating - only use Codeforces since LeetCode API no longer supports contest rating
                        const codeforcesRating = updates.codeforcesStats?.contestRating || user.codeforcesStats?.contestRating || 0;
                        
                        updates.maxContestRating = codeforcesRating;
                        
                        // Perform the update
                        const updatedUser = await Leaderboard.findByIdAndUpdate(
                            user._id,
                            { $set: updates },
                            { new: true, runValidators: true }
                        );

                        if (!updatedUser) {
                            console.log(`Failed to update user ${user.localUsername}`);
                            errorCount++;
                        } else if (userUpdated) {
                            updatedCount++;
                        }
                    } catch (updateError) {
                        console.error(`Error updating user ${user.localUsername}:`, updateError);
                        errorCount++;
                        errors.push({
                            username: user.localUsername,
                            error: updateError.message
                        });
                    }
                }
            } catch (userError) {
                console.error(`Unexpected error processing user ${user.localUsername}:`, userError);
                errorCount++;
                errors.push({
                    username: user.localUsername,
                    error: userError.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Updated ${updatedCount} profiles, encountered ${errorCount} errors`,
            updatedCount,
            errorCount,
            totalUsers: users.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Error updating all stats:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Add a test endpoint to verify scraper functionality
export const testScrapers = async (req, res) => {
    try {
        const { leetcodeLink, codeforcesLink } = req.body;
        
        console.log('\n============================================================');
        console.log('⭐ SCRAPER TEST INITIATED ⭐');
        console.log('============================================================');
        console.log('Links provided for testing:');
        console.log(`- LeetCode: ${leetcodeLink || 'not provided'}`);
        console.log(`- Codeforces: ${codeforcesLink || 'not provided'}`);
        console.log('------------------------------------------------------------');
        
        // Extract usernames from links if needed
        const leetcodeUsername = leetcodeLink ? extractUsernameFromURL(leetcodeLink, 'leetcode') : '';
        const codeforcesUsername = codeforcesLink ? extractUsernameFromURL(codeforcesLink, 'codeforces') : '';
        
        console.log('Extracted usernames for testing:');
        console.log(`- LeetCode: "${leetcodeUsername || 'not provided'}" (source: "${leetcodeLink}")`);
        console.log(`- Codeforces: "${codeforcesUsername || 'not provided'}" (source: "${codeforcesLink}")`);
        console.log('------------------------------------------------------------');
        
        const results = { 
            success: true,
            extractedUsernames: {
                leetcode: leetcodeUsername,
                codeforces: codeforcesUsername
            },
            originalInput: {
                leetcode: leetcodeLink,
                codeforces: codeforcesLink
            }
        };
        
        // Test LeetCode scraper
        if (leetcodeUsername) {
            try {
                console.log(`\n🚀 TESTING LEETCODE SCRAPER for username: "${leetcodeUsername}"`);
                console.log(`Direct username being passed to LeetCodeTracker: "${leetcodeUsername}"`);
                
                const leetcodeTracker = new LeetCodeTracker(leetcodeUsername);
                const leetcodeResult = await leetcodeTracker.fetchTotalSolvedProblems();
                console.log(`\n✅ LEETCODE SCRAPER RESULT:`, JSON.stringify(leetcodeResult, null, 2));
                results.leetcode = leetcodeResult;
            } catch (error) {
                console.error(`\n❌ LEETCODE SCRAPER ERROR:`, error);
                results.leetcode = { error: error.message };
            }
        }
        
        // Test Codeforces scrapers
        if (codeforcesUsername) {
            try {
                console.log(`\n🚀 TESTING CODEFORCES SCRAPERS for username: "${codeforcesUsername}"`);
                const problemTracker = new CodeforcesProblemTracker(codeforcesUsername);
                const ratingTracker = new CodeforcesRatingTracker(codeforcesUsername);
                
                const problems = await problemTracker.getUserSubmissions();
                const rating = await ratingTracker.getCurrentRating();
                
                console.log(`\n✅ CODEFORCES PROBLEMS RESULT:`, JSON.stringify(problems, null, 2));
                console.log(`\n✅ CODEFORCES RATING RESULT:`, JSON.stringify(rating, null, 2));
                
                results.codeforces = {
                    totalSolved: problems.totalSolved,
                    contestRating: rating.contestRating
                };
                
                console.log(`\n✅ FINAL CODEFORCES RESULT:`, JSON.stringify(results.codeforces, null, 2));
            } catch (error) {
                console.error(`\n❌ CODEFORCES SCRAPER ERROR:`, error);
                results.codeforces = { error: error.message };
            }
        }
        
        console.log('\n============================================================');
        console.log('⭐ SCRAPER TEST COMPLETE ⭐');
        console.log('============================================================');
        console.log('Final Results:', JSON.stringify(results, null, 2));
        
        return res.status(200).json(results);
    } catch (error) {
        console.error('\n❌ SCRAPER TEST FAILED:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Manual refresh endpoint to update the leaderboard data
 * This can be triggered from a button on the leaderboard page
 */
export const refreshLeaderboard = async (req, res) => {
    try {
        console.log('⭐ Manual leaderboard refresh requested');
        
        // This will refresh all user data
        await refreshLeaderboardData();
        
        return res.status(200).json({
            success: true,
            message: 'Leaderboard data refreshed successfully'
        });
    } catch (error) {
        console.error('Error refreshing leaderboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to refresh leaderboard data',
            error: error.message
        });
    }
};

/**
 * Test endpoint to verify username extraction from URLs
 * This helps diagnose issues with URL formats
 */
export const testUrlExtraction = async (req, res) => {
    try {
        const { leetcodeUrl, codeforcesUrl } = req.body;
        
        console.log('\n============================================================');
        console.log('⭐ URL EXTRACTION TEST INITIATED ⭐');
        console.log('============================================================');
        
        const results = {
            success: true,
            leetcode: null,
            codeforces: null
        };
        
        if (leetcodeUrl) {
            console.log(`Testing LeetCode URL extraction for: "${leetcodeUrl}"`);
            const leetcodeUsername = extractUsernameFromURL(leetcodeUrl, 'leetcode');
            console.log(`Extracted LeetCode username: "${leetcodeUsername}"`);
            
            results.leetcode = {
                originalUrl: leetcodeUrl,
                extractedUsername: leetcodeUsername
            };
            
            // Try a direct test with the extracted username
            if (leetcodeUsername) {
                try {
                    console.log(`🚀 Testing extracted username directly with LeetCode scraper`);
                    const leetcodeTracker = new LeetCodeTracker(leetcodeUsername);
                    const leetcodeResult = await leetcodeTracker.fetchTotalSolvedProblems();
                    console.log(`✅ LeetCode scraper result:`, JSON.stringify(leetcodeResult, null, 2));
                    
                    results.leetcode.scraperTest = leetcodeResult;
                } catch (error) {
                    console.error(`❌ LeetCode scraper error:`, error);
                    results.leetcode.scraperTest = { error: error.message };
                }
            }
        }
        
        if (codeforcesUrl) {
            console.log(`Testing Codeforces URL extraction for: "${codeforcesUrl}"`);
            const codeforcesUsername = extractUsernameFromURL(codeforcesUrl, 'codeforces');
            console.log(`Extracted Codeforces username: "${codeforcesUsername}"`);
            
            results.codeforces = {
                originalUrl: codeforcesUrl,
                extractedUsername: codeforcesUsername
            };
            
            // Try a direct test with the extracted username
            if (codeforcesUsername) {
                try {
                    console.log(`🚀 Testing extracted username directly with Codeforces scraper`);
                    const problemTracker = new CodeforcesProblemTracker(codeforcesUsername);
                    const ratingTracker = new CodeforcesRatingTracker(codeforcesUsername);
                    
                    const problems = await problemTracker.getUserSubmissions();
                    const rating = await ratingTracker.getCurrentRating();
                    
                    results.codeforces.scraperTest = {
                        totalSolved: problems.totalSolved,
                        contestRating: rating.contestRating
                    };
                    
                    console.log(`✅ Codeforces scraper result:`, JSON.stringify(results.codeforces.scraperTest, null, 2));
                } catch (error) {
                    console.error(`❌ Codeforces scraper error:`, error);
                    results.codeforces.scraperTest = { error: error.message };
                }
            }
        }
        
        console.log('\n============================================================');
        console.log('⭐ URL EXTRACTION TEST COMPLETE ⭐');
        console.log('============================================================');
        console.log('Final Results:', JSON.stringify(results, null, 2));
        
        return res.status(200).json(results);
    } catch (error) {
        console.error('❌ URL extraction test failed:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 