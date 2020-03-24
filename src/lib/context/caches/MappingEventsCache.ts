import URLDataCache from './URLDataCache';
import { MappingEvents, MappingEvent } from '../../model/MappingEvent';
import { App } from '../../model/App';
import { IImage } from '../../model/Image';
import env from '../../env';
import FetchCache from '@sozialhelden/fetch-cache';

interface HasRelatedImages {
  related?: {
    images?: {
      [key: string]: IImage;
    };
  };
}

type MappingEventsResponse = {
  results: MappingEvents;
} & HasRelatedImages;

type MappingEventResponse = MappingEvent & HasRelatedImages;

const fetchCache = new FetchCache({
  fetch,
  cacheOptions: {
    defaultTTL: 60 * 1000,
    // Don't save more than 10000 responses in the cache. Allows infinite responses by default
    maximalItemCount: 10000,
    // When should the cache evict responses when its full?
    evictExceedingItemsBy: 'lru', // Valid values: 'lru' or 'age'
    // ...see https://github.com/sozialhelden/hamster-cache for all possible options
  },
});

const baseUrl = env.REACT_APP_ACCESSIBILITY_APPS_BASE_URL || '';

const addRelatedImages = (mappingEvent, images) => ({
  ...mappingEvent,
  images: Object.keys(images)
    .map(_id => images[_id])
    .filter(image => image.objectId === mappingEvent._id),
});

export async function getMappingEvents(app: App): Promise<MappingEvent[]> {
  const url = `${baseUrl}/mapping-events.json?appToken=${app.tokenString}&includeRelated=images`;
  const response = await fetchCache.fetch(url);
  if (!response.ok) {
    throw new Error(`Could not get mapping events.`);
  }
  const responseJson = (await response.json()) as MappingEventsResponse;
  return responseJson.results.map(e =>
    addRelatedImages(e, responseJson.related.images),
  );
}

export async function getMappingEvent(
  app: App,
  _id: string,
): Promise<MappingEvent> {
  const url = `${baseUrl}/mapping-events/${_id}.json?appToken=${app.tokenString}&includeRelated=images`;
  const response = await fetchCache.fetch(url);
  if (!response.ok) {
    throw new Error(`Could not get mapping event.`);
  }
  const mappingEvent = (await response.json()) as MappingEventResponse;
  return addRelatedImages(mappingEvent, mappingEvent.related.images);
}
