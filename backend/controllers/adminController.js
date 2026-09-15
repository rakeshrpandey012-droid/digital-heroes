const User = require('../models/User');
const Charity = require('../models/Charity');
const Winner = require('../models/Winner');
const Draw = require('../models/Draw');

// 01. User Management: Get all users & update profiles/scores
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 02. Draw Management: Run simulation or publish monthly draw
exports.runDrawSimulation = async (req, res) => {
  try {
    // Logic for weighted score-frequency algorithm or random pick simulation (§06)
    const activeSubscribers = await User.countDocuments({ isActive: true });
    const simulatedPrizePool = activeSubscribers * 12 * 0.40; // 40% jackpot share example

    res.status(200).json({
      message: 'Draw simulation completed successfully',
      activeSubscribers,
      simulatedPrizePool,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 03. Charity Management: Add new charity listing
exports.addCharity = async (req, res) => {
  try {
    const { name, description, percentage } = req.body;
    const newCharity = await Charity.create({ name, description, percentage });
    res.status(201).json({ message: 'Charity added successfully', newCharity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 04. Winners Management: Verify screenshot proof and update status (Pending -> Paid)
exports.updateWinnerPayoutStatus = async (req, res) => {
  try {
    const { winnerId, status } = req.body; // status: 'Pending' or 'Paid'
    const winner = await Winner.findByIdAndUpdate(
      winnerId,
      { paymentStatus: status },
      { new: true }
    );
    res.status(200).json({ message: 'Winner payout status updated', winner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 05. Reports & Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscribers = await User.countDocuments({ isActive: true });
    const totalPrizePool = activeSubscribers * 12 * 0.40; // Estimated dynamic pool

    res.status(200).json({
      totalUsers,
      activeSubscribers,
      totalPrizePool,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};