import React, { useState } from "react";

interface ScoreEntry {
  id: string;
  score: number;
  date: string;
}

export default function ScoreManagement() {
  const [scores, setScores] = useState<ScoreEntry[]>([
    { id: "1", score: 36, date: "2026-03-01" },
    { id: "2", score: 32, date: "2026-03-05" },
  ]);
  const [newScore, setNewScore] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleAddScore = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const scoreNum = parseInt(newScore, 10);

    // Validation per PRD §05
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError("Score must be between 1 and 45 in Stableford format.");
      return;
    }

    if (!newDate) {
      setError("Please select a valid date.");
      return;
    }

    // Check for duplicate dates
    if (scores.some(s => s.date === newDate)) {
      setError(
        "Only one score entry is permitted per date. Edit the existing entry instead."
      );
      return;
    }

    const entry: ScoreEntry = {
      id: Date.now().toString(),
      score: scoreNum,
      date: newDate,
    };

    // Add new score and maintain max 5 rolling scores, reverse chronological order
    const updated = [entry, ...scores]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    setScores(updated);
    setNewScore("");
    setNewDate("");
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800">
      <h3 className="text-xl font-bold mb-4">
        Golf Score Management (Last 5 Stableford Scores)
      </h3>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleAddScore}
        className="flex flex-col md:flex-row gap-3 mb-6"
      >
        <input
          type="number"
          min="1"
          max="45"
          placeholder="Score (1-45)"
          value={newScore}
          onChange={e => setNewScore(e.target.value)}
          className="bg-slate-800 border border-slate-700 p-2 rounded text-white"
          required
        />
        <input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          className="bg-slate-800 border border-slate-700 p-2 rounded text-white"
          required
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 font-semibold px-4 py-2 rounded transition"
        >
          Add Score
        </button>
      </form>

      <div className="space-y-2">
        {scores.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No scores recorded yet. Enter your latest rounds.
          </p>
        ) : (
          scores.map((s, idx) => (
            <div
              key={s.id}
              className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700/50"
            >
              <div>
                <span className="font-bold text-emerald-400 mr-3">
                  #{idx + 1}
                </span>
                <span className="text-lg font-semibold">
                  {s.score} Stableford Points
                </span>
              </div>
              <span className="text-sm text-slate-400">{s.date}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
