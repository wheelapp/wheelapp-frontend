import FetchCache from '@sozialhelden/fetch-cache';
import { createContext } from 'react';
import { t } from 'ttag';
import env from '../../../env';
import { ACCategory } from '../../../model/Categories';
import ResponseError from '../../../ResponseError';
import fetch from '../../api/fetch';
import { generateSynonymToCategoryMap } from './SynonymToCategoryMap';

const fetchCache = new FetchCache({
  fetch,
  cacheOptions: {
    defaultTTL: 1 * 24 * 60 * 60 * 1000, // one day
    // Don't save more than 10000 responses in the cache. Allows infinite responses by default
    maximalItemCount: 10000,
    // When should the cache evict responses when its full?
    evictExceedingItemsBy: 'lru', // Valid values: 'lru' or 'age'
    // ...see https://github.com/sozialhelden/hamster-cache for all possible options
  },
});

setInterval(() => fetchCache.cache.evictExpiredItems(), 10000);

async function fetchAccessibilityCloudCategories(
  locale: string,
  appToken: string,
): Promise<ACCategory[]> {
  const languageCode = locale.substr(0, 2).toLowerCase();
  const baseUrl = env.REACT_APP_ACCESSIBILITY_CLOUD_BASE_URL || '';
  const url = `${baseUrl}/categories.json?appToken=${appToken}&locale=${languageCode}`;
  const response = await fetch(url);
  if (!response.ok) {
    // translator: Shown when there was an error while loading category data from the backend.
    const errorText = t`Error while loading place categories.`;
    throw new ResponseError(errorText, response);
  }
  const json = await response.json();
  return json.results as ACCategory[];
}

export async function generateCategoriesContext(
  appToken: string,
  locale: string,
) {
  const acCategories = await fetchAccessibilityCloudCategories({
    appToken,
    locale,
  });
  const synonymToCategoryMap = generateSynonymToCategoryMap(acCategories);

  return {
    synonymToCategoryMap,
  };
}

const CategoriesContext = createContext<CategoryLookupTables | undefined>(
  undefined,
);

export default CategoriesContext;
