import React, { useState } from 'react';

export default function ScoreEntry({ scores, onAddScore }) {
  const [scoreValue, setScoreValue] = useState('');
  const [scoreDate, setScoreDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const numScore = parseInt(scoreValue, 10);

    // PRD §05 Validation: Range 1-45
    if (isNaN(numScore) || numScore < 1 || numScore > 45) {
      setError('Stableford score must be between 1 and 45.');
      return;
    }

    // Check duplicate date
    const existingDate = scores.find((s) => s.date === scoreDate);
    if (existingDate) {
      setError('Only one score entry is permitted per date. Edit your existing entry instead.');
      return;
    }

    setError('');
    onAddScore({ score: numScore, date: scoreDate });
    setScoreValue('');
    setScoreDate('');
  };

  return (
    <div className="score-entry-container p-6 bg-gray-900 rounded-xl text-white">
      <h3 className="text-xl font-bold mb-4">Enter Latest Stableford Score</h3>
      {error && <p className="text-red-400 mb-3 text-sm">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Score (1 - 45)</label>
          <input
            type="number"
            min="1"
            max="45"
            value={scoreValue}
            onChange={(e) => setScoreValue(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Date Played</label>
          <input
            type="date"
            value={scoreDate}
            onChange={(e) => setScoreDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-green-400 text-black font-semibold rounded hover:bg-green-300 transition"
        >
          Submit Score
        </button>
      </form>
    </div>
  );
}