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
import { get } from 'lodash';

import {
  Feature,
  isWheelmapFeatureId,
  sourceIdsForFeature,
  isWheelmapFeature,
} from '../lib/Feature';
import { licenseCache } from '../lib/cache/LicenseCache';
import { dataSourceCache } from '../lib/cache/DataSourceCache';
import { wheelmapFeatureCache } from '../lib/cache/WheelmapFeatureCache';
import { wheelmapLightweightFeatureCache } from '../lib/cache/WheelmapLightweightFeatureCache';
import { accessibilityCloudFeatureCache } from '../lib/cache/AccessibilityCloudFeatureCache';
import { equipmentInfoCache } from '../lib/cache/EquipmentInfoCache';
import {
  placeNameFor,
  isWheelchairAccessible,
  accessibilityName,
  normalizedCoordinatesForFeature,
  getFeatureId,
} from '../lib/Feature';

import Categories from '../lib/Categories';

import { RenderContext, DataTableEntry } from './getInitialProps';
import {
  PlaceDetailsProps,
  SourceWithLicense,
  getDataIfAlreadyResolved,
} from './PlaceDetailsProps';
import { getProductTitle } from '../lib/ClientSideConfiguration';
import { EquipmentInfo } from '../lib/EquipmentInfo';

import { PhotoModel } from '../lib/PhotoModel';

import { wheelmapFeaturePhotosCache } from '../lib/cache/WheelmapFeaturePhotosCache';
import convertWheelmapPhotosToLightboxPhotos from '../lib/cache/convertWheelmapPhotosToLightboxPhotos';

import { accessibilityCloudImageCache } from '../lib/cache/AccessibilityCloudImageCache';
import convertAcPhotosToLightboxPhotos from '../lib/cache/convertAcPhotosToLightboxPhotos';
import { translatedStringFromObject } from '../lib/i18n';
import { fetchToiletsNearFeature } from '../lib/getToiletsNearby';
import { getCategoriesForFeature } from '../../../lib/api/model/Categories';

function fetchFeature(
  featureId: string,
  appToken: string,
  useCache: boolean,
  disableWheelmapSource?: boolean
): Promise<Feature> | null {
  const isWheelmap = isWheelmapFeatureId(featureId);

  if (isWheelmap) {
    if (disableWheelmapSource) {
      return null;
    }
    return wheelmapFeatureCache.fetchFeature(featureId, appToken, useCache);
  }

  return accessibilityCloudFeatureCache.fetchFeature(featureId, appToken, useCache);
}

function fetchEquipment(
  equipmentId: string,
  appToken: string,
  useCache: boolean
): Promise<EquipmentInfo> {
  return equipmentInfoCache.fetchFeature(equipmentId, appToken, useCache);
}

async function fetchSourceWithLicense(
  featureId: string | number,
  featurePromise: Promise<Feature> | null,
  appToken: string,
  useCache: boolean
): Promise<SourceWithLicense[]> {
  if (!isWheelmapFeatureId(featureId)) {
    const feature = await featurePromise;
    const sourceIds = sourceIdsForFeature(feature);

    // console.log("loading", { sources });
    const sourcesWithLicense = sourceIds.map(sourceId =>
      dataSourceCache
        .getDataSourceWithId(sourceId, appToken)
        .then(async (source): Promise<SourceWithLicense> => {
          if (typeof source.licenseId === 'string') {
            return licenseCache.getLicenseWithId(source.licenseId, appToken).then(license => {
              return { source, license };
            });
          }
          return { source, license: null };
        })
    );

    return Promise.all(sourcesWithLicense);
  }

  return Promise.resolve([]);
}

function fetchPhotos(
  featureId: string | number,
  appToken: string,
  useCache: boolean,
  disableWheelmapSource?: boolean
) {
  const isWheelmap = isWheelmapFeatureId(featureId);
  const useWheelmap = isWheelmap && !disableWheelmapSource;

  var photosPromise = Promise.all([
    accessibilityCloudImageCache
      .getPhotosForFeature(featureId, appToken, useCache)
      .then(acPhotos => {
        if (acPhotos) {
          return convertAcPhotosToLightboxPhotos(acPhotos);
        }
        return [];
      }),
    useWheelmap
      ? wheelmapFeaturePhotosCache
          .getPhotosForFeature(featureId, appToken, useCache)
          .then(wmPhotos => {
            if (wmPhotos) {
              return convertWheelmapPhotosToLightboxPhotos(wmPhotos);
            }
            return [];
          })
      : Promise.resolve([]),
  ]).then((photoArrays: PhotoModel[][]) => {
    return [].concat(photoArrays[0], photoArrays[1]);
  });

  return photosPromise;
}

function fetchToiletsNearby(
  renderContext: RenderContext,
  featurePromise: Promise<Feature> | null
): Promise<Feature[]> | Feature[] {
  return featurePromise
    ? featurePromise.then(feature => {
        return fetchToiletsNearFeature(
          feature,
          renderContext.disableWheelmapSource || false,
          renderContext.includeSourceIds,
          renderContext.includeSourceIds
        );
      })
    : [];
}

const PlaceDetailsData: DataTableEntry<PlaceDetailsProps> = {
  async getInitialRouteProps(query, renderContextPromise, isServer): Promise<PlaceDetailsProps> {
    const featureId = query.featureId;
    const equipmentInfoId = query.equipmentId;

    try {
      if (!featureId) {
        const error: Error & { statusCode?: number } = new Error(
          'No feature id passed into placeDetailsData'
        );
        error.statusCode = 404;
        throw error;
      }

      // do not cache features on server
      const useCache = !isServer;
      const disableWheelmapSource = query.disableWheelmapSource === 'true';
      const renderContext = await renderContextPromise;
      const appToken = renderContext.app.tokenString;
      const featurePromise = fetchFeature(featureId, appToken, useCache, disableWheelmapSource);
      const photosPromise = fetchPhotos(featureId, appToken, useCache, disableWheelmapSource);
      const equipmentPromise = equipmentInfoId
        ? fetchEquipment(equipmentInfoId, appToken, useCache)
        : null;
      const lightweightFeature = !disableWheelmapSource
        ? wheelmapLightweightFeatureCache.getCachedFeature(featureId)
        : null;
      const sourcesPromise = fetchSourceWithLicense(featureId, featurePromise, appToken, true);
      const toiletsNearby = isServer
        ? undefined
        : fetchToiletsNearby(renderContext, featurePromise);

      const feature = isServer ? await featurePromise : featurePromise;
      const equipmentInfo = (isServer ? await equipmentPromise : equipmentPromise) || null;
      const sources = isServer ? await sourcesPromise : sourcesPromise;
      const photos = isServer ? await photosPromise : photosPromise;

      return {
        feature,
        featureId,
        sources,
        photos,
        lightweightFeature,
        equipmentInfoId,
        equipmentInfo,
        toiletsNearby,
      };
    } catch (e) {
      const error: Error & { parent?: any, statusCode?: number } = new Error(
        'Failed loading feature'
      );
      error.parent = e;
      error.statusCode = 404;
      throw error;
    }
  },

  storeInitialRouteProps(props: PlaceDetailsProps, appToken: string) {
    const { feature, sources, equipmentInfo } = props;

    // only store fully resolved data that comes from the server
    if (
      !feature ||
      feature instanceof Promise ||
      sources instanceof Promise ||
      equipmentInfo instanceof Promise
    ) {
      return;
    }

    // inject feature
    if (isWheelmapFeature(feature)) {
      wheelmapFeatureCache.injectFeature(feature);
    } else {
      accessibilityCloudFeatureCache.injectFeature(feature);
    }

    const sourceWithLicenseArray: SourceWithLicense[] = sources;
    // inject sources & licenses
    sourceWithLicenseArray.forEach(sourceWithLicense => {
      const { license, source } = sourceWithLicense;
      dataSourceCache.injectDataSource(source, appToken);

      if (license) {
        licenseCache.injectLicense(license, appToken);
      }
    });
  },

  getAdditionalPageComponentProps(props, isServer) {
    if (isServer) {
      return props;
    }

    let { toiletsNearby, feature } = props;
    if (!toiletsNearby) {
      // fetch toilets for client
      const featurePromise = feature instanceof Promise ? feature : Promise.resolve(feature);
      toiletsNearby = fetchToiletsNearby(props, featurePromise);
    }

    return { ...props, toiletsNearby };
  },

  getHead(props, baseUrl) {
    // @ts-ignore
    const { feature, photos, app, categories, equipmentInfo } = props;
    const { textContent, meta } = app.clientSideConfiguration;

    const renderTitle = (feature, photos) => {
      const extras = [];
      let fullTitle;
      let placeTitle;

      if (feature != null) {
        const { category, parentCategory } = getCategoriesForFeature(
          categories,
          (equipmentInfo && getDataIfAlreadyResolved(equipmentInfo)) ||
            getDataIfAlreadyResolved(feature)
        );

        fullTitle = placeTitle =
          feature.properties && placeNameFor(feature.properties, category || parentCategory);
        const accessibilityTitle =
          feature.properties && accessibilityName(isWheelchairAccessible(feature.properties));

        if (placeTitle && accessibilityTitle) {
          fullTitle = `${placeTitle}, ${accessibilityTitle}`;
        }

        const coordinates = normalizedCoordinatesForFeature(feature);
        // translator: Title for sharing a place detail page
        const productName = translatedStringFromObject(get(textContent, 'product.name'));
        const thisPlaceIsOn = t`This place is on ${productName}: ${placeTitle}`;

        if (coordinates) {
          extras.push(
            ...['longitude', 'latitude'].map((property, i) => (
              <meta
                content={String(coordinates[i])}
                property={`place:location:${property}`}
                key={`place:location:${property}`}
              />
            ))
          );
        }

        const placeDetailPath = router.generatePath('placeDetail', {
          id: getFeatureId(feature),
        });
        const ogUrl = baseUrl ? `${baseUrl}${placeDetailPath}` : placeDetailPath;

        extras.push(<meta content={ogUrl} property="og:url" key="og:url" />);

        if (placeTitle) {
          extras.push(<meta content={thisPlaceIsOn} property="og:title" key="og:title" />);

          if (meta.twitter.siteHandle || meta.twitter.creatorHandle) {
            extras.push(
              <meta content={thisPlaceIsOn} property="twitter:title" key="twitter:title" />
            );
          }
        }
      }

      if (photos.length > 0) {
        const image = photos[0].original;

        extras.push(<meta content={image} property="og:image" key="og:image" />);

        if (meta.twitter.siteHandle || meta.twitter.creatorHandle) {
          extras.push(<meta content={image} property="twitter:image" key="twitter:image" />);
        }
      }

      extras.unshift(
        <meta content="place" property="og:type" key="og:type" />,
        <title key="title">{getProductTitle(app.clientSideConfiguration, fullTitle)}</title>
      );

      return <React.Fragment>{extras}</React.Fragment>;
    };

    return renderTitle(feature, photos);
  },
};

export default PlaceDetailsData;

renderClusterPanel() {
  return (
    <div className="toolbar">
      <FeatureClusterPanel
        hidden={!this.props.activeCluster}
        inEmbedMode={this.props.inEmbedMode}
        cluster={this.props.activeCluster}
        categories={this.props.categories}
        onClose={this.props.onCloseClusterPanel}
        onSelectClusterIcon={this.onClickCurrentMarkerIcon}
        onFeatureSelected={this.props.onSelectFeatureFromCluster}
      />
    </div>
  );
}


renderNodeToolbar(isNodeRoute: boolean) {
  return (
    <div className="node-toolbar">
      <NodeToolbarFeatureLoader
        featureId={this.props.featureId}
        equipmentInfoId={this.props.equipmentInfoId}
        cluster={this.props.activeCluster}
        modalNodeState={this.props.modalNodeState}
        accessibilityPresetStatus={this.props.accessibilityPresetStatus}
        ref={nodeToolbar => (this.nodeToolbar = nodeToolbar)}
        lightweightFeature={this.props.lightweightFeature}
        feature={this.props.feature}
        equipmentInfo={this.props.equipmentInfo}
        categories={this.props.categories}
        sources={this.props.sources}
        photos={this.props.photos}
        toiletsNearby={this.props.toiletsNearby}
        onCloseWheelchairAccessibility={this.props.onCloseWheelchairAccessibility}
        onCloseToiletAccessibility={this.props.onCloseToiletAccessibility}
        hidden={!isNodeRoute}
        photoFlowNotification={this.props.photoFlowNotification}
        photoFlowErrorMessage={this.props.photoFlowErrorMessage}
        onStartPhotoUploadFlow={this.props.onStartPhotoUploadFlow}
        onClickCurrentCluster={this.props.onCloseNodeToolbar}
        onClickCurrentMarkerIcon={this.onClickCurrentMarkerIcon}
        onClose={this.props.onCloseNodeToolbar}
        onReportPhoto={this.props.onStartReportPhotoFlow}
        onEquipmentSelected={this.props.onEquipmentSelected}
        onShowPlaceDetails={this.props.onShowPlaceDetails}
        inEmbedMode={this.props.inEmbedMode}
        userAgent={this.props.userAgent}
      />
    </div>
  );
}
