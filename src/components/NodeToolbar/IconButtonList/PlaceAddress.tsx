import * as React from 'react';
import {
  Feature,
  NodeProperties,
  AccessibilityCloudProperties,
  isWheelmapProperties,
} from '../../../lib/types/Feature';

import getAddressString from '../../../lib/model/getAddressString';
import { generateMapsUrl } from '../../../lib/geo/generateMapsUrls';
import { generateShowOnOsmUrl } from '../../../lib/geo/generateOsmUrls';
import { placeNameFor } from '../../../lib/types/Feature';
import openButtonCaption from '../../../lib/geo/openButtonCaption';
import { Category } from '../../../lib/types/Categories';
import PlaceIcon from '../../icons/actions/Place';
import RouteIcon from '../../icons/actions/Route';

import { UAResult } from '../../../lib/userAgent';

function getAddressForACProperties(properties: AccessibilityCloudProperties): string | null {
  if (typeof properties.address === 'string') return properties.address;
  if (typeof properties.address === 'object') {
    if (typeof properties.address.full === 'string') return properties.address.full;
  }
  return null;
}

function getAddressForProperties(properties: NodeProperties): string | null {
  if (!isWheelmapProperties(properties)) {
    return getAddressForACProperties(properties);
  }
  return getAddressString(properties);
}

type Props = {
  feature: Feature | null,
  category: Category | null,
  userAgent: UAResult,
};

export default class PlaceAddress extends React.Component<Props, {}> {
  render() {
    const { feature, userAgent } = this.props;

    if (!feature || !feature.properties) return null;

    const placeName = placeNameFor(feature.properties, this.props.category);
    const openInMaps = generateMapsUrl(userAgent, feature, placeName);
    const showOnOsmUrl = generateShowOnOsmUrl(feature);
    const address = getAddressForProperties(feature.properties);
    const addressString = address && address.replace(/,$/, '').replace(/^,/, '');

    return (
      <React.Fragment>
        {openInMaps && (
          <a className="link-button" href={openInMaps.url}>
            <RouteIcon />
            <span>{addressString || openInMaps.caption}</span>
          </a>
        )}
        {showOnOsmUrl && (
          <a className="link-button" href={showOnOsmUrl} target="_blank" rel="noopener noreferrer">
            <PlaceIcon />
            <span>{openButtonCaption('OpenStreetMap')}</span>
          </a>
        )}
      </React.Fragment>
    );
  }
}
