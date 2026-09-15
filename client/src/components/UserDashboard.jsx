import React from 'react';

export default function UserDashboard({ user, scores, charity, winnings }) {
  return (
    <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 gap-6 p-8 text-white bg-black min-h-screen">
      {/* Subscription Status */}
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h4 className="text-gray-400 text-sm uppercase tracking-wider">Subscription Status</h4>
        <p className={`text-2xl font-bold mt-1 ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
          {user.isActive ? 'Active Member' : 'Inactive / Renewal Needed'}
        </p>
        <p className="text-sm text-gray-400 mt-2">Next Renewal: {user.renewalDate || 'N/A'}</p>
      </div>

      {/* Selected Charity */}
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h4 className="text-gray-400 text-sm uppercase tracking-wider">Chosen Cause</h4>
        <p className="text-2xl font-bold mt-1">{charity.name}</p>
        <p className="text-sm text-green-400 mt-2">{charity.percentage}% of subscription directed here</p>
      </div>

      {/* Winnings Overview */}
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h4 className="text-gray-400 text-sm uppercase tracking-wider">Winnings Overview</h4>
        <p className="text-2xl font-bold mt-1">£{winnings.totalWon}</p>
        <p className="text-sm text-yellow-400 mt-2">Status: {winnings.paymentStatus}</p>
      </div>

      {/* Participation Summary */}
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
        <h4 className="text-gray-400 text-sm uppercase tracking-wider">Draw Participation</h4>
        <p className="text-xl font-bold mt-1">Draws Entered: {user.drawsEntered}</p>
        <p className="text-sm text-gray-400 mt-2">Upcoming Draw: 30 September 2026</p>
      </div>
    </div>
  );
}