import fetch from 'node-fetch';

function Page({ data }) {
  return <div>TODO</div>;
}

// This gets called on every request
// export async function getServerSideProps() {
//   // Fetch data from external API
//   const res = await fetch(`https://.../data`)
//   const data = await res.json()

//   // Pass data to the page via props
//   return { props: { data } }
// }

export default Page;


import React from 'react';
import { t } from 'ttag';

import searchPlaces, {
  searchPlacesDebounced,
  SearchResultCollection,
  SearchResultProperties,
} from '../lib/model/searchPlaces';
import { DataTableEntry } from './getInitialProps';
import { wheelmapFeatureCache } from '../lib/cache/WheelmapFeatureCache';
import { WheelmapFeature } from '../lib/types/Feature';
import { getProductTitle } from '../lib/model/ClientSideConfiguration';
import env from '../lib/env';

type SearchProps = {
  searchResults: SearchResultCollection | Promise<SearchResultCollection>,
  searchQuery: string | undefined,
  disableWheelmapSource?: boolean,
};

async function fetchWheelmapNode(
  searchResultProperties: SearchResultProperties,
  appToken: string,
  useCache: boolean
): Promise<WheelmapFeature | undefined> {
  if (!env.REACT_APP_WHEELMAP_API_KEY) {
    console.log('Warning: REACT_APP_WHEELMAP_API_KEY not set, cannot fetch place.');
    return null;
  }

  let osmId: number | null = searchResultProperties ? searchResultProperties.osm_id : null;

  if (!osmId) {
    return null;
  }

  // Only nodes with type 'N' and 'W' can be on Wheelmap.
  if (searchResultProperties.osm_type !== 'N' && searchResultProperties.osm_type !== 'W') {
    return null;
  }

  // Wheelmap stores features with osm type 'W' with negativ ids.
  // @TODO Do this in some kind of util function. (Maybe wheelmap feature cache?)
  if (searchResultProperties.osm_type === 'W') {
    osmId = -osmId;
  }

  try {
    const feature = await wheelmapFeatureCache.getFeature(String(osmId), appToken, useCache);

    if (feature == null || feature.properties == null) {
      return null;
    }

    return feature;
  } catch (error) {
    if (error.status !== 404) {
      console.error(error);
    }

    return null;
  }
}

const SearchData: DataTableEntry<SearchProps> = {
  async getInitialRouteProps(query, renderContext, isServer) {
    const searchQuery = query.q;

    let trimmedSearchQuery;
    let searchResults: Promise<SearchResultCollection> | SearchResultCollection = {
      features: [],
    };

    if (searchQuery && (trimmedSearchQuery = searchQuery.trim())) {
      searchResults = (isServer ? searchPlaces : searchPlacesDebounced)(trimmedSearchQuery, {
        lat: parseFloat(query.lat),
        lon: parseFloat(query.lon),
      });

      // Fetch search results when on server. Otherwise pass (nested) promises as props into app.
      searchResults = isServer ? await searchResults : searchResults;
    }

    return {
      searchResults,
      searchQuery,
    };
  },

  getAdditionalPageComponentProps(props, isServer) {
    if (isServer) {
      return props;
    }

    let { searchResults, disableWheelmapSource } = props;

    searchResults = Promise.resolve(searchResults).then(async results => {
      const useCache = !isServer;

      if (disableWheelmapSource) {
        return {
          ...results,
          wheelmapFeatures: [],
        };
      }

      let wheelmapFeatures: Promise<WheelmapFeature | undefined>[] = results.features.map(feature =>
        fetchWheelmapNode(feature.properties, props.app.tokenString, useCache)
      );

      // Fetch all wheelmap features when on server.
      if (isServer) {
        // @ts-ignore
        wheelmapFeatures = await Promise.all(wheelmapFeatures);
      }

      return {
        ...results,
        wheelmapFeatures,
      };
    });

    return { ...props, searchResults };
  },

  getHead(props) {
    const { app, searchQuery } = props;
    let searchTitle;

    if (searchQuery) {
      // translator: Search results window title
      searchTitle = t`Search results`;
    }

    return <title key="title">{getProductTitle(app.clientSideConfiguration, searchTitle)}</title>;
  },
};

export default SearchData;

const onSearchToolbarSubmit = (searchQuery: string) => {
  // Enter a command like `locale:de_DE` to set a new locale.
  const setLocaleCommandMatch = searchQuery.match(/^locale:(\w\w(?:_\w\w))/);

  if (setLocaleCommandMatch) {
    const { routeName, routerHistory } = this.props;
    const params = this.getCurrentParams();

    params.locale = setLocaleCommandMatch[1];

    routerHistory.push(routeName, params);
  }
};

renderSearchToolbar(isInert: boolean) {
  return (
    <SearchToolbar
      ref={searchToolbar => (this.searchToolbar = searchToolbar)}
      categories={this.props.categories}
      hidden={!this.props.isSearchBarVisible}
      inert={isInert}
      category={this.props.category}
      showCategoryMenu={!this.props.disableWheelmapSource}
      searchQuery={this.props.searchQuery}
      searchResults={this.props.searchResults}
      accessibilityFilter={this.props.accessibilityFilter}
      toiletFilter={this.props.toiletFilter}
      onChangeSearchQuery={this.props.onSearchQueryChange}
      onAccessibilityFilterButtonClick={this.props.onAccessibilityFilterButtonClick}
      onClick={this.props.onSearchToolbarClick}
      onSubmit={onSearchToolbarSubmit}
      onClose={this.props.onSearchToolbarClose}
      isExpanded={this.props.isSearchToolbarExpanded}
      hasGoButton={this.state.isOnSmallViewport}
    />
  );
}
