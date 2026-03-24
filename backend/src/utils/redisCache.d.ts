declare module './utils/redisCache' {
  class RedisCache {
    connect(): Promise<boolean>;
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    getCachedCharts(type: string, params: any): Promise<any>;
    cacheCharts(type: string, params: any, data: any): Promise<boolean>;
    invalidateChartsCache(): Promise<boolean>;
    healthCheck(): Promise<{ status: string; latency?: number; error?: string }>;
  }
  
  const redisCache: RedisCache;
  export default redisCache;
}
