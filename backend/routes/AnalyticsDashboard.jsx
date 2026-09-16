// components/Dashboard/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';
import axios from 'axios';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [scoreData, setScoreData] = useState([]);
  const [winningsData, setWinningsData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [stats, setStats] = useState({
    averageScore: 0,
    highestScore: 0,
    totalWinnings: 0,
    winRate: 0,
    streakDays: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/analytics', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const { scores, winnings, statistics } = response.data;

      // Format score data for chart (last 30 entries)
      const formattedScores = scores
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30)
        .map(score => ({
          date: new Date(score.date).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric'
          }),
          score: score.score,
          status: score.score >= 30 ? 'high' : 'normal'
        }));

      // Format winnings data
      const formattedWinnings = winnings
        .sort((a, b) => new Date(a.drawDate) - new Date(b.drawDate))
        .map(win => ({
          date: new Date(win.drawDate).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric'
          }),
          amount: win.prizeAmount,
          tier: win.tier
        }));

      setScoreData(formattedScores);
      setWinningsData(formattedWinnings);
      setStats(statistics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading your analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Your Analytics</h1>
        <p>Track your performance, winnings, and progress</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <Target size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Average Score</p>
            <h3 className="stat-value">{stats.averageScore.toFixed(1)}</h3>
            <span className="stat-unit">out of 45</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <Award size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Highest Score</p>
            <h3 className="stat-value">{stats.highestScore}</h3>
            <span className="stat-unit">Best performance</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Winnings</p>
            <h3 className="stat-value">₹{stats.totalWinnings.toLocaleString()}</h3>
            <span className="stat-unit">All-time earnings</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Win Rate</p>
            <h3 className="stat-value">{stats.winRate.toFixed(1)}%</h3>
            <span className="stat-unit">Success rate</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        {/* Score Trend Chart */}
        <div className="chart-container full-width">
          <div className="chart-header">
            <h2>⛳ Score Trend (Last 30)</h2>
            <div className="chart-controls">
              <button
                className={chartType === 'line' ? 'active' : ''}
                onClick={() => setChartType('line')}
              >
                Line Chart
              </button>
              <button
                className={chartType === 'bar' ? 'active' : ''}
                onClick={() => setChartType('bar')}
              >
                Bar Chart
              </button>
            </div>
          </div>
          {scoreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 45]} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #64748b',
                      borderRadius: '8px'
                    }}
                    cursor={{ stroke: '#3b82f6' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 45]} />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #64748b',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No score data available. Start entering your scores!</div>
          )}
        </div>

        {/* Winnings Distribution */}
        <div className="chart-container half-width">
          <div className="chart-header">
            <h2>💰 Winnings Over Time</h2>
          </div>
          {winningsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={winningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #64748b',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="amount" fill="#fbbf24" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No winnings yet. Keep playing!</div>
          )}
        </div>

        {/* Win Tier Distribution */}
        <div className="chart-container half-width">
          <div className="chart-header">
            <h2>🎯 Win Tier Breakdown</h2>
          </div>
          {winningsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={calculateTierDistribution(winningsData)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderTierLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {['#3b82f6', '#8b5cf6', '#ec4899'].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #64748b',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">Win distribution will appear here</div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="insights-section">
        <h2>💡 Your Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <p className="insight-title">🔥 Current Streak</p>
            <p className="insight-value">{stats.streakDays} days</p>
            <p className="insight-desc">Keep entering scores to maintain your streak!</p>
          </div>

          <div className="insight-card">
            <p className="insight-title">📈 Improvement</p>
            <p className="insight-value">+{calculateImprovement(scoreData).toFixed(1)}%</p>
            <p className="insight-desc">Your score is improving over time</p>
          </div>

          <div className="insight-card">
            <p className="insight-title">🎲 Next Draw</p>
            <p className="insight-value">2 weeks</p>
            <p className="insight-desc">Keep your scores updated for better chances!</p>
          </div>

          <div className="insight-card">
            <p className="insight-title">❤️ Charity Impact</p>
            <p className="insight-value">₹{(stats.totalWinnings * 0.1).toLocaleString()}</p>
            <p className="insight-desc">Your charitable contribution so far</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const calculateTierDistribution = (winningsData) => {
  const distribution = {
    '5-Match': 0,
    '4-Match': 0,
    '3-Match': 0
  };

  winningsData.forEach(win => {
    distribution[`${win.tier}-Match`]++;
  });

  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
};

const renderTierLabel = (entry) => {
  return entry.value > 0 ? `${entry.name} (${entry.value})` : '';
};

const calculateImprovement = (scoreData) => {
  if (scoreData.length < 2) return 0;
  const firstHalf = scoreData.slice(0, Math.floor(scoreData.length / 2));
  const secondHalf = scoreData.slice(Math.floor(scoreData.length / 2));

  const avgFirst = firstHalf.reduce((sum, item) => sum + item.score, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((sum, item) => sum + item.score, 0) / secondHalf.length;

  return ((avgSecond - avgFirst) / avgFirst) * 100;
};

export default AnalyticsDashboard;
