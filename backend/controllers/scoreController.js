const Score = require('../models/Score'); // Adjust based on your DB schema (MongoDB/Supabase)

exports.addOrUpdateScore = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const { score, date } = req.body;

    // Validate score range 1-45
    if (score < 1 || score > 45) {
      return res.status(400).json({ error: 'Score must be between 1 and 45.' });
    }

    // Fetch existing scores for user sorted by date descending
    let userScores = await Score.find({ userId }).sort({ date: -1 });

    // Check for duplicate date
    const duplicate = userScores.find(s => s.date.toISOString().split('T')[0] === date);
    if (duplicate) {
      return res.status(400).json({ error: 'Duplicate score for this date not allowed.' });
    }

    // Create new score entry
    await Score.create({ userId, score, date });

    // Re-fetch to enforce rolling 5-score limit
    userScores = await Score.find({ userId }).sort({ date: -1 });
    
    if (userScores.length > 5) {
      const scoresToRemove = userScores.slice(5);
      const idsToRemove = scoresToRemove.map(s => s._id);
      await Score.deleteMany({ _id: { $in: idsToRemove } });
    }

    const updatedScores = await Score.find({ userId }).sort({ date: -1 });
    res.status(200).json({ message: 'Score updated successfully', scores: updatedScores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};