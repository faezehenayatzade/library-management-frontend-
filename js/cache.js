function createCacheManager() {
  const booksCacheKey = "books_cache";
  const cacheTimeKey = "books_cache_time";
  const cacheDuration = 5 * 60 * 1000;

  function saveBooksToCache(booksData) {
    const cacheData = {
      data: booksData,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem(booksCacheKey, JSON.stringify(cacheData));
  }

  function getBooksFromCache() {
    const cachedData = localStorage.getItem(booksCacheKey);
    if (!cachedData) return null;

    let cacheInfo;
    try {
      cacheInfo = JSON.parse(cachedData);
    } catch (error) {
      console.error("Error parsing cache data:", error);
      clearBooksCache();
      return null;
    }

    const currentTime = new Date().getTime();
    const cacheAge = currentTime - cacheInfo.timestamp;

    if (cacheAge > cacheDuration) {
      clearBooksCache();
      return null;
    }

    return cacheInfo.data;
  }

  function clearBooksCache() {
    localStorage.removeItem(booksCacheKey); 
    localStorage.removeItem(cacheTimeKey);   
  }

  function hasValidCache() {
    return getBooksFromCache() !== null;
  }

  return {
    saveBooksToCache,
    getBooksFromCache,
    clearBooksCache,
    hasValidCache,
  };
}

const cacheManager = createCacheManager();
