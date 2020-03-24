import * as React from 'react';
import { AppContextConsumer } from '../../../app/context/AppContext';
import {
  Feature,
  isWheelmapFeatureId,
  isWheelmapProperties,
  YesNoLimitedUnknown,
} from '../../../lib/model/Feature';
import filterAccessibility from '../../../lib/model/filterAccessibility';
import AccessibilityDetailsTree from './AccessibilityDetailsTree';
import AccessibilitySourceDisclaimer from './AccessibilitySourceDisclaimer';
import AccessibleDescription from './AccessibleDescription';
import Description from './Description';
import StyledFrame from './StyledFrame';
import WheelchairAndToiletAccessibility from './WheelchairAndToiletAccessibility';

type Props = {
  featureId: string | number | null;
  cluster: any;
  presetStatus: YesNoLimitedUnknown | null;
  feature: Feature | null;
  toiletsNearby: Feature[] | null;
  isLoadingToiletsNearby: boolean;
};

export default function PlaceAccessibilitySection(props: Props) {
  const {
    featureId,
    feature,
    toiletsNearby,
    isLoadingToiletsNearby,
    cluster,
  } = props;
  const properties = feature && feature.properties;
  const isWheelmapFeature = isWheelmapFeatureId(featureId);

  const accessibilityTree =
    properties &&
    !isWheelmapProperties(properties) &&
    typeof properties.accessibility === 'object'
      ? properties.accessibility
      : null;
  const filteredAccessibilityTree = accessibilityTree
    ? filterAccessibility(accessibilityTree)
    : null;
  const accessibilityDetailsTree = filteredAccessibilityTree && (
    <AccessibilityDetailsTree details={filteredAccessibilityTree} />
  );
  let description: string = null;
  if (
    properties &&
    isWheelmapProperties(properties) &&
    typeof properties.wheelchair_description === 'string'
  ) {
    description = properties.wheelchair_description;
  }
  const descriptionElement = description ? (
    <Description>{description}</Description>
  ) : null;

  return (
    <StyledFrame noseOffsetX={cluster ? 67 : undefined}>
      <WheelchairAndToiletAccessibility
        isEditingEnabled={isWheelmapFeature}
        feature={feature}
        toiletsNearby={toiletsNearby}
        isLoadingToiletsNearby={isLoadingToiletsNearby}
      />
      {description && descriptionElement}
      <AccessibleDescription properties={properties as any} />
      {accessibilityDetailsTree}
      <AppContextConsumer>
        {appContext => (
          <AccessibilitySourceDisclaimer
            properties={properties as any}
            appToken={appContext.app.tokenString}
          />
        )}
      </AppContextConsumer>
    </StyledFrame>
  );
}
