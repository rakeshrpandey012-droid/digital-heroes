// components/Leaderboard/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, TrendingUp, Heart } from 'lucide-react';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [timeframe, setTimeframe] = useState('alltime');
  const [sortBy, setSortBy] = useState('winnings');
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/leaderboard/${timeframe}?sortBy=${sortBy}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setLeaderboard(response.data.leaderboard);
      setCurrentUserRank(response.data.currentUserRank);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortLabel = () => {
    const labels = {
      winnings: '🏆 Total Winnings',
      scores: '⛳ Average Score',
      charity: '❤️ Charity Contribution'
    };
    return labels[sortBy];
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatValue = () => {
    if (sortBy === 'winnings') {
      return (val) => `₹${val.toFixed(2)}`;
    } else if (sortBy === 'scores') {
      return (val) => `${val.toFixed(1)} pts`;
    } else {
      return (val) => `₹${val.toFixed(2)}`;
    }
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <div className="header-content">
          <Trophy className="header-icon" size={40} />
          <h1>Leaderboard</h1>
          <p>See where you stand among top performers</p>
        </div>

        {/* Current User Rank Card */}
        {currentUserRank && (
          <div className="user-rank-card">
            <div className="rank-display">
              <span className="rank-medal">{getRankMedal(currentUserRank.rank)}</span>
              <div className="rank-info">
                <p className="rank-label">Your Rank</p>
                <p className="rank-position">#{currentUserRank.rank}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="leaderboard-controls">
        <div className="timeframe-tabs">
          {['alltime', 'monthly', 'weekly'].map((frame) => (
            <button
              key={frame}
              className={`tab ${timeframe === frame ? 'active' : ''}`}
              onClick={() => setTimeframe(frame)}
            >
              {frame === 'alltime' ? 'All Time' : frame === 'monthly' ? 'Monthly' : 'Weekly'}
            </button>
          ))}
        </div>

        <div className="sort-buttons">
          {['winnings', 'scores', 'charity'].map((sort) => (
            <button
              key={sort}
              className={`sort-btn ${sortBy === sort ? 'active' : ''}`}
              onClick={() => setSortBy(sort)}
              title={getSortLabel()}
            >
              {sort === 'winnings' && '🏆'}
              {sort === 'scores' && '⛳'}
              {sort === 'charity' && '❤️'}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="leaderboard-table-wrapper">
        {loading ? (
          <div className="loading">Loading leaderboard...</div>
        ) : leaderboard.length > 0 ? (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th className="value-column">{getSortLabel()}</th>
                <th className="extra-info">Subscription</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, idx) => {
                let displayValue = '';
                if (sortBy === 'winnings') displayValue = formatValue()(user.totalWinnings || 0);
                else if (sortBy === 'scores') displayValue = formatValue()(user.avgScore || 0);
                else displayValue = formatValue()(user.charityContribution || 0);

                return (
                  <tr
                    key={user._id}
                    className={`leaderboard-row ${
                      user._id === currentUserRank?._id ? 'current-user' : ''
                    } ${idx < 3 ? 'top-3' : ''}`}
                  >
                    <td className="rank-cell">
                      <span className="medal">{getRankMedal(user.rank)}</span>
                    </td>
                    <td className="player-cell">
                      <div className="player-info">
                        <img
                          src={user.profileImage || '/default-avatar.png'}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="player-avatar"
                        />
                        <span className="player-name">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="value-cell">{displayValue}</td>
                    <td className="extra-info">
                      {user['subscription.plan']?.toUpperCase() || 'MONTHLY'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No leaderboard data available</div>
        )}
      </div>

      {/* Leaderboard Info */}
      <div className="leaderboard-info">
        <div className="info-card">
          <TrendingUp size={20} />
          <div>
            <h4>Leaderboard Updates</h4>
            <p>Rankings update after each draw completion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
