import FetchCache from '@sozialhelden/fetch-cache';
import get from 'lodash/get';
import values from 'lodash/values';
import env from '../env';
import { App } from '../model/App';
import { LinkData } from '../model/ClientSideConfiguration';
import fetch from './api/fetch';

interface AppWithRelatedLinks extends App {
  related?: {
    appLinks?: {
      [key: string]: LinkData;
    };
  };
}

export function getAppURLForHostName(
  hostName: string,
  appToken: string,
): string {
  const baseUrl = env.REACT_APP_ACCESSIBILITY_APPS_BASE_URL;
  // Allow test deployments with hashes in their domain name.
  // All deployments with the same prefix can share a common app configuration that has been setup
  // in the backend.
  const canonicalHostName = hostName.replace(
    /-[a-z0-9]+\.preview\.wheelmap\.org$/,
    '.preview.wheelmap.org',
  );
  return `${baseUrl}/apps/${canonicalHostName}.json?appToken=${appToken}`;
}

const fetchCache = new FetchCache({
  fetch,
  cacheOptions: {
    defaultTTL: 1 * 60 * 60 * 1000,
    // Don't save more than 10000 responses in the cache. Allows infinite responses by default
    maximalItemCount: 10000,
    // When should the cache evict responses when its full?
    evictExceedingItemsBy: 'lru', // Valid values: 'lru' or 'age'
    // ...see https://github.com/sozialhelden/hamster-cache for all possible options
  },
});

setInterval(() => fetchCache.cache.evictExpiredItems(), 10000);

export async function getAppForHostname(hostname: string): Promise<App> {
  // For bootstrapping, we can use Wheelmap's token - it can load any app's info.
  // With a different app token, you can only load the app the token belongs to.
  const appToken = env.REACT_APP_ACCESSIBILITY_CLOUD_APP_TOKEN;
  const url = getAppURLForHostName(hostname, appToken);

  const response = await fetchCache.fetch(url);
  if (!response.ok) {
    throw new Error(`Could not get app for given hostname "${hostname}".`);
  }
  const app = (await response.json()) as AppWithRelatedLinks;

  // extract the appLinks from the related property and put them under
  // clientSideConfiguration.customMainMenuLinks
  const { related, ...appDataWithoutRelatedProp } = app;
  const customMainMenuLinks: LinkData[] = values(
    get(related, 'appLinks') || {},
  );

  return {
    ...appDataWithoutRelatedProp,
    clientSideConfiguration: {
      ...appDataWithoutRelatedProp.clientSideConfiguration,
      customMainMenuLinks,
    },
  };
}
