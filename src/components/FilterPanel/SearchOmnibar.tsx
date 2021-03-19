import * as React from 'react';
import fetch from 'isomorphic-unfetch';
import useSWR from 'swr';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import { ItemRenderer, Omnibar } from '@blueprintjs/select';
import { MenuItem, Button, HotkeysTarget2, KeyCombo } from '@blueprintjs/core';
import { createGlobalStyle } from 'styled-components';
import Categories, { getCategoryId, CategoryLookupTables } from '../../lib/Categories';
import Icon from '../Icon';

import { PlaceNameHeader } from '../PlaceName';
import { Point } from 'geojson';
import {
  AccessibilityCloudFeature,
  AccessibilityCloudProperties,
  isWheelchairAccessible,
  WheelmapFeature,
} from '../../lib/Feature';
import Address from '../NodeToolbar/Address';
import ErrorBoundary from '../ErrorBoundary';
import { getBrowserLocaleStrings } from '../../lib/i18n';
import { SearchResultFeature, SearchResultProperties } from '../../lib/searchPlaces';
import _ from 'lodash';

type Props = {
  query: string,
  onChange: (query: string) => void,
  onSearchResultClick: (
    elasticFeature: ElasticOrPhotonFeature,
    feature: SearchResultFeature | null,
    wheelmapFeature: WheelmapFeature | null
  ) => void,
  osmFeatures: SearchResultFeature[],
  categories: CategoryLookupTables,
  wheelmapFeatures: WheelmapFeature[] | Promise<WheelmapFeature>[], // no need ?
  onClose: () => void,
};

export type ElasticOrPhotonFeature =
  | {
      _index: 'fromPhotonAPI',
      _id: string,
      _type?: string,
      _score?: 0.1,
      _source?: {
        geometry?: Point | null,
        properties:
          | SearchResultProperties
          | {
              name?: any,
              osm_id?: any,
              osm_key?: any,
              osm_type?: any,
              category?: any,
              // category?: any, // osm_key,
              extent?: [number, number, number, number] | undefined,
              type?: string,
              address?: {
                street?: any,
                housenumber?: any,
                postcode?: any,
                city?: any,
                country?: any,
                state?: any,
              },
            },
      },
    }
  | {
      _index: 'accessibility-cloud.placeinfos',
      _id: string, // AC-Id
      _type?: string,
      _score?: number,
      _source?:
        | AccessibilityCloudFeature
        | {
            geometry?: Point | null,
            properties?: AccessibilityCloudProperties | any, // AccessibilityCloudProperties seems to fail here as elastic properties are much more detailed
            tileCoordinates?: any | null,
          },
    };

const ResultsOmnibar = Omnibar.ofType<any>();

const PushBlueprintjsPortalToTop = createGlobalStyle`
  .bp3-portal {
    z-index: 10000
  }
    
  @media (max-width: 512px), (max-height: 512px) {
    .bp3-omnibar {
      left: 0 !important; 
      top: 0 !important;
      width: 100vw !important;
      max-height: 100vh;
    }
  }
`;

const bodyAtQueryTime = (actualQuery: string) => {
  return JSON.stringify({
    size: 500,
    _source: {
      includes: ['*'],
      excludes: ['tileCoordinates', 'properties.originalData'],
    },
    query: {
      function_score: {
        query: { query_string: { query: actualQuery } },
        boost: 1,
        boost_mode: 'multiply',
        functions: [
          {
            filter: { match: { 'properties.accessibility.accessibleWith.wheelchair': true } },
            weight: 1.1,
          },
        ],
      },
    },
  });
};

const fetcher = (url: string) =>
  fetch(url, {
    method: 'GET',
  }).then(r => r.json());

// fetch with body with boost at query time
const getFetcherWithBody = (qry: string) => {
  return (url: string) =>
    fetch(url, {
      method: 'GET',
      body: JSON.stringify(bodyAtQueryTime(qry)),
    }).then(r => r.json());
};

export const SearchOmnibar = (props: Props) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  // TODO fetch with body to implement boost at query-time
  // const { data, error } = useSWR('/api/search/accessibility-cloud.placeinfos/_search', getFetcherWithBody(props.query));
  const { data, error } = useSWR(
    '/api/search/accessibility-cloud.placeinfos/_search?q=' + props.query,
    fetcher
  );

  React.useEffect(() => {
    if (props.query?.length > 0) {
      setIsOpen(true);
    }
  }, [props.query]);

  const handleToggle = React.useCallback(() => {
    setIsOpen(!isOpen);
  }, []);

  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    props.onClose();
  }, []);

  const handleItemSelect = React.useCallback((item: ElasticOrPhotonFeature) => {
    setIsOpen(false);
    props.onSearchResultClick(item, null, null);

    // if (item._index === 'fromPhotonAPI') {
    //   props.onSearchResultClick(
    //     props.osmFeatures.find(f => String(f.properties.osm_id) === item._id)
    //   );
    // }
    // alert(JSON.stringify(item));
  }, []);

  const resultItemRenderer: ItemRenderer<ElasticOrPhotonFeature> = (
    item: ElasticOrPhotonFeature,
    { handleClick, modifiers, query }
  ) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    const feature = mapToA11ycloudFeature(item);
    const placeName = `${feature.name}`;
    const accessibility = isWheelchairAccessible(feature.properties);
    const address = getAddressStringFromFeature(feature.properties.address);

    const label = String(feature?.properties?.sourceName || 'OpenStreetMap');

    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        // label={(label === undefined) ? ' ' : label}
        label={label === undefined ? ' ' : label}
        // label={''}
        key={item._id}
        onClick={handleClick}
        text={
          <React.Fragment>
            <PlaceNameHeader>
              {item._source.properties.category ? (
                <Icon
                  accessibility={accessibility || null}
                  category={item._source.properties.category}
                  size="medium"
                  centered
                  ariaHidden={true}
                />
              ) : null}
              {placeName}
            </PlaceNameHeader>
            {address ? <Address role="none">{address}</Address> : null}
          </React.Fragment>
        }
      ></MenuItem>
    );
  };

  return (
    <HotkeysTarget2
      hotkeys={[
        {
          combo: 'shift + o',
          global: true,
          label: 'Show SearchOmniBar',
          onKeyDown: handleToggle,
          preventDefault: true,
        },
      ]}
    >
      <div>
        <PushBlueprintjsPortalToTop />
        {/* <ErrorBoundary> */}
        <ResultsOmnibar
          query={props.query}
          isOpen={isOpen}
          noResults={<MenuItem disabled={true} text="No results." />}
          onClose={handleClose}
          // items={mockItems}
          // items={mockItems || []}
          // items={data?.hits?.hits || []}
          items={
            mergeElasticSearchresultsWithPhotonAPISearchresults(
              data?.hits?.hits,
              props.osmFeatures,
              props.categories
            ) || []
          }
          itemRenderer={resultItemRenderer}
          onItemSelect={handleItemSelect}
          onQueryChange={props.onChange}
        ></ResultsOmnibar>
        {/* </ErrorBoundary> */}
      </div>
    </HotkeysTarget2>
  );
};

/**********************************************************************************************************************
 *
 * Helpers
 *
 */

/**
 *  @todo rewrite once removal of database union types (name and address) is completed
 *  Until then discern between name strings and name objects
 *  address is not indexed atm
 */
const getNameFromFeature = (elasticFeature: ElasticOrPhotonFeature): string => {
  const featureName = elasticFeature._source.properties.name;
  let names: object = typeof featureName === 'object' ? featureName : {};
  let name: string = typeof featureName === 'string' ? featureName : '';
  let lang: string[] = getBrowserLocaleStrings();

  if (name) {
    name = featureName;
  } else if (!(names && Object.keys(names).length === 0 && names.constructor == Object)) {
    // definitely make sure it is an object and is not empty
    lang.forEach(featureNameLanguage => {
      if (names.hasOwnProperty(featureNameLanguage)) {
        name = name === '' ? featureName[featureNameLanguage] : name; // assign the first hit to match with the first set browser locale
      }
    });
  }

  if (!name) {
    // no lang tag matches with present browser locale ? assign the first hit from the obj
    name = featureName && featureName[Object.keys(featureName)[0]];
  }

  if (typeof name === 'undefined') {
    // has no name? hacky solution
    name = String(elasticFeature?._source?.properties?.category);
  }

  return name;
};

const mapToA11ycloudFeature = (
  elasticFeature: ElasticOrPhotonFeature
): AccessibilityCloudFeature => {
  return {
    type: 'Feature',
    name: getNameFromFeature(elasticFeature),
    geometry: elasticFeature._source.geometry || null,
    properties: elasticFeature._source.properties,
  };
};

const getCategory = (categories: CategoryLookupTables, feature: SearchResultFeature) => {
  const { category, parentCategory } = Categories.getCategoriesForFeature(categories, feature);
  const shownCategory = category || parentCategory;
  const shownCategoryId = shownCategory && getCategoryId(shownCategory);
  return shownCategoryId;
};

const getAddressStringFromFeature = (featureAddress: string | object): string => {
  let parts: addressPart = typeof featureAddress === 'object' ? featureAddress : {};
  let text = typeof featureAddress === 'string' ? featureAddress : '';

  if (text) {
    return text;
  } else {
    return [
      [parts.street, parts.housenumber, parts.house].filter(Boolean).join(' '),
      [
        parts.postcode,
        parts.postalCode,
        parts.postalcode,
        parts.postal_code,
        parts.zipcode,
        parts.city,
      ]
        .filter(Boolean)
        .join(' '),
      parts.state,
      parts.country,
    ]
      .filter(Boolean)
      .join(', ');
  }
};

type addressPart = {
  city?: string | undefined,
  country?: string | undefined,
  countryCode?: string | undefined,
  country_code?: string | undefined,
  county?: string | undefined,
  district?: string | undefined,
  house?: string | undefined,
  housenumber?: string | undefined,
  postalCode?: string | undefined,
  postal_code?: string | undefined,
  postalcode?: string | undefined,
  postbox?: string | undefined,
  postcode?: string | undefined,
  region?: string | undefined,
  regions?: string | undefined,
  state?: string | undefined,
  street?: string | undefined,
  streetnumber?: string | undefined,
  full?: string | undefined,
  text?: string | undefined,
  zipcode?: string | undefined,
};

const mergeElasticSearchresultsWithPhotonAPISearchresults = (
  elasticData: ElasticOrPhotonFeature[],
  osmData: SearchResultFeature[],
  categories: CategoryLookupTables
  // wheelmapData: WheelmapFeature[] | Promise<WheelmapFeature>[]
) => {
  const elastic: Array<ElasticOrPhotonFeature> = elasticData?.map(elastic => ({
    _index: 'accessibility-cloud.placeinfos',

    _id: elastic._id,
    _score: elastic._score,
    _source: elastic._source,
  }));

  const osm: ElasticOrPhotonFeature[] = osmData?.map(osm => ({
    _index: 'fromPhotonAPI',
    _id: String(osm.properties.osm_id),
    _score: 0.1,
    _source: {
      geometry: osm.geometry,
      properties: {
        name: osm.properties.name,
        osm_id: osm.properties.osm_id,
        osm_key: osm.properties.osm_key,
        osm_type: osm.properties.osm_type,
        category: getCategory(categories, osm),
        // category: osm.properties.osm_value, // osm_key,
        extent: osm.properties.extent,
        type: osm.properties.type,
        address: {
          street: osm.properties.street,
          housenumber: osm.properties.housenumber,
          postcode: osm.properties.postcode,
          city: osm.properties.city,
          country: osm.properties.country,
          state: osm.properties.state,
        },
      },
    },
  }));

  /**
   *
   * merge 2 arrays of different length one by one and append remainder
   * a = ['a', 'b', 'c', 'd']
   * b = [1, 2, 3, 4, 5, 6, 7, 8, 9]
   * merge(a,b) = [ 'a', 1, 'b', 2, 'c', 3, 'd', 4, 5, 6, 7, 8, 9 ]
   */
  const merge: (
    xs: ElasticOrPhotonFeature[],
    ys: ElasticOrPhotonFeature[]
  ) => ElasticOrPhotonFeature[] = ([x, ...xs], ys) => (x ? [x, ...merge(ys, xs)] : ys);

  const osmOut = elastic && osm && osm.filter(osms => osms._source.properties.osm_type === 'place');

  const out = elastic && osmOut && merge(elastic, osmOut);

  // zip does not work here as it returns empty objects?
  const o = elastic && osmOut && _.zip(elastic, osmOut);

  return out;
};
