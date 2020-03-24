import get from 'lodash/get';
import { t } from 'ttag';
import { AppContext } from '../../../app/context/AppContext';
import { trackEvent } from '../../../lib/Analytics';
import { getCategoriesForFeature } from '../../../lib/api/model/Categories';
import { wheelmapFeatureCache } from '../../../lib/cache/WheelmapFeatureCache';
import { wheelmapLightweightFeatureCache } from '../../../lib/cache/WheelmapLightweightFeatureCache';
import config from '../../../lib/config';
import fetch from '../../../lib/global-context/api/fetch';
import { trackingEventBackend } from '../../../lib/global-context/api/TrackingEventBackend';
import {
  CategoryLookupTables,
  getCategoryId,
} from '../../../lib/types/Categories';
import {
  Feature,
  YesNoLimitedUnknown,
  YesNoUnknown,
} from '../../../lib/types/Feature';

type ExternalSaveOptions<T> = {
  featureId: string;
  categories: CategoryLookupTables;
  feature: Feature;
  value: T;
  onSave: (value: T) => void | null;
  onClose: () => void;
  appContext: AppContext;
};

type SaveOptions<T> = ExternalSaveOptions<T> & {
  url: string;
  propertyName: string;
  jsonPropertyName: string;
};

function trackAttributeChanged<T>(options: SaveOptions<T>) {
  const {
    value,
    categories,
    feature,
    featureId,
    propertyName,
    appContext,
  } = options;

  const { category, parentCategory } = getCategoriesForFeature(
    categories,
    feature,
  );

  const categoryId = getCategoryId(category);
  const parentCategoryId = getCategoryId(parentCategory);

  trackingEventBackend.track(appContext.app, {
    type: 'AttributeChanged',
    category: categoryId ? categoryId : 'unknown',
    parentCategory: parentCategoryId ? parentCategoryId : undefined,
    placeInfoId: featureId,
    attributePath: `properties.${propertyName}`,
    previousValue: get(feature, `properties.${propertyName}`),
    organizationId: appContext.app.organizationId,
    appId: appContext.app._id,
    newValue: value,
  });
}

function save<T>(options: SaveOptions<T>): Promise<void> {
  const { url, value, featureId, propertyName } = options;

  const formData = new FormData();
  formData.append(options.jsonPropertyName, String(value));
  const body = formData;

  const requestOptions = {
    method: 'PUT',
    body,
    serializer: 'urlencoded',
    headers: {
      Accept: 'application/json',
    },
  };

  return fetch(url, requestOptions)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
    .then(json => {
      trackEvent({
        category: 'UpdateAccessibilityData',
        action: propertyName,
        label: String(value),
      });
      trackAttributeChanged(options);
      [wheelmapFeatureCache, wheelmapLightweightFeatureCache].forEach(cache => {
        if (cache.getCachedFeature(String(featureId))) {
          cache.updateFeatureAttribute(String(featureId), {
            [propertyName]: value,
          });
        }
      });
      if (typeof options.onSave === 'function') options.onSave(value);
    })
    .catch(e => {
      if (typeof options.onClose === 'function') options.onClose();
      // translator: Shown after marking a place did not work, for example because the connection was interrupted
      window.alert(
        t`Sorry, this place could not be marked because of an error: ${e}`,
      );

      trackEvent({
        category: 'UpdateAccessibilityData',
        action: propertyName,
        label: 'failed',
      });
    });
}

export function saveToiletStatus(options: ExternalSaveOptions<YesNoUnknown>) {
  const url = `${config.wheelmapApiBaseUrl}/api/nodes/${options.featureId}/update_toilet.js?api_key=${config.wheelmapApiKey}`;
  return save({
    ...options,
    url,
    propertyName: 'wheelchair_toilet',
    jsonPropertyName: 'toilet',
  });
}

export function saveWheelchairStatus(
  options: ExternalSaveOptions<YesNoLimitedUnknown>,
) {
  const url = `${config.wheelmapApiBaseUrl}/api/nodes/${options.featureId}/update_wheelchair.js?api_key=${config.wheelmapApiKey}`;
  return save({
    ...options,
    url,
    propertyName: 'wheelchair',
    jsonPropertyName: 'wheelchair',
  });
}
