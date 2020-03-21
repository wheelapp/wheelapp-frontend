import { CategoryLookupTables } from '../api/model/Categories';
import { generateLookupTables } from '../cache/CategoryCache';

// load categories
const rawCategoryListsPromise = getRawCategoryLists({
  appToken: app.tokenString,
  locale: preferredLocaleString,
  disableWheelmapSource: overriddenWheelmapSource === 'true',
});

if (preferredLocaleString && rawCategoryLists) {
  injectLookupTables(preferredLocaleString, rawCategoryLists);
}

export const categoriesCache = new CategoryCache({
  reloadInBackground: true,
  maxAllowedCacheAgeBeforeReload: 1000 * 60 * 60, // 1 hour
});

const CategoryLookupTables = generateLookupTables(rawCategoryLists);
