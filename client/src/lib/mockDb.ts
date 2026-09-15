export interface User {
  id: string;
  name: string;
  email: string;
  role: "public" | "subscriber" | "admin";
  charityId?: string;
  charityPercentage: number;
  isSubscribed: boolean;
  memberSince: string;
}

export interface Score {
  id: string;
  userId: string;
  date: string;
  score: number;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  accent: string;
  featured: boolean;
  impact: string;
}

export interface Draw {
  id: string;
  date: string;
  prizePool: number;
  status: "pending" | "published";
  winningNumbers?: number[];
  winners?: { name: string; match: string; amount: number; status: string }[];
}

const defaultCharities: Charity[] = [
  { id: "c1", name: "WaterAid", description: "Bringing clean water, decent toilets and good hygiene to communities worldwide.", category: "Clean water", accent: "aqua", featured: true, impact: "38% of members" },
  { id: "c2", name: "Mind UK", description: "Providing advice and support to empower anyone experiencing a mental health problem.", category: "Mental health", accent: "violet", featured: true, impact: "29% of members" },
  { id: "c3", name: "StreetVet", description: "Delivering free essential veterinary care to pets of people experiencing homelessness.", category: "Animal welfare", accent: "coral", featured: false, impact: "18% of members" },
  { id: "c4", name: "Trees for Cities", description: "Working to plant trees and green up cities worldwide to fight the climate crisis.", category: "Climate", accent: "lime", featured: false, impact: "15% of members" }
];

const defaultUsers: User[] = [
  { id: "u1", name: "Maya Patel", email: "hero@example.com", role: "subscriber", charityId: "c1", charityPercentage: 15, isSubscribed: true, memberSince: "2026-09-01" },
  { id: "u2", name: "David K.", email: "admin@example.com", role: "admin", charityPercentage: 10, isSubscribed: false, memberSince: "2026-01-01" },
  { id: "u3", name: "Sarah M.", email: "sarah@example.com", role: "subscriber", charityId: "c2", charityPercentage: 10, isSubscribed: true, memberSince: "2026-03-12" }
];

const defaultScores: Score[] = [
  { id: "s1", userId: "u1", date: "2026-09-08", score: 37 },
  { id: "s2", userId: "u1", date: "2026-08-31", score: 34 },
  { id: "s3", userId: "u1", date: "2026-08-22", score: 41 },
  { id: "s4", userId: "u1", date: "2026-08-12", score: 29 },
  { id: "s5", userId: "u1", date: "2026-08-03", score: 36 },
  { id: "s6", userId: "u3", date: "2026-09-05", score: 14 },
  { id: "s7", userId: "u3", date: "2026-08-28", score: 23 },
  { id: "s8", userId: "u3", date: "2026-08-15", score: 31 },
];

class MockDB {
  private get<T>(key: string, fallback: T): T {
    const data = localStorage.getItem(`dh_${key}`);
    return data ? JSON.parse(data) : fallback;
  }
  
  private set<T>(key: string, val: T) {
    localStorage.setItem(`dh_${key}`, JSON.stringify(val));
  }

  // Init
  init() {
    if (!localStorage.getItem("dh_users")) this.set("users", defaultUsers);
    if (!localStorage.getItem("dh_charities")) this.set("charities", defaultCharities);
    if (!localStorage.getItem("dh_scores")) this.set("scores", defaultScores);
    if (!localStorage.getItem("dh_draws")) this.set("draws", []);
  }

  // Users
  getUsers(): User[] { return this.get("users", defaultUsers); }
  getUser(id: string): User | undefined { return this.getUsers().find(u => u.id === id); }
  updateUser(id: string, updates: Partial<User>) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx > -1) {
      users[idx] = { ...users[idx], ...updates };
      this.set("users", users);
    }
  }

  // Scores
  getScores(userId?: string): Score[] {
    const all = this.get<Score[]>("scores", defaultScores);
    return userId ? all.filter(s => s.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : all;
  }
  
  addScore(userId: string, date: string, scoreVal: number): { success: boolean; message: string } {
    const allScores = this.get<Score[]>("scores", defaultScores);
    
    // Check duplicate date
    if (allScores.some(s => s.userId === userId && s.date === date)) {
      return { success: false, message: "A score already exists for this date." };
    }

    const newScore: Score = { id: Math.random().toString(36).substring(7), userId, date, score: scoreVal };
    let userScores = allScores.filter(s => s.userId === userId);
    const otherScores = allScores.filter(s => s.userId !== userId);
    
    userScores.push(newScore);
    userScores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (userScores.length > 5) userScores = userScores.slice(0, 5); // Rolling 5 logic!
    
    this.set("scores", [...otherScores, ...userScores]);
    return { success: true, message: "Score added successfully. Rolling 5 updated." };
  }

  // Charities
  getCharities(): Charity[] { return this.get("charities", defaultCharities); }
  selectCharity(userId: string, charityId: string) { this.updateUser(userId, { charityId }); }

  // Draws & Predictor Algorithm (Weighted by score frequency)
  getDraws(): Draw[] { return this.get("draws", []); }
  simulateDraw(mode: "random" | "weighted" = "weighted") {
    const draws = this.getDraws();
    const users = this.getUsers();
    const allScores = this.getScores();
    const pool = Math.floor(Math.random() * 5000) + 15000;
    
    let winningNumbers: number[] = [];

    if (mode === "weighted") {
      // Frequency algorithm: counts occurrences of each score across all rolling 5s
      const freqs: Record<number, number> = {};
      allScores.forEach(s => { freqs[s.score] = (freqs[s.score] || 0) + 1; });
      
      const poolScores: number[] = [];
      for (let i = 1; i <= 45; i++) {
        const count = freqs[i] || 0;
        // The more frequent, the more tickets in the hat (base 1 ticket)
        const weight = 1 + count; 
        for(let w=0; w<weight; w++) poolScores.push(i);
      }
      
      while(winningNumbers.length < 5) {
        const pick = poolScores[Math.floor(Math.random() * poolScores.length)];
        if(!winningNumbers.includes(pick)) winningNumbers.push(pick);
      }
    } else {
      while(winningNumbers.length < 5) {
        const pick = Math.floor(Math.random() * 45) + 1;
        if(!winningNumbers.includes(pick)) winningNumbers.push(pick);
      }
    }
    winningNumbers.sort((a, b) => a - b);

    // Evaluate winners (40/35/25 tiering)
    const tierPools = { 5: pool * 0.4, 4: pool * 0.35, 3: pool * 0.25 };
    const winners: NonNullable<Draw['winners']> = [];

    // Let's force a winner for demo if we can, or just let random happen
    // Check all subscriber's current rolling 5
    users.filter(u => u.isSubscribed).forEach(u => {
      const uScores = this.getScores(u.id).map(s => s.score);
      const matchCount = uScores.filter(s => winningNumbers.includes(s)).length;
      if (matchCount >= 3) {
        const amount = tierPools[matchCount as 3|4|5] || 0;
        winners.push({
          name: u.name,
          match: `${matchCount}-number match`,
          amount: Math.round(amount),
          status: "Pending"
        });
      }
    });

    const newDraw: Draw = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString().split("T")[0],
      prizePool: pool,
      status: "published",
      winningNumbers,
      winners
    };
    
    this.set("draws", [newDraw, ...draws]);
    return newDraw;
  }
}

export const db = new MockDB();
if (typeof window !== "undefined") {
  db.init();
}
