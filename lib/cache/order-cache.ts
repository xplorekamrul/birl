// Simple in-memory cache for order statistics
// In production, consider using Redis or similar

interface CacheEntry<T> {
   data: T;
   timestamp: number;
   ttl: number;
}

class OrderCache {
   private cache: Map<string, CacheEntry<any>> = new Map();
   private readonly DEFAULT_TTL = 60 * 1000; // 1 minute

   set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
      this.cache.set(key, {
         data,
         timestamp: Date.now(),
         ttl,
      });
   }

   get<T>(key: string): T | null {
      const entry = this.cache.get(key);

      if (!entry) return null;

      const isExpired = Date.now() - entry.timestamp > entry.ttl;

      if (isExpired) {
         this.cache.delete(key);
         return null;
      }

      return entry.data as T;
   }

   delete(key: string): void {
      this.cache.delete(key);
   }

   clear(): void {
      this.cache.clear();
   }

   // Clear expired entries
   cleanup(): void {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
         if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
         }
      }
   }

   // Generate cache key for vendor stats
   getVendorStatsKey(vendorId: string, startDate?: string, endDate?: string): string {
      return `vendor:${vendorId}:stats:${startDate || "all"}:${endDate || "all"}`;
   }

   // Generate cache key for vendor orders
   getVendorOrdersKey(vendorId: string, filters: any): string {
      return `vendor:${vendorId}:orders:${JSON.stringify(filters)}`;
   }
}

// Singleton instance
export const orderCache = new OrderCache();

// Cleanup expired entries every 5 minutes
if (typeof window === "undefined") {
   setInterval(() => {
      orderCache.cleanup();
   }, 5 * 60 * 1000);
}
