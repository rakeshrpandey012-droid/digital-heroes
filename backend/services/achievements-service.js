// services/achievementsService.js
const Achievement = require('../models/Achievement');
const Streak = require('../models/Streak');
const User = require('../models/User');
const NotificationService = require('./notificationService');

class AchievementsService {
  /**
   * Achievement definitions
   */
  static ACHIEVEMENTS_DB = {
    first_win: {
      title: '🎉 First Blood',
      description: 'Win your first prize',
      badge: '🎉',
      rewardPoints: 100,
      rarity: 'common',
      condition: (stats) => stats.totalWins === 1
    },
    hat_trick: {
      title: '🎩 Hat Trick',
      description: 'Win 3 times in a single month',
      badge: '🎩',
      rewardPoints: 200,
      rarity: 'rare',
      condition: (stats) => stats.monthlyWins >= 3
    },
    top_scorer: {
      title: '⛳ Top Scorer',
      description: 'Achieve a score of 40 or above',
      badge: '⛳',
      rewardPoints: 150,
      rarity: 'rare',
      condition: (stats) => stats.highestScore >= 40
    },
    perfect_month: {
      title: '📅 Perfect Month',
      description: 'Enter scores every day for an entire month',
      badge: '📅',
      rewardPoints: 300,
      rarity: 'epic',
      condition: (stats) => stats.perfectMonthDays === 30
    },
    charity_hero: {
      title: '❤️ Charity Hero',
      description: 'Contribute ₹5,000 to charity',
      badge: '❤️',
      rewardPoints: 250,
      rarity: 'epic',
      condition: (stats) => stats.totalCharityContribution >= 5000
    },
    consistent_player: {
      title: '🔥 On Fire',
      description: 'Maintain a 7-day score entry streak',
      badge: '🔥',
      rewardPoints: 200,
      rarity: 'rare',
      condition: (stats) => stats.longestStreak >= 7
    },
    milestone_10: {
      title: '🏆 Milestone Master',
      description: 'Win 10 times',
      badge: '🏆',
      rewardPoints: 400,
      rarity: 'epic',
      condition: (stats) => stats.totalWins >= 10
    },
    score_master: {
      title: '🎯 Score Master',
      description: 'Maintain an average score of 35+',
      badge: '🎯',
      rewardPoints: 350,
      rarity: 'epic',
      condition: (stats) => stats.averageScore >= 35
    },
    generous_donor: {
      title: '💚 Generous Donor',
      description: 'Contribute 25% or more of your subscription to charity',
      badge: '💚',
      rewardPoints: 300,
      rarity: 'rare',
      condition: (stats) => stats.charityPercentage >= 25
    },
    tournament_victor: {
      title: '👑 Tournament Victor',
      description: 'Win 5 times or more',
      badge: '👑',
      rewardPoints: 500,
      rarity: 'legendary',
      condition: (stats) => stats.totalWins >= 5
    }
  };

  /**
   * Check and unlock achievements for a user
   */
  static async checkAndUnlockAchievements(userId) {
    try {
      const user = await User.findById(userId)
        .populate('golfScores')
        .select('+winnings');

      // Calculate stats
      const stats = this.calculateUserStats(user);

      // Check each achievement
      const achievements = [];
      for (const [key, config] of Object.entries(this.ACHIEVEMENTS_DB)) {
        const conditionMet = config.condition(stats);

        if (conditionMet) {
          // Check if already unlocked
          const existing = await Achievement.findOne({
            userId,
            achievementType: key
          });

          if (!existing) {
            // Unlock achievement
            const achievement = await Achievement.create({
              userId,
              achievementType: key,
              title: config.title,
              description: config.description,
              badge: config.badge,
              rewardPoints: config.rewardPoints,
              rarity: config.rarity
            });

            // Update user points
            await User.findByIdAndUpdate(
              userId,
              { $inc: { 'gamification.totalPoints': config.rewardPoints } }
            );

            // Send notification
            await NotificationService.sendAchievementNotification(userId, {
              name: config.title,
              description: config.description,
              badge: config.badge,
              reward: config.rewardPoints
            });

            achievements.push(achievement);
          }
        }
      }

      return achievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  /**
   * Update user streak
   */
  static async updateStreak(userId, type = 'score_entry') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = await Streak.findOne({ userId, type });

      if (!streak) {
        streak = await Streak.create({
          userId,
          type,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: new Date(),
          streakStartDate: new Date(),
          totalDaysActive: 1
        });
      } else {
        const lastActivity = new Date(streak.lastActivityDate);
        lastActivity.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          // Already logged today, no change
          return streak;
        } else if (daysDiff === 1) {
          // Streak continues
          streak.currentStreak += 1;
          streak.totalDaysActive += 1;

          if (streak.currentStreak > streak.longestStreak) {
            streak.longestStreak = streak.currentStreak;

            // Notify if milestone
            if (streak.currentStreak % 7 === 0) {
              await NotificationService.sendRealTimeNotification(userId, {
                title: '🔥 Streak Milestone!',
                message: `You've reached a ${streak.currentStreak}-day streak!`,
                type: 'achievement',
                data: { streakDays: streak.currentStreak }
              });
            }
          }
        } else {
          // Streak broken, reset
          streak.currentStreak = 1;
          streak.streakStartDate = new Date();
        }

        streak.lastActivityDate = new Date();
      }

      await streak.save();

      // Check for streak-based achievements
      await this.checkAndUnlockAchievements(userId);

      return streak;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  /**
   * Get user's achievements with progress
   */
  static async getUserAchievements(userId) {
    try {
      const unlockedAchievements = await Achievement.find({ userId }).sort('-unlockedAt');

      const user = await User.findById(userId)
        .populate('golfScores')
        .select('+winnings');

      const stats = this.calculateUserStats(user);
      const streak = await Streak.findOne({ userId, type: 'score_entry' });

      // Calculate progress for locked achievements
      const lockedAchievements = [];
      for (const [key, config] of Object.entries(this.ACHIEVEMENTS_DB)) {
        const isUnlocked = unlockedAchievements.some(a => a.achievementType === key);

        if (!isUnlocked) {
          const progress = this.calculateAchievementProgress(key, stats);
          lockedAchievements.push({
            achievementType: key,
            title: config.title,
            description: config.description,
            badge: config.badge,
            rarity: config.rarity,
            progress,
            isUnlocked: false
          });
        }
      }

      return {
        unlockedCount: unlockedAchievements.length,
        totalPoints: user.gamification?.totalPoints || 0,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        unlocked: unlockedAchievements.map(a => ({
          ...a.toObject(),
          isUnlocked: true
        })),
        locked: lockedAchievements
      };
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  /**
   * Calculate user statistics for achievement checking
   */
  static calculateUserStats(user) {
    const golfScores = user.golfScores || [];
    const winnings = user.winnings || [];

    const totalWins = winnings.length;
    const totalCharityContribution = user.charity?.totalContributed || 0;
    const charityPercentage = user.charity?.percentage || 0;

    const scores = golfScores.map(s => s.score);
    const averageScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Count current month wins
    const currentDate = new Date();
    const monthWinnings = winnings.filter(w => {
      const wDate = new Date(w.drawDate);
      return wDate.getMonth() === currentDate.getMonth() 
        && wDate.getFullYear() === currentDate.getFullYear();
    });

    return {
      totalWins,
      monthlyWins: monthWinnings.length,
      totalCharityContribution,
      charityPercentage,
      averageScore: parseFloat(averageScore.toFixed(2)),
      highestScore,
      longestStreak: 0, // Will be fetched from Streak model
      perfectMonthDays: 0 // Will be calculated separately
    };
  }

  /**
   * Calculate progress for locked achievements
   */
  static calculateAchievementProgress(achievementType, stats) {
    const progressMap = {
      first_win: {
        current: stats.totalWins,
        target: 1,
        unit: 'wins'
      },
      hat_trick: {
        current: stats.monthlyWins,
        target: 3,
        unit: 'wins'
      },
      top_scorer: {
        current: stats.highestScore,
        target: 40,
        unit: 'points'
      },
      charity_hero: {
        current: stats.totalCharityContribution,
        target: 5000,
        unit: '₹'
      },
      score_master: {
        current: stats.averageScore,
        target: 35,
        unit: 'points'
      },
      tournament_victor: {
        current: stats.totalWins,
        target: 5,
        unit: 'wins'
      },
      generous_donor: {
        current: stats.charityPercentage,
        target: 25,
        unit: '%'
      },
      consistent_player: {
        current: 0,
        target: 7,
        unit: 'days'
      },
      perfect_month: {
        current: 0,
        target: 30,
        unit: 'days'
      },
      milestone_10: {
        current: stats.totalWins,
        target: 10,
        unit: 'wins'
      }
    };

    const progress = progressMap[achievementType] || { current: 0, target: 1, unit: '' };
    const percentage = Math.min((progress.current / progress.target) * 100, 100);

    return {
      current: progress.current,
      target: progress.target,
      unit: progress.unit,
      percentage: Math.round(percentage)
    };
  }

  /**
   * Get leaderboard by achievements/points
   */
  static async getAchievementsLeaderboard(limit = 50) {
    try {
      return await User.find({ 'gamification.totalPoints': { $gt: 0 } })
        .select('firstName lastName profileImage gamification')
        .sort({ 'gamification.totalPoints': -1 })
        .limit(limit);
    } catch (error) {
      console.error('Error fetching achievements leaderboard:', error);
      throw error;
    }
  }
}

module.exports = AchievementsService;
