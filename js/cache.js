class CacheManager {
  constructor() {
    this.booksCacheKey = "books_cache";
    this.cacheTimeKey = "books_cache_time";
    this.cacheDuration = 5 * 60 * 1000;
  }

  saveBooksToCache(booksData) {
    const cacheData = {
      data: booksData,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(this.booksCacheKey, JSON.stringify(cacheData));
  }

  getBooksFromCache() {
    const cachedData = localStorage.getItem(this.booksCacheKey);
    if (!cachedData) return null;

    const cacheInfo = JSON.parse(cachedData);
    const currentTime = new Date().getTime();
    const cacheAge = currentTime - cacheInfo.timestamp;

    if (cacheAge > this.cacheDuration) {
      this.clearBooksCache();
      return null;
    }

    return cacheInfo.data;
  }

  clearBooksCache() {
    localStorage.removeItem(this.booksCacheKey);
  }

  hasValidCache() {
    return this.getBooksFromCache() !== null;
  }
}

const cacheManager = new CacheManager();
