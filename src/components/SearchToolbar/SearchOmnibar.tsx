import * as React from 'react';
import fetch from 'isomorphic-unfetch';
import useSWR from 'swr';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import { ItemRenderer, Omnibar } from '@blueprintjs/select';
import { MenuItem, HotkeysTarget2,Switch } from '@blueprintjs/core';
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
import { SearchResultCollection, SearchResultFeature, SearchResultProperties } from '../../lib/searchPlaces';
import StyledSearchButton from './OpenOmniBarButton';
import CloseLink from '../CloseLink';
import { t } from 'ttag';


type Props = {
  query: string,
  onChange: (query: string) => void,
  onSearchResultClick: (feature: SearchResultFeature | null, wheelmapFeature: WheelmapFeature | null, elasticFeature: ElasticOrPhotonFeature | null) => void,
  searchResults: SearchResultCollection | Promise<SearchResultCollection>
  // osmFeatures: SearchResultFeature[],
  categories: CategoryLookupTables,
  // wheelmapFeatures: WheelmapFeature[] | Promise<WheelmapFeature>[], // no need ?
  onClose: () => void,
  hidden: boolean,
  // closeFilterPanel: () => void,
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

  const SearchOmnibar = (props: Props) => {
    /**
     * States
     */
    const [queryDebounced, setQueryDebounced] = React.useState<string>("");
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [photonSearchResults, setPhotonSearchResults] = React.useState<SearchResultCollection>(null);
    const [wheelmapFeature, setWheelmapFeature] = React.useState<WheelmapFeature[]>(null);
    const [photonSearchResultsPromise, setPhotonSearchResultsPromise] = React.useState<Promise<SearchResultCollection>>(null);
  
    const [isFilerPanelHidden, setIsFilterPanelHidden] = React.useState<boolean>(props.hidden);
    // sending 'GET' request with body in browsers can lead to undefined behavior. elastic supports parsing the body into the 'source=' query parameter instead of the 'q=' query parameter
    const { data, error } = useSWR(
      '/api/search/accessibility-cloud.placeinfos/_search?source_content_type=application/json&source=' 
      + bodyAtQueryTime(props.query), 
      fetcher 
      );
  
    // const { data, error } = useSWR('/api/search/accessibility-cloud.placeinfos/_search?q=' + props.query, fetcher );
  
    React.useEffect(() => {
      const timeOutId = setTimeout(() => 
      props.onChange(queryDebounced), 1000);
      return () => clearTimeout(timeOutId);
    }, [queryDebounced]);
  
    React.useEffect(() => {
      const result = props.searchResults;
      if (result instanceof Promise) {
        setPhotonSearchResultsPromise(result);
        setIsLoading(true);
        result.then( result => {
          setPhotonSearchResults(result);

          const wheelmapFeature = photonSearchResults?.wheelmapFeatures
          if(wheelmapFeature instanceof Promise){
            setIsLoading(true);
            wheelmapFeature.then(result => {
              setWheelmapFeature(result);
              setIsLoading(false);
            })
          }
          

        } );
      } 
    }, [props.searchResults]);
  
    React.useEffect(() => {
      if (queryDebounced?.length > 0) {
        setIsOpen(true);
      }
    }, [queryDebounced]);
  
    const handleToggle = React.useCallback(() => {
      setIsOpen(!isOpen);
    }, []);
  
    const handleClose = React.useCallback(() => {
      setIsOpen(false);
      props.onClose();
    }, []);
  
    const handleClick = React.useCallback((_event: React.MouseEvent<HTMLElement>) => {
      setIsOpen(true);
    }, []);
    
    const handleItemSelect = React.useCallback((item: ElasticOrPhotonFeature) => {
      setIsOpen(false);
      props.onSearchResultClick(
        photonSearchResults ? photonSearchResults?.features?.find(o => String(o.properties.osm_id) === item._id) : null, 
        wheelmapFeature ? wheelmapFeature?.find(o => String(o.id) === item._id) : null, 
        item);
      setQueryDebounced("");
      
      
    }, []);
  
    const renderCloseLink = () => {
      return (
        <CloseLink
          ariaLabel={t`Clear search`}
          onClick={() => {
            setQueryDebounced(undefined);
            setIsOpen(false);
            if (props.onClose) props.onClose();
          }}
        />
      );
    }
  
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
  
  
    const renderNearByOption = () => {
      return (
        <>
          <Switch label="Near by" checked={false} onChange={null} />
        </>
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
          <span>
            <StyledSearchButton onClick={handleClick} />
            {/* {renderNearByOption()} */}
          </span>
          <PushBlueprintjsPortalToTop />
          <ErrorBoundary>
          <ResultsOmnibar
            query={queryDebounced}
            isOpen={isOpen}
            noResults={<MenuItem disabled={true} text="No results." />}
            onClose={handleClose}
            items={
              mergeElasticSearchresultsWithPhotonAPISearchresults(
                data?.hits?.hits,
                photonSearchResults?.features,
                props.categories
              ) || []
            }
            itemRenderer={resultItemRenderer}
            onItemSelect={handleItemSelect}
            onQueryChange={setQueryDebounced} 
          >
            <Switch label="Near by" checked={false} onChange={null} />
  
          </ResultsOmnibar>
          
          </ErrorBoundary>
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
  let lang: string[] = getBrowserLocaleStrings(); //.filter(function(elem) { return elem.slice(0, 2); }); // contains format like en, en_Us, en_uk, etc

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

  const osmPlaces = osm && osm.filter(osms => osms._source.properties.osm_key === 'place');
  const out = elastic && osmPlaces && merge(elastic, osmPlaces);

  return out;
};

const merge: (xs: ElasticOrPhotonFeature[], ys: ElasticOrPhotonFeature[]) => ElasticOrPhotonFeature[] = ([x, ...xs], ys) => (x ? [x, ...merge(ys, xs)] : ys);


export default SearchOmnibar;