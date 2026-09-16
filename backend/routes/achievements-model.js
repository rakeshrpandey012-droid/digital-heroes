// models/Achievement.js
const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  achievementType: {
    type: String,
    enum: [
      "first_win", // Won first prize
      "hat_trick", // Won 3 times in a month
      "top_scorer", // Score >= 40
      "perfect_month", // Entered score every day for a month
      "charity_hero", // Contributed ₹5000+
      "consistent_player", // 7-day streak
      "milestone_10", // 10 total wins
      "score_master", // Average score >= 35
      "generous_donor", // Charity >= 25% of subscription
      "tournament_victor", // Won 5+ times
    ],
    required: true,
  },
  title: String,
  description: String,
  badge: String, // Icon/emoji
  rewardPoints: {
    type: Number,
    default: 0,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
  displayOrder: Number,
  rarity: {
    type: String,
    enum: ["common", "rare", "epic", "legendary"],
    default: "common",
  },
});

module.exports = mongoose.model("Achievement", achievementSchema);

// models/Streak.js
const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["score_entry", "winning"],
    required: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastActivityDate: Date,
  streakStartDate: Date,
  totalDaysActive: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Streak", streakSchema);
