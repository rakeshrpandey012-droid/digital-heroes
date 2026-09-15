import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, CircleDollarSign, HeartHandshake, Menu, Play, ShieldCheck, Sparkles, Trophy, X, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/lib/mockDb";

function BrandMark() {
  return <div className="brand-mark" aria-label="Digital Heroes"><span>DH</span><i /></div>;
}

function Shell({ children, onLogin, isAuthenticated, theme, toggleTheme }: { children: React.ReactNode; onLogin: () => void; isAuthenticated: boolean; theme: string; toggleTheme?: () => void; }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-[#f5f7f4] dark:bg-[#0b110d] text-[#101b17] dark:text-[#e5eee4]">
    <header className="relative z-30 border-b border-black/5 dark:border-white/10 bg-[#f5f7f4]/90 dark:bg-[#0b110d]/90 backdrop-blur-xl">
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <a href="/" className="flex items-center gap-3"><BrandMark /><span className="font-display text-[17px] font-semibold tracking-[-0.03em]">digital heroes</span></a>
        <nav className="hidden items-center gap-8 text-[13px] font-medium text-[#5d6b65] dark:text-gray-400 md:flex">
          <a className="nav-link" href="/#how-it-works">How it works</a><a className="nav-link" href="/charities">Causes</a><a className="nav-link" href="/#the-draw">The draw</a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
          {isAuthenticated ? <a href="/dashboard" className="button-ghost">Open dashboard <ArrowRight size={15} /></a> : <><button onClick={onLogin} className="button-ghost">Sign in</button><a href="/#join" className="button-dark dark:bg-[#c0f18d] dark:text-black">Join the club <ArrowRight size={15} /></a></>}
        </div>
        <button aria-label="Toggle navigation" onClick={() => setOpen(!open)} className="md:hidden">{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
      {open && <div className="border-t border-black/5 dark:border-white/10 bg-[#f5f7f4] dark:bg-[#0b110d] px-6 py-5 md:hidden"><div className="flex flex-col gap-4 text-sm"><a href="/#how-it-works" onClick={() => setOpen(false)}>How it works</a><a href="/charities" onClick={() => setOpen(false)}>Causes</a><a href="/#the-draw" onClick={() => setOpen(false)}>The draw</a><button className="button-dark dark:bg-[#c0f18d] dark:text-black mt-2" onClick={onLogin}>Join the club <ArrowRight size={15} /></button></div></div>}
    </header>{children}
  </div>;
}

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const draws = db.getDraws();
  const latestDraw = draws[0] || { prizePool: 18420, winningNumbers: [7,14,23,31,42] };
  const poolStr = `£${latestDraw.prizePool.toLocaleString()}`;

  const users = db.getUsers();
  const activeSubs = users.filter(u => u.isSubscribed).length || 482;

  const onLogin = () => login("subscriber");
  
  return <Shell onLogin={onLogin} isAuthenticated={isAuthenticated} theme={theme} toggleTheme={toggleTheme}>
    <main>
      <section className="hero-section overflow-hidden">
        <div className="container grid min-h-[650px] items-center gap-12 py-20 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
          <div className="relative z-10 max-w-[650px]">
            <div className="eyebrow"><span className="eyebrow-dot" />play well. do good.</div>
            <h1 className="font-display mt-6 text-[clamp(3.5rem,7vw,6.7rem)] font-semibold leading-[.9] tracking-[-0.07em]">Your game.<br /><em>Someone’s</em><br />next chapter.</h1>
            <p className="mt-8 max-w-[480px] text-[17px] leading-8 text-[#607069] dark:text-gray-400">Digital Heroes turns your regular golf scores into monthly chances to win — while sending a meaningful slice of every membership to a cause you care about.</p>
            <div className="mt-10 flex flex-wrap items-center gap-4"><a href="#join" className="button-coral button-large">Become a hero <ArrowRight size={18} /></a><a href="#how-it-works" className="button-play"><span><Play size={14} fill="currentColor" /></span> See how it works</a></div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-[12px] font-medium text-[#718079] dark:text-gray-500"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#0f967b] dark:text-[#c0f18d]" /> Secure subscription</span><span className="flex items-center gap-2"><HeartHandshake size={16} className="text-[#0f967b] dark:text-[#c0f18d]" /> 10% minimum to charity</span></div>
          </div>
          <div className="hero-visual relative mx-auto h-[470px] w-full max-w-[560px] lg:h-[590px]">
            <div className="hero-glow" /><div className="hero-ring ring-one dark:border-white/5" /><div className="hero-ring ring-two dark:border-white/5" />
            <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
            <div className="hero-card hero-card-main dark:bg-[#131d18] dark:border-white/10"><div className="flex items-center justify-between"><span className="card-kicker text-gray-400">September draw</span><span className="live-pill"><i /> live</span></div><div className="mt-8 text-[13px] text-white/50 dark:text-gray-400">Prize pool</div><div className="mt-1 font-display text-[62px] font-semibold leading-none tracking-[-.07em] text-[#efffd7]">{poolStr}</div><div className="mt-8 flex gap-2">{(latestDraw.winningNumbers || [7,14,23,31,42]).map((n) => <span key={n} className="number-ball dark:bg-[#1a261f]">{n}</span>)}</div><div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-white/45 dark:text-gray-500"><span>Algorithm Active</span><span className="text-[#c0f18d]">★ 5 number jackpot</span></div></div>
            <div className="hero-card hero-card-float float-impact dark:bg-[#131d18] dark:border-white/10"><div className="float-icon"><HeartHandshake size={17} /></div><div><div className="card-kicker text-gray-400">this month</div><strong>£4.50</strong><p className="dark:text-gray-400">to your chosen cause</p></div></div>
            <div className="hero-card hero-card-float float-win dark:bg-[#131d18] dark:border-white/10"><Trophy size={19} className="text-[#ff886d]" /><div><div className="card-kicker text-gray-400">recent hero</div><strong>Maya won £218</strong><p className="dark:text-gray-400">4-number match</p></div></div>
            <div className="hero-stamp"><Sparkles size={13} /> 100% transparent</div>
          </div>
        </div>
        <div className="container border-t border-black/7 dark:border-white/10 py-8"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-center"><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#8a9891] dark:text-gray-500">Good things, in motion</p><div className="flex flex-wrap gap-x-12 gap-y-5">
          <div className="flex items-baseline gap-3"><strong className="font-display text-[26px] tracking-[-.05em]">£9,230</strong><span className="text-[12px] text-[#7c8983]">directed to causes</span></div>
          <div className="flex items-baseline gap-3"><strong className="font-display text-[26px] tracking-[-.05em]">{activeSubs}</strong><span className="text-[12px] text-[#7c8983]">active heroes</span></div>
          <div className="flex items-baseline gap-3"><strong className="font-display text-[26px] tracking-[-.05em]">37</strong><span className="text-[12px] text-[#7c8983]">payouts made</span></div>
        </div></div></div>
      </section>

      <section id="how-it-works" className="section-white dark:bg-[#0b110d]"><div className="container py-24"><div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr]"><div><div className="eyebrow"><span className="eyebrow-dot coral" />one membership, three moves</div><h2 className="section-title mt-5">A better kind<br />of <em>competition.</em></h2><p className="mt-6 max-w-[360px] leading-7 text-[#6c7973] dark:text-gray-400">The thrill is real, the impact is trackable, and every score helps move something forward.</p></div><div className="grid gap-4 sm:grid-cols-3">{[{n:"01",title:"Play your round",copy:"Enter your latest Stableford score. We keep your best five moving."},{n:"02",title:"Choose your cause",copy:"Send at least 10% of your membership to a charity you believe in."},{n:"03",title:"Watch the draw",copy:"Your score history shapes your odds in a transparent monthly draw."}].map((item, i) => <div key={item.n} className="process-card dark:bg-[#131d18] dark:border-white/10" style={{animationDelay: `${i * 70}ms`}}><span className="process-number text-gray-300">{item.n}</span><div className="process-line dark:bg-white/10" /><h3>{item.title}</h3><p className="dark:text-gray-400">{item.copy}</p><ChevronRight size={18} className="mt-8 text-[#ff7f69]" /></div>)}</div></div></div></section>

      <section id="the-draw" className="draw-section"><div className="container grid items-center gap-14 py-24 lg:grid-cols-[1fr_.86fr]"><div><div className="eyebrow light"><span className="eyebrow-dot lime" />the monthly draw</div><h2 className="section-title light mt-5">Good fortune,<br /><em>well spent.</em></h2><p className="mt-7 max-w-[480px] leading-8 text-white/58">A fixed part of every membership builds the prize pool. Our algorithm weights chances based on your score frequency!</p><div className="mt-10 grid max-w-[480px] gap-3 sm:grid-cols-3">{[{pct:"40%",name:"Jackpot",copy:"5-number match"},{pct:"35%",name:"Second tier",copy:"4-number match"},{pct:"25%",name:"Third tier",copy:"3-number match"}].map((tier) => <div className="tier-card border border-white/10 bg-white/5" key={tier.name}><strong>{tier.pct}</strong><span>{tier.name}</span><small>{tier.copy}</small></div>)}</div><a href="/charities" className="button-light mt-10">Explore the causes <ArrowRight size={16} /></a></div><div className="draw-panel bg-[#1a261f] border border-white/10"><div className="flex items-center justify-between"><span className="card-kicker text-gray-400">next draw · 30 sep 2026</span><CircleDollarSign className="text-[#c0f18d]" size={22} /></div><div className="mt-12 flex flex-wrap gap-3">{(latestDraw.winningNumbers || [7,14,23,31,42]).map((n) => <span key={n} className="number-ball large bg-[#223329] border border-[#2a3f33] text-white">{n}</span>)}</div><div className="mt-10 border-t border-white/10 pt-5"><div className="flex items-end justify-between"><div><span className="block text-[12px] text-white/40">current prize pool</span><strong className="font-display text-[48px] tracking-[-.06em] text-[#efffd7]">{poolStr}</strong></div><span className="rounded-full bg-[#c0f18d]/10 px-3 py-2 text-[11px] font-semibold text-[#c0f18d]">+£1,240 this month</span></div></div></div></div></section>

      <section id="join" className="join-section dark:bg-[#0b110d]"><div className="container grid items-center gap-12 py-24 lg:grid-cols-[1.1fr_.9fr]"><div><div className="eyebrow"><span className="eyebrow-dot" />ready when you are</div><h2 className="section-title mt-5">Make your next<br />round <em>count.</em></h2><p className="mt-6 max-w-[430px] leading-7 text-[#6c7973] dark:text-gray-400">Join from £12 a month. Cancel any time. Choose a charity and start building your first rolling five.</p></div><div className="join-card dark:bg-[#131d18] dark:border-white/10"><div className="flex items-center justify-between"><div><span className="card-kicker text-gray-500">digital heroes membership</span><strong className="mt-2 block font-display text-[38px] tracking-[-.06em]">£12 <small className="font-sans text-[13px] font-medium tracking-normal text-[#83908a] dark:text-gray-500">/ month</small></strong></div><Sparkles className="text-[#ff7f69]" /></div><div className="mt-7 space-y-3 text-[13px] text-[#52615a] dark:text-gray-400"><div className="flex gap-3"><span className="check-dot bg-black text-white dark:bg-[#c0f18d] dark:text-black">✓</span> Monthly draw entry included</div><div className="flex gap-3"><span className="check-dot bg-black text-white dark:bg-[#c0f18d] dark:text-black">✓</span> At least 10% to your chosen cause</div><div className="flex gap-3"><span className="check-dot bg-black text-white dark:bg-[#c0f18d] dark:text-black">✓</span> Live impact and winner updates</div></div><button onClick={onLogin} className="button-dark dark:bg-[#c0f18d] dark:text-black mt-8 w-full justify-center">Start your membership <ArrowRight size={16} /></button><p className="mt-4 text-center text-[10px] text-[#97a19c]">Secure checkout · cancel any time</p></div></div></section>
    </main>
    <footer className="border-t border-black/6 dark:border-white/10 dark:bg-[#0b110d]"><div className="container flex flex-col justify-between gap-5 py-8 text-[12px] text-[#89938e] md:flex-row md:items-center"><div className="flex items-center gap-3 text-[#14201b] dark:text-white"><BrandMark /><span className="font-display font-semibold">digital heroes</span></div><span>Play well. Do good. © 2026 Digital Heroes.</span><div className="flex gap-5"><a href="/charities">Charity directory</a><a href="#the-draw">Draw rules</a></div></div></footer>
  </Shell>;
}
