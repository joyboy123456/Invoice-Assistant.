interface CacheEntry {
  data: any;
  timestamp: number;
  size: number;
}

export class MemoryManager {
  private cache = new Map<string, CacheEntry>();
  private maxMemoryMB: number;
  private maxCacheSize: number;

  constructor(maxMemoryMB: number = 500, maxCacheSize: number = 50) {
    this.maxMemoryMB = maxMemoryMB;
    this.maxCacheSize = maxCacheSize;
  }

  // 获取当前内存使用情况
  getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
    };
  }

  // 检查内存是否超限
  isMemoryExceeded(): boolean {
    const usage = this.getMemoryUsage();
    return usage.heapUsed > this.maxMemoryMB;
  }

  // 监控内存并在必要时清理
  async monitorAndClean(): Promise<void> {
    if (this.isMemoryExceeded()) {
      console.warn(`Memory usage high: ${this.getMemoryUsage().heapUsed}MB, cleaning...`);
      await this.clearOldestEntries();
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }
    }
  }

  // 添加数据到缓存
  set(key: string, data: any, estimatedSizeMB: number = 1): void {
    // 如果缓存已满，先清理
    if (this.cache.size >= this.maxCacheSize) {
      this.clearOldestEntries(1);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      size: estimatedSizeMB,
    });
  }

  // 从缓存获取数据
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry) {
      // 更新访问时间
      entry.timestamp = Date.now();
      return entry.data;
    }
    return null;
  }

  // 删除缓存项
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // 清理最旧的缓存项
  private clearOldestEntries(count: number = 10): void {
    const entries = Array.from(this.cache.entries());
    
    // 按时间戳排序，最旧的在前
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // 删除最旧的N个
    const toDelete = entries.slice(0, Math.min(count, entries.length));
    toDelete.forEach(([key]) => {
      this.cache.delete(key);
    });

    console.log(`Cleared ${toDelete.length} oldest cache entries`);
  }

  // 清理所有缓存
  clearAll(): void {
    this.cache.clear();
    console.log('Cleared all cache entries');
  }

  // 清理特定会话的数据
  clearSession(sessionId: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(sessionId)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Cleared ${keysToDelete.length} entries for session ${sessionId}`);
  }

  // 获取缓存统计信息
  getStats(): { size: number; totalSizeMB: number; memoryUsageMB: number } {
    let totalSize = 0;
    this.cache.forEach(entry => {
      totalSize += entry.size;
    });

    return {
      size: this.cache.size,
      totalSizeMB: totalSize,
      memoryUsageMB: this.getMemoryUsage().heapUsed,
    };
  }
}

// 单例实例
export const memoryManager = new MemoryManager();
