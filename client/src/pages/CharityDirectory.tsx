import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, HeartHandshake, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { db } from "@/lib/mockDb";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useLocation } from "wouter";

const accentMap: Record<string, string> = { 
  aqua: "bg-[#dff7f1] text-[#0a806c]", 
  violet: "bg-[#eee6ff] text-[#7350bf]", 
  coral: "bg-[#ffe7df] text-[#cc604d]", 
  lime: "bg-[#edf8cf] text-[#698d2d]" 
};

export default function CharityDirectory() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All causes");
  const categories = ["All causes", "Clean water", "Mental health", "Animal welfare", "Climate"];
  
  const charities = db.getCharities();
  
  const data = useMemo(() => {
    return charities.filter(c => {
      const matchCat = category === "All causes" || c.category === category;
      const matchQuery = query === "" || c.name.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [query, category, charities]);

  const handleSelect = (charityId: string) => {
    if (!isAuthenticated || !user) {
      toast("Sign in to select a charity for your membership.");
      return;
    }
    db.selectCharity(user.id, charityId);
    toast.success("Charity updated successfully!");
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f5f7f4] dark:bg-[#0b110d] text-[#101b17] dark:text-[#e5eee4]">
      <header className="border-b border-black/5 dark:border-white/10 bg-[#f5f7f4]/90 dark:bg-[#0b110d]/90 backdrop-blur-xl">
        <div className="container flex h-[76px] items-center justify-between">
          <a href="/" className="flex items-center gap-3"><div className="brand-mark"><span>DH</span><i /></div><span className="font-display text-[17px] font-semibold tracking-[-.03em]">digital heroes</span></a>
          <a href="/" className="button-ghost"><ArrowLeft size={15} /> Back home</a>
        </div>
      </header>
      
      <main className="container py-16 md:py-24">
        <div className="max-w-[720px]">
          <div className="eyebrow"><span className="eyebrow-dot" />the cause directory</div>
          <h1 className="section-title mt-5">Put your membership<br /><em>where it matters.</em></h1>
          <p className="mt-6 max-w-[590px] text-[17px] leading-8 text-[#68766f] dark:text-gray-400">Every hero chooses a cause. Browse the organisations in our community and find the one that feels like yours.</p>
        </div>
        
        <div className="mt-12 flex flex-col gap-4 rounded-[24px] border border-black/6 dark:border-white/10 bg-white dark:bg-[#131d18] p-4 shadow-sm md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#90a099] dark:text-gray-500" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by cause or organisation" className="h-12 rounded-xl border-0 bg-[#f5f7f4] dark:bg-[#1a261f] pl-12 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0d8b74]" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal size={16} className="ml-2 text-[#829088]" />
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-3 py-2 text-[11px] font-semibold transition ${category === item ? "bg-[#10241d] dark:bg-[#c0f18d] dark:text-black text-white" : "text-[#718079] dark:text-gray-400 hover:bg-[#eff4ef] dark:hover:bg-[#1a261f]"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-10 flex items-center justify-between">
          <p className="text-sm text-[#74817a] dark:text-gray-500">{data.length} causes in the directory</p>
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.14em] text-[#91a098]"><HeartHandshake size={15} /> community-led</span>
        </div>
        
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {data.map((charity) => (
            <article key={charity.id} className="cause-card dark:bg-[#131d18] dark:border-white/10 flex flex-col justify-between cursor-default">
              <div>
                <div className="flex items-center justify-between">
                  <div className={`cause-icon ${accentMap[charity.accent] ?? "bg-[#eef2ed] text-[#557267]"}`}><HeartHandshake size={20} /></div>
                  {charity.id === user?.charityId && <span className="rounded-full bg-[#10241d] dark:bg-[#c0f18d] text-white dark:text-black px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]">Your Cause</span>}
                  {charity.featured && charity.id !== user?.charityId && <span className="rounded-full bg-[#f1f7d9] dark:bg-[#2a301c] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#6f8e34] dark:text-[#c0f18d]">Featured</span>}
                </div>
                <div className="mt-8">
                  <span className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#92a099]">{charity.category}</span>
                  <h2 className="mt-2 font-display text-[28px] font-semibold tracking-[-.05em]">{charity.name}</h2>
                </div>
                <p className="mt-4 min-h-[54px] text-sm leading-6 text-[#6f7b75] dark:text-gray-400">{charity.description}</p>
              </div>
              
              <div className="mt-7 flex items-center justify-between border-t border-black/6 dark:border-white/10 pt-5">
                <span className="flex items-center gap-2 text-[12px] font-medium text-[#59675f] dark:text-gray-400"><Sparkles size={14} className="text-[#ff886d]" /> {charity.impact}</span>
                <Button variant="ghost" onClick={() => handleSelect(charity.id)} className="font-semibold" disabled={charity.id === user?.charityId}>
                  {charity.id === user?.charityId ? "Selected" : "Select Cause"} <ArrowRight size={17} className="ml-2" />
                </Button>
              </div>
            </article>
          ))}
          
          {data.length === 0 && (
            <div className="col-span-full rounded-[24px] border border-dashed border-black/12 dark:border-white/10 bg-white dark:bg-[#131d18] p-16 text-center">
              <p className="font-display text-2xl">No causes found</p>
              <p className="mt-2 text-sm text-[#7e8b84] dark:text-gray-500">Try a different search or filter.</p>
            </div>
          )}
        </div>
        
        <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-[24px] bg-[#10241d] dark:bg-[#1f2d25] p-8 text-white md:flex-row md:items-center md:p-10">
          <div>
            <span className="card-kicker text-white/45">your choice, your impact</span>
            <h2 className="mt-2 font-display text-3xl tracking-[-.05em]">Ready to choose your cause?</h2>
          </div>
          <a href="/#join" className="button-light dark:bg-[#c0f18d] dark:text-black">Join Digital Heroes <ArrowRight size={16} /></a>
        </div>
      </main>
    </div>
  );
}
