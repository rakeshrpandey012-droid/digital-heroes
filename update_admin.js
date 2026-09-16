const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminControl.tsx', 'utf8');

const mainStart = content.indexOf('<main className="mx-auto max-w-[1280px]');
const mainEnd = content.lastIndexOf('</main>') + 7;
const mainBlock = content.substring(mainStart, mainEnd);

const renderContentFn = \
  const renderContent = () => {
    switch (active) {
      case "Draws & Engine":
        return (
          <main className="mx-auto max-w-[1280px] px-6 py-9 md:px-10 md:py-12">
            <h2 className="font-display text-3xl font-semibold mb-8">Draw Engine & Simulations</h2>
            <div className="admin-panel rounded-[24px] bg-white dark:bg-[#131d18] p-8 shadow-sm dark:border-white/10 border border-black/5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-semibold">Simulate Next Draw</h3>
                  <p className="text-sm text-gray-500 mt-1">Run the weighted algorithm against current active subscribers to preview distribution.</p>
                </div>
                <Button onClick={handleSimulate} className="bg-[#10241d] hover:bg-[#1e3b2e] dark:bg-[#c0f18d] dark:text-black dark:hover:bg-[#a5db6b]">
                  <Play size={16} className="mr-2" /> Run Simulation
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/20">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Jackpot (40%)</span>
                  <strong className="block text-2xl mt-1 text-[#c0f18d]">£{Math.round(stats.prizePool * 0.4).toLocaleString()}</strong>
                  <span className="text-xs text-gray-400">Rolls if no 5-match</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/20">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Tier 2 (35%)</span>
                  <strong className="block text-2xl mt-1 text-[#b3a4ed]">£{Math.round(stats.prizePool * 0.35).toLocaleString()}</strong>
                  <span className="text-xs text-gray-400">4-number matches</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-black/20">
                  <span className="block text-xs font-semibold text-gray-500 uppercase">Tier 3 (25%)</span>
                  <strong className="block text-2xl mt-1 text-[#ff9c86]">£{Math.round(stats.prizePool * 0.25).toLocaleString()}</strong>
                  <span className="text-xs text-gray-400">3-number matches</span>
                </div>
              </div>
            </div>
          </main>
        );
      case "Winners":
        return (
          <main className="mx-auto max-w-[1280px] px-6 py-9 md:px-10 md:py-12">
            <h2 className="font-display text-3xl font-semibold mb-8">Winner Verification</h2>
            <div className="admin-panel rounded-[24px] bg-white dark:bg-[#131d18] p-8 shadow-sm dark:border-white/10 border border-black/5">
              <div className="space-y-4">
                {[
                  { name: "Sarah M.", match: "4-number match", amount: "340", status: "Pending", proof: "screenshot_12.jpg" },
                  { name: "David K.", match: "3-number match", amount: "75", status: "Pending", proof: "scores.png" }
                ].map(w => (
                  <div key={w.name} className="flex items-center justify-between p-4 border rounded-xl border-gray-100 dark:border-white/5">
                    <div>
                      <strong className="block">{w.name} <span className="text-[#f49986] text-xs ml-2">£{w.amount}</span></strong>
                      <span className="text-xs text-gray-500">{w.match} · {w.proof}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toast.success("Payout approved!")}><Check size={14} className="mr-1 text-green-500" /> Approve Payout</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        );
      case "Charity":
      case "Causes":
        return (
          <main className="mx-auto max-w-[1280px] px-6 py-9 md:px-10 md:py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-semibold">Charity Management</h2>
              <button className="button-ghost"><HeartHandshake size={14} className="inline mr-2" /> Add Cause</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {charities.map(cause => (
                <div className="admin-panel p-5 rounded-2xl bg-white dark:bg-[#131d18]" key={cause.name}>
                  <strong className="block">{cause.name}</strong>
                  <span className="block text-xs text-gray-500 mt-1">{cause.category}</span>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm" className="text-red-500">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        );
      case "Users & Subscriptions":
        return (
          <main className="mx-auto max-w-[1280px] px-6 py-9 md:px-10 md:py-12">
            <h2 className="font-display text-3xl font-semibold mb-8">Users Management</h2>
            <div className="admin-panel p-8 rounded-[24px] bg-white dark:bg-[#131d18]">
               <p className="text-gray-500">Total Users: {users.length} | Active Subscribers: {stats.activeSubscribers}</p>
            </div>
          </main>
        );
      case "Overview":
      default:
        return (\ + mainBlock + \);
    }
  };
\;

content = content.replace('  return (\n    <div className="min-h-screen bg-[#f4f6f3]', renderContentFn + '\n  return (\n    <div className="min-h-screen bg-[#f4f6f3]');
content = content.replace(mainBlock, '{renderContent()}');

fs.writeFileSync('client/src/pages/AdminControl.tsx', content);
console.log('updated');
