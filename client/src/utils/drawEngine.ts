// File: src/utils/drawEngine.ts

interface PrizePoolInput {
  totalSubscriberCount: number;
  subscriptionFee: number; // e.g., 20 ($)
  prizePoolAllocationPercentage: number; // e.g., 0.30 (30% of subscription goes to prize pool)
  previousJackpotRollover: number;
}

interface DrawResultDistribution {
  tier5MatchPool: number;
  tier4MatchPool: number;
  tier3MatchPool: number;
  totalPoolSize: number;
}

/**
 * Calculates monthly prize pool distribution based on PRD §07 rules:
 * - 5-Number match: 40% (Rollover enabled)
 * - 4-Number match: 35% (No rollover)
 * - 3-Number match: 25% (No rollover)
 */
export function calculatePrizePool(input: PrizePoolInput): DrawResultDistribution {
  const grossPool = input.totalSubscriberCount * input.subscriptionFee * input.prizePoolAllocationPercentage;
  
  const tier5MatchPool = (grossPool * 0.40) + input.previousJackpotRollover;
  const tier4MatchPool = grossPool * 0.35;
  const tier3MatchPool = grossPool * 0.25;

  return {
    tier5MatchPool: parseFloat(tier5MatchPool.toFixed(2)),
    tier4MatchPool: parseFloat(tier4MatchPool.toFixed(2)),
    tier3MatchPool: parseFloat(tier3MatchPool.toFixed(2)),
    totalPoolSize: parseFloat((grossPool + input.previousJackpotRollover).toFixed(2)),
  };
}