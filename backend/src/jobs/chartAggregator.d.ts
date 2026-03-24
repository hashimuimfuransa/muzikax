declare module './jobs/chartAggregator' {
  export function initChartAggregator(): void;
  export function aggregateDailyStats(): Promise<void>;
  export function updateAllChartScores(): Promise<void>;
  export function cleanupOldData(): Promise<void>;
}
