import { InMemoryCache, defaultDataIdFromObject } from "@apollo/client";
import { persistCache as apolloPersistCache } from "apollo3-cache-persist";
import { LOCAL_STORAGE_EXISTS } from "./consts";

interface SaleorCacheConfig {
  /**
   * Determines if the cache has to be persisted in local storage. False by default.
   */
  persistCache?: boolean;
}

/**
 * Creates cache for Apollo client.
 * @param cacheConfig Configuration for created cache.
 */
export const createSaleorCache = async ({
  persistCache = false,
}: SaleorCacheConfig) => {
  const saleorCache = new InMemoryCache({
    dataIdFromObject: obj => {
      // eslint-disable-next-line no-underscore-dangle
      if (obj.__typename === "Shop") {
        return "shop";
      }
      return defaultDataIdFromObject(obj);
    },
  });

  if (persistCache && LOCAL_STORAGE_EXISTS) {
    await apolloPersistCache({
      cache: saleorCache,
      storage: window.localStorage,
    });
  }

  return saleorCache;
};
