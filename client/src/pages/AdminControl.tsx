import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, ChevronDown, CircleDollarSign, Database, HeartHandshake, Play, Settings2, Sparkles, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/mockDb";

const navItems = [
  { label: "Overview", icon: Database },
  { label: "Users & Subscriptions", icon: Users },
  { label: "Draws & Engine", icon: Settings2 },
  { label: "Causes", icon: HeartHandshake },
  { label: "Winners", icon: Trophy },
];

export default function AdminControl() {
  const [active, setActive] = useState("Overview");
  
  // Use real counts from MockDB
  const users = db.getUsers();
  const charities = db.getCharities();
  const activeSubscribers = users.filter(u => u.isSubscribed).length;
  const prizePool = db.getDraws()[0]?.prizePool || 18420; // fallback to dummy
  
  const stats = { 
    activeSubscribers: activeSubscribers > 0 ? activeSubscribers : 482, 
    prizePool, 
    charityTotal: 9230, 
    pendingWinners: 8 
  };

  const handleSimulate = () => {
    const draw = db.simulateDraw();
    toast.success(`Simulation complete · ${draw.winningNumbers?.join(" · ")}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f3] dark:bg-[#0b110d] text-[#101b17] dark:text-[#e5eee4]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[236px] shrink-0 flex-col bg-[#10241d] dark:bg-[#151f19] px-5 py-7 text-white lg:flex">
          <a href="/" className="mb-14 flex items-center gap-3 px-2">
            <div className="brand-mark dark"><span>DH</span><i /></div>
            <span className="font-display font-semibold tracking-[-.03em]">digital heroes</span>
          </a>
          <span className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/32">control centre</span>
          <nav className="space-y-1">
            {navItems.map((item) => { 
              const Icon = item.icon; 
              return (
                <button key={item.label} onClick={() => setActive(item.label)} className={`admin-nav ${active === item.label ? "active bg-[#1f372d]" : "text-white/60 hover:text-white"} flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors`}>
                  <Icon size={17} />{item.label}
                  {item.label === "Winners" && <span className="ml-auto rounded-full bg-[#ff886d] px-2 py-0.5 text-[10px] text-white">8</span>}
                </button>
              ); 
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-white/10 bg-white/6 p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#c0f18d]"><Sparkles size={14} /> system healthy</div>
            <p className="mt-3 text-[12px] leading-5 text-white/45">All draw jobs and payment webhooks are operational.</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-black/6 dark:border-white/10 bg-[#f4f6f3] dark:bg-[#0b110d] px-6 md:px-10">
            <div className="flex items-center gap-3">
              <a href="/" className="font-display font-semibold lg:hidden">digital heroes</a>
              <span className="hidden text-sm text-[#8a9690] lg:block">Admin /</span>
              <strong className="text-sm">{active}</strong>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-[11px] text-[#849189] sm:block">Last sync: just now</span>
              <a href="/" className="button-ghost"><ArrowLeft size={14} /> Exit</a>
            </div>
          </header>

          <main className="mx-auto max-w-[1280px] px-6 py-9 md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="eyebrow"><span className="eyebrow-dot" />operations overview</div>
                <h1 className="mt-4 font-display text-[44px] font-semibold tracking-[-.07em]">Keep the good<br /><em>moving.</em></h1>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="h-10 rounded-xl bg-white dark:bg-[#131d18] dark:text-white dark:border-white/10 dark:hover:bg-[#1a261f]" onClick={() => toast("Export report is queued for download.")}><Database size={15} className="mr-2" /> Export report</Button>
                <Button className="h-10 rounded-xl bg-[#10241d] dark:bg-[#c0f18d] dark:text-black dark:hover:bg-[#a5db6b]" onClick={handleSimulate}><Play size={14} className="mr-2" /> Run simulation</Button>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="admin-stat dark:bg-[#131d18] dark:border-white/10 rounded-2xl p-5 border border-black/5 bg-white"><Users size={18} className="text-[#82b879] mb-3" /><span className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-1">active subscribers</span><strong className="text-3xl font-display">{stats.activeSubscribers}</strong><small className="block mt-2 text-xs text-gray-400">+8.4% this month</small></div>
              <div className="admin-stat dark:bg-[#131d18] dark:border-white/10 rounded-2xl p-5 border border-black/5 bg-white"><CircleDollarSign size={18} className="text-[#ff886d] mb-3" /><span className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-1">live prize pool</span><strong className="text-3xl font-display">£{stats.prizePool.toLocaleString()}</strong><small className="block mt-2 text-xs text-gray-400">£3,210 rolling jackpot</small></div>
              <div className="admin-stat dark:bg-[#131d18] dark:border-white/10 rounded-2xl p-5 border border-black/5 bg-white"><HeartHandshake size={18} className="text-[#8c6ad3] mb-3" /><span className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-1">charity contributions</span><strong className="text-3xl font-display">£{stats.charityTotal.toLocaleString()}</strong><small className="block mt-2 text-xs text-gray-400">across {charities.length} partner causes</small></div>
              <div className="admin-stat dark:bg-[#131d18] dark:border-white/10 rounded-2xl p-5 border border-black/5 bg-white"><Trophy size={18} className="text-[#c39b3f] mb-3" /><span className="text-xs text-gray-500 uppercase tracking-widest font-semibold block mb-1">pending claims</span><strong className="text-3xl font-display">{stats.pendingWinners}</strong><small className="block mt-2 text-xs text-[#c96b55]">needs review</small></div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
              <section className="admin-panel rounded-[24px] bg-white dark:bg-[#131d18] p-6 shadow-sm dark:border-white/10 border border-black/5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="card-kicker text-xs uppercase tracking-widest font-bold text-gray-400 block mb-1">draw engine</span>
                    <h2 className="panel-title font-display text-2xl font-semibold">September configuration</h2>
                  </div>
                  <span className="rounded-full bg-[#e9f5e6] dark:bg-[#1f2d25] px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#6e9368] dark:text-[#9bc293]">ready to run</span>
                </div>
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <div className="config-block">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">draw mode</span>
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f4f6f3] dark:bg-[#1a261f] p-3">
                      <strong>weighted algorithm</strong>
                      <ChevronDown size={15} className="text-[#86938b]" />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Weights numbers by score frequency.</p>
                  </div>
                  <div className="config-block">
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">jackpot rollover</span>
                    <strong className="mt-3 block font-display text-3xl tracking-[-.06em]">£3,210</strong>
                    <p className="mt-1 text-xs text-gray-500">Rolls until all 5 numbers match.</p>
                  </div>
                </div>
                <div className="mt-8 rounded-2xl bg-[#10241d] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="card-kicker text-white/40 text-xs uppercase tracking-widest font-bold block">tier distribution</span>
                      <p className="mt-1 text-sm text-white/70">Prize pool allocation per draw</p>
                    </div>
                    <Settings2 size={18} className="text-[#c0f18d]" />
                  </div>
                  <div className="mt-5 flex h-3 overflow-hidden rounded-full">
                    <div className="w-[40%] bg-[#c0f18d]" />
                    <div className="w-[35%] bg-[#8b73d5]" />
                    <div className="w-[25%] bg-[#ff886d]" />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-[11px]">
                    <span><b className="text-[#c0f18d]">40%</b> 5-number</span>
                    <span><b className="text-[#b3a4ed]">35%</b> 4-number</span>
                    <span><b className="text-[#ff9c86]">25%</b> 3-number</span>
                  </div>
                </div>
              </section>

              <section className="admin-panel rounded-[24px] bg-white dark:bg-[#131d18] p-6 shadow-sm dark:border-white/10 border border-black/5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="card-kicker text-xs uppercase tracking-widest font-bold text-gray-400 block mb-1">winner queue</span>
                    <h2 className="panel-title font-display text-2xl font-semibold">Review claims</h2>
                  </div>
                  <button className="text-[12px] font-semibold text-[#4e7f68] dark:text-[#9bc293]">View all →</button>
                </div>
                <div className="mt-6 space-y-2">
                  {[
                    {name: "Sarah M.", match: "4-number match", amount: "340", status: "Pending"},
                    {name: "David K.", match: "3-number match", amount: "75", status: "Paid"}
                  ].map((winner) => (
                    <div className="winner-row flex items-center gap-4 py-3 border-b border-gray-100 dark:border-white/5 last:border-0" key={winner.name}>
                      <div className="winner-avatar h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#1a261f] font-bold text-gray-600 dark:text-gray-300">{winner.name.slice(0, 1)}</div>
                      <div className="flex-1">
                        <strong className="block text-sm">{winner.name}</strong>
                        <span className="text-xs text-gray-500">{winner.match}</span>
                      </div>
                      <div className="text-right">
                        <strong className="block text-sm">£{winner.amount}</strong>
                        <span className={`text-xs ${winner.status === "Paid" ? "text-[#62955e] dark:text-[#9bc293]" : "text-[#c87560] dark:text-[#f49986]"}`}>{winner.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-black/6 dark:border-white/10 pt-5 text-[11px] text-[#87938c] dark:text-gray-500">
                  <Check size={14} className="mr-1 inline text-[#6ea168] dark:text-[#9bc293]" /> Payouts are held until proof is verified.
                </div>
              </section>
            </div>
            
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div className="admin-panel md:col-span-2 rounded-[24px] bg-white dark:bg-[#131d18] p-6 shadow-sm dark:border-white/10 border border-black/5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="card-kicker text-xs uppercase tracking-widest font-bold text-gray-400 block mb-1">charity management</span>
                    <h2 className="panel-title font-display text-2xl font-semibold">Partner causes</h2>
                  </div>
                  <button className="button-ghost"><HeartHandshake size={14} className="inline mr-2" /> Add charity</button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {charities.map((cause) => (
                    <div className="flex items-center gap-3 rounded-2xl bg-[#f5f7f4] dark:bg-[#1a261f] p-3" key={cause.name}>
                      <div className="cause-icon small bg-[#dff7f1] dark:bg-[#10241d] text-[#0a806c] dark:text-[#9bc293] p-2 rounded-xl">
                        <HeartHandshake size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="block text-sm">{cause.name}</strong>
                        <span className="block text-[11px] text-[#909b94]">{cause.description.substring(0,25)}...</span>
                      </div>
                      <span className="text-[12px] font-semibold text-gray-500">Active</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-panel flex flex-col justify-between bg-[#fff7f3] dark:bg-[#1c1412] p-6 rounded-[24px]">
                <div>
                  <span className="card-kicker text-xs uppercase tracking-widest font-bold text-[#b35e4c] dark:text-[#f49986] block mb-1">system note</span>
                  <h2 className="panel-title font-display text-2xl font-semibold">Transparent by design.</h2>
                  <p className="mt-4 text-sm leading-6 text-[#796f69] dark:text-gray-400">Every draw, payout and contribution has an audit trail. Keep your community close to the good.</p>
                </div>
                <button onClick={() => toast("Audit log is up to date.")} className="mt-7 flex items-center gap-2 text-[12px] font-semibold text-[#b35e4c] dark:text-[#f49986]">
                  Open audit log →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
