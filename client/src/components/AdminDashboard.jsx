import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({ totalUsers: 0, activeSubscribers: 0, totalPrizePool: 0 });

  useEffect(() => {
    // Fetch metrics from backend API
    fetch('/api/admin/reports/analytics', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error('Error loading analytics:', err));
  }, []);

  const triggerSimulation = async () => {
    const res = await fetch('/api/admin/draw/simulate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    alert(`Simulation Run! Estimated Prize Pool: £${data.simulatedPrizePool}`);
  };

  return (
    <div className="admin-container p-8 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Control Panel</h1>
      
      {/* Analytics Grid (§11) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-3xl font-bold mt-1">{analytics.totalUsers}</p>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Active Subscribers</p>
          <p className="text-3xl font-bold mt-1 text-green-400">{analytics.activeSubscribers}</p>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Current Prize Pool</p>
          <p className="text-3xl font-bold mt-1 text-yellow-400">£{analytics.totalPrizePool}</p>
        </div>
      </div>

      {/* Draw Management Tools */}
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Draw Operations & Simulation</h3>
        <button
          onClick={triggerSimulation}
          className="px-6 py-2 bg-green-400 text-black font-semibold rounded hover:bg-green-300 transition"
        >
          Run Monthly Draw Simulation
        </button>
      </div>
    </div>
  );
}