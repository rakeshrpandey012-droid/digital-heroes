import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileUp,
  HeartHandshake,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  UserRound,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db, Score } from "@/lib/mockDb";

function SideRail({ active = "Overview" }: { active?: string }) {
  const items = [
    { label: "Overview", href: "/dashboard", icon: Sparkles },
    { label: "My scores", href: "/dashboard#scores", icon: Trophy },
    { label: "My cause", href: "/charities", icon: HeartHandshake },
  ];
  return (
    <aside className="hidden w-[236px] shrink-0 flex-col border-r border-black/6 bg-[#eef3ee] dark:bg-[#151f19] px-5 py-7 lg:flex">
      <a href="/" className="mb-14 flex items-center gap-3 px-2">
        <div className="brand-mark">
          <span>DH</span>
          <i />
        </div>
        <span className="font-display font-semibold tracking-[-.03em] dark:text-white">
          digital heroes
        </span>
      </a>
      <nav className="space-y-1">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              className={`side-nav ${active === item.label ? "active" : ""} dark:text-gray-300`}
            >
              <Icon size={17} /> {item.label}
            </a>
          );
        })}
      </nav>
      <div className="mt-auto rounded-2xl bg-[#dcead7] dark:bg-[#1f2d25] p-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#62825d] dark:text-[#9bc293]">
          <ShieldCheck size={14} /> Member since 2026
        </div>
        <p className="mt-3 text-[12px] leading-5 text-[#72816e] dark:text-[#9ba6a0]">
          Your membership is helping fund good things every month.
        </p>
      </div>
    </aside>
  );
}

function SignInWall() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen bg-[#f5f7f4] dark:bg-[#0b110d] text-[#101b17] dark:text-[#e5eee4]">
      <header className="border-b border-black/5 dark:border-white/10">
        <div className="container flex h-[76px] items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="brand-mark">
              <span>DH</span>
              <i />
            </div>
            <span className="font-display font-semibold">digital heroes</span>
          </a>
          <a href="/" className="button-ghost">
            <ArrowLeft size={15} /> Back home
          </a>
        </div>
      </header>
      <main className="container flex min-h-[calc(100vh-76px)] items-center justify-center py-16">
        <div className="max-w-md rounded-[28px] bg-white dark:bg-[#131d18] p-10 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7f4e1] dark:bg-[#1f2d25] text-[#5f8b57] dark:text-[#9bc293]">
            <UserRound size={27} />
          </div>
          <h1 className="mt-7 font-display text-4xl tracking-[-.06em]">
            Your hero space awaits.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#728078] dark:text-[#9ba6a0]">
            Sign in to enter scores, follow your impact, and see your place in
            the next draw.
          </p>
          <Button
            onClick={() => login("subscriber")}
            className="mt-8 h-12 w-full rounded-xl bg-[#10241d] hover:bg-[#1e3b2e] dark:bg-[#c0f18d] dark:text-black dark:hover:bg-[#a5db6b]"
          >
            Sign in to continue <ArrowRight size={16} />
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function SubscriberDashboard() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [score, setScore] = useState("");
  const [playedAt, setPlayedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    if (user) {
      setScores(db.getScores(user.id));
    }
  }, [user]);

  if (isLoading) return null;
  if (!isAuthenticated || !user) return <SignInWall />;

  const handleAddScore = () => {
    if (!score || !playedAt) {
      toast.error("Please enter a score and date.");
      return;
    }
    const scoreNum = Number(score);
    if (scoreNum < 1 || scoreNum > 45) {
      toast.error("Stableford score must be between 1 and 45.");
      return;
    }
    setIsPending(true);
    setTimeout(() => {
      const result = db.addScore(user.id, playedAt, scoreNum);
      if (result.success) {
        setScores(db.getScores(user.id));
        setScore("");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setIsPending(false);
    }, 500);
  };

  const handleProof = (file: File | undefined) => {
    if (!file) return;
    setIsPending(true);
    setTimeout(() => {
      toast.success("Proof uploaded for review.");
      setIsPending(false);
    }, 1000);
  };

  const charity =
    db.getCharities().find(c => c.id === user.charityId) ||
    db.getCharities()[0];

  return (
    <div className="min-h-screen bg-[#f5f7f4] dark:bg-[#0b110d] text-[#101b17] dark:text-[#e5eee4]">
      <div className="flex min-h-screen">
        <SideRail />
        <div className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-black/6 dark:border-white/10 bg-[#f5f7f4]/90 dark:bg-[#0b110d]/90 px-6 backdrop-blur-xl md:px-10">
            <div className="flex items-center gap-2 text-[12px] text-[#849189] lg:hidden">
              <a
                href="/"
                className="font-display font-semibold text-[#10241d] dark:text-white"
              >
                digital heroes
              </a>
              <span>/</span> dashboard
            </div>
            <div className="hidden text-[13px] text-[#7e8c84] dark:text-gray-400 lg:block">
              Tuesday, 15 September 2026
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-right sm:block">
                <strong className="block text-[13px]">{user.name}</strong>
                <small className="text-[11px] text-[#8a9891] dark:text-gray-500">
                  {user.isSubscribed ? "Active member" : "Inactive"}
                </small>
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff886d] text-sm font-bold text-white">
                {user.name.slice(0, 1)}
              </div>
              <button
                onClick={() => logout()}
                className="text-[#829088] hover:text-black dark:hover:text-white"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-[1250px] px-6 py-9 md:px-10 md:py-12">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-dot" />
                  your hero space
                </div>
                <h1 className="mt-4 font-display text-[42px] font-semibold tracking-[-.07em] md:text-[52px]">
                  Keep the good
                  <br />
                  <em>rolling.</em>
                </h1>
              </div>
              <a
                href="/charities"
                className="button-dark dark:bg-[#c0f18d] dark:text-black"
              >
                Update my cause <HeartHandshake size={15} />
              </a>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="dash-stat dark bg-[#10241d] text-white">
                <span className="card-kicker text-gray-400">
                  current prize pool
                </span>
                <strong>£18,420</strong>
                <small>
                  <span className="text-[#c0f18d]">↑ 7.2%</span> from last month
                </small>
                <CircleDollarSign className="stat-icon opacity-20" />
              </div>
              <div className="dash-stat dark:bg-[#131d18]">
                <span className="card-kicker">to your cause</span>
                <strong>
                  £{(12 * (user.charityPercentage / 100)).toFixed(2)}
                </strong>
                <small>
                  {charity.name} · {user.charityPercentage}% of membership
                </small>
                <HeartHandshake className="stat-icon coral" />
              </div>
              <div className="dash-stat dark:bg-[#131d18]">
                <span className="card-kicker">total winnings</span>
                <strong>£125</strong>
                <small>
                  <span className="text-[#0b8d75]">£75 pending</span> · £50 paid
                  out
                </small>
                <Trophy className="stat-icon lime" />
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.23fr_.77fr]">
              <section
                id="scores"
                className="dashboard-panel dark:bg-[#131d18] dark:border-white/10"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <span className="card-kicker">your rolling five</span>
                    <h2 className="panel-title">Recent scores</h2>
                  </div>
                  <span className="rounded-full bg-[#edf5e9] dark:bg-[#1f2d25] px-3 py-2 text-[11px] font-semibold text-[#65845f] dark:text-[#9bc293]">
                    Stableford · 1–45
                  </span>
                </div>

                <div className="mt-8 space-y-1">
                  {scores.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No scores yet. Add one below!
                    </p>
                  )}
                  {scores.map((item, index) => (
                    <div
                      key={item.id}
                      className="score-row dark:border-white/5"
                    >
                      <span
                        className={`score-badge dark:bg-[#1a261f] ${index === 0 ? "hot bg-[#c0f18d]" : ""}`}
                      >
                        {item.score}
                      </span>
                      <div className="flex-1">
                        <strong>
                          {index === 0 ? "Latest round" : "Counted round"}
                        </strong>
                        <span className="dark:text-gray-400">
                          {new Date(item.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#9ba6a0]">
                        {index === 0 ? "current" : "counted"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 border-t border-black/6 dark:border-white/10 pt-7">
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-[#0c8f75]" />
                    <span className="text-[13px] font-semibold">
                      Add a score
                    </span>
                    <span className="text-[11px] text-[#9ba6a0]">
                      Latest five are kept automatically
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
                    <Input
                      type="number"
                      min="1"
                      max="45"
                      value={score}
                      onChange={event => setScore(event.target.value)}
                      placeholder="Score"
                      className="h-11 rounded-xl bg-[#f5f7f4] dark:bg-[#0b110d] dark:border-white/10"
                    />
                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8d9993]"
                      />
                      <Input
                        type="date"
                        value={playedAt}
                        onChange={event => setPlayedAt(event.target.value)}
                        className="h-11 rounded-xl bg-[#f5f7f4] dark:bg-[#0b110d] dark:border-white/10 pl-10"
                      />
                    </div>
                    <Button
                      disabled={isPending || !score}
                      onClick={handleAddScore}
                      className="h-11 rounded-xl bg-[#10241d] dark:bg-[#c0f18d] dark:text-black"
                    >
                      Save score
                    </Button>
                  </div>
                </div>
              </section>

              <section className="dashboard-panel dark:bg-[#131d18] dark:border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="card-kicker">your cause</span>
                    <h2 className="panel-title">{charity.name}</h2>
                  </div>
                  <div className="cause-icon small bg-[#dff7f1] dark:bg-[#10241d] text-[#0a806c] dark:text-[#9bc293]">
                    <HeartHandshake size={17} />
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-[#728078] dark:text-[#9ba6a0]">
                  {charity.description}
                </p>
                <div className="impact-meter mt-7">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span>September impact</span>
                    <span>
                      £{(12 * (user.charityPercentage / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5eee4] dark:bg-[#1a261f]">
                    <div
                      className="h-full rounded-full bg-[#8fcf8b]"
                      style={{ width: `${user.charityPercentage}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-[10px] text-[#94a098]">
                    <span>{user.charityPercentage}% contribution</span>
                    <span>Next update in 15 days</span>
                  </div>
                </div>
                <a
                  href="/charities"
                  className="mt-7 flex items-center justify-between border-t border-black/6 dark:border-white/10 pt-5 text-[12px] font-semibold text-[#467462] dark:text-[#9bc293]"
                >
                  Explore all causes <ArrowRight size={15} />
                </a>
              </section>
            </div>

            <section className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
              <div className="dashboard-panel draw-mini bg-[#10241d] text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="card-kicker text-gray-400">
                      next draw · 30 sep 2026
                    </span>
                    <h2 className="panel-title text-white">
                      Your numbers are in.
                    </h2>
                  </div>
                  <Sparkles className="text-[#c0f18d]" />
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  {scores.length === 5 ? (
                    scores.map((s, i) => (
                      <span className="number-ball" key={s.id}>
                        {s.score}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">
                      Enter {5 - scores.length} more scores
                    </span>
                  )}
                </div>
                <p className="mt-6 text-[12px] leading-5 text-white/45">
                  Scores are matched against the draw pool. Five numbers unlock
                  the rolling jackpot.
                </p>
              </div>

              <div className="dashboard-panel dark:bg-[#131d18] dark:border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="card-kicker">winnings overview</span>
                    <h2 className="panel-title">Claim status</h2>
                  </div>
                  <span className="rounded-full bg-[#fff0eb] dark:bg-[#2a1711] px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#cc654f] dark:text-[#f49986]">
                    1 action needed
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#fff7f3] dark:bg-[#1c1412] p-4">
                  <div>
                    <strong className="block text-sm">
                      £75 · 3-number match
                    </strong>
                    <span className="mt-1 block text-[11px] text-[#9a8d86]">
                      September draw · verification required
                    </span>
                  </div>
                  <label className="button-coral cursor-pointer">
                    <Upload size={14} />{" "}
                    <span>{isPending ? "Uploading…" : "Upload proof"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={event => handleProof(event.target.files?.[0])}
                    />
                  </label>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[11px] text-[#819087] dark:text-gray-500">
                  <Check size={15} className="text-[#0c9478]" /> Proof is
                  reviewed within 2 working days <ChevronDown size={13} />
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
