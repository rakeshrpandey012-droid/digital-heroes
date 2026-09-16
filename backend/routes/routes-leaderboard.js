// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET leaderboard - all time / weekly / monthly
router.get('/leaderboard/:timeframe', auth, async (req, res) => {
  try {
    const { timeframe } = req.params; // 'alltime', 'monthly', 'weekly'
    const { sortBy } = req.query; // 'winnings', 'scores', 'charity'

    let dateFilter = {};
    const now = new Date();

    if (timeframe === 'weekly') {
      dateFilter = {
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      };
    } else if (timeframe === 'monthly') {
      dateFilter = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1)
      };
    }

    let leaderboard = [];

    if (sortBy === 'winnings') {
      leaderboard = await User.aggregate([
        {
          $match: {
            'subscription.status': 'active',
            'winnings.updatedAt': dateFilter.length ? dateFilter : { $exists: true }
          }
        },
        {
          $addFields: {
            totalWinnings: {
              $sum: '$winnings.amount'
            }
          }
        },
        { $sort: { totalWinnings: -1 } },
        { $limit: 100 },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            profileImage: 1,
            totalWinnings: 1,
            'subscription.plan': 1,
            'stats.totalScoresEntered': 1
          }
        }
      ]);
    } else if (sortBy === 'scores') {
      leaderboard = await User.aggregate([
        {
          $match: {
            'subscription.status': 'active'
          }
        },
        {
          $addFields: {
            avgScore: {
              $cond: [
                { $gt: [{ $size: '$golfScores' }, 0] },
                { $avg: '$golfScores.score' },
                0
              ]
            },
            scoreCount: { $size: '$golfScores' }
          }
        },
        { $sort: { avgScore: -1 } },
        { $limit: 100 },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            profileImage: 1,
            avgScore: 1,
            scoreCount: 1,
            totalWinnings: { $sum: '$winnings.amount' }
          }
        }
      ]);
    } else if (sortBy === 'charity') {
      leaderboard = await User.aggregate([
        {
          $match: {
            'subscription.status': 'active'
          }
        },
        {
          $addFields: {
            charityContribution: {
              $multiply: [
                '$subscription.amount',
                { $divide: ['$charity.percentage', 100] }
              ]
            }
          }
        },
        { $sort: { charityContribution: -1 } },
        { $limit: 100 },
        {
          $project: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            profileImage: 1,
            'charity.name': 1,
            charityContribution: 1,
            'subscription.plan': 1
          }
        }
      ]);
    }

    // Add rank
    leaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    // Get current user rank
    const currentUserRank = leaderboard.find(u => u._id.toString() === req.user.id);

    res.json({
      success: true,
      timeframe,
      sortBy,
      leaderboard,
      currentUserRank: currentUserRank || null,
      totalUsers: leaderboard.length
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
  }
});

// GET user's rank and nearby competitors
router.get('/leaderboard/user-rank/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const allUsers = await User.aggregate([
      {
        $match: { 'subscription.status': 'active' }
      },
      {
        $addFields: {
          totalWinnings: { $sum: '$winnings.amount' }
        }
      },
      { $sort: { totalWinnings: -1 } },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          totalWinnings: 1
        }
      }
    ]);

    const userRankIndex = allUsers.findIndex(u => u._id.toString() === userId);
    const userRank = userRankIndex + 1;

    // Get 2 above and 2 below
    const nearbyCompetitors = allUsers.slice(
      Math.max(0, userRankIndex - 2),
      Math.min(allUsers.length, userRankIndex + 3)
    );

    res.json({
      success: true,
      userRank,
      totalCompetitors: allUsers.length,
      nearbyCompetitors: nearbyCompetitors.map((u, idx) => ({
        ...u,
        rank: Math.max(0, userRankIndex - 2) + idx + 1
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user rank' });
  }
});

module.exports = router;
