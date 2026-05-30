/**
 * Simple in-memory TTL cache for expensive read-only queries.
 * Keys expire after `ttlMs` milliseconds.
 * Not shared across processes — fine for single-process Node deployments.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic cleanup every 60 s
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
    if (this.cleanupTimer.unref) this.cleanupTimer.unref();
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  /** Invalidate all keys matching a prefix pattern */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

export const cache = new MemCache();

/** TTL constants */
export const TTL = {
  DASHBOARD: 30_000,   // 30 s  — live KPIs, short TTL
  REPORTS:   120_000,  // 2 min — aggregate charts
  LISTS:     15_000,   // 15 s  — frequently-mutated lists
} as const;
