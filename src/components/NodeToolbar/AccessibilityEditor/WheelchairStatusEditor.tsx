import * as React from 'react';
import { t } from 'ttag';
import { AppContextConsumer } from '../../../app/context/AppContext';
import {
  accessibilityDescription,
  shortAccessibilityName,
  WheelmapFeature,
  YesNoLimitedUnknown,
} from '../../../lib/types/Feature';
import { isOnSmallViewport } from '../../../lib/ViewportSize';
import Icon from '../../Icon';
import RadioStatusEditor from './RadioStatusEditor';
import { saveWheelchairStatus } from './saveStatus';

type SaveOptions = {
  featureId: string;
  onSave: (value: YesNoLimitedUnknown) => void | null;
  onClose: () => void;
};

type Props = SaveOptions & {
  feature: WheelmapFeature; // eslint-disable-line react/no-unused-prop-types
  className?: string;
  presetStatus?: YesNoLimitedUnknown | null;
};

export default function WheelchairStatusEditor(props: Props) {
  return (
    <AppContextConsumer>
      {appContext => (
        <RadioStatusEditor
          {...props}
          hideUnselectedCaptions={true}
          undefinedStringValue="unknown"
          getValueFromFeature={feature => feature.properties.wheelchair}
          saveValue={(value: YesNoLimitedUnknown) =>
            saveWheelchairStatus({ ...props, appContext, value })
          }
          renderChildrenForValue={({
            value,
            categoryId,
          }: {
            value: YesNoLimitedUnknown;
            categoryId: string;
          }) => (
            <Icon
              accessibility={value}
              category={categoryId}
              size={isOnSmallViewport() ? 'small' : 'medium'}
              withArrow
              shadowed
              centered
            />
          )}
          shownStatusOptions={['yes', 'limited', 'no']}
          captionForValue={(value: YesNoLimitedUnknown) =>
            shortAccessibilityName(value)
          }
          descriptionForValue={(value: YesNoLimitedUnknown) =>
            accessibilityDescription(value)
          }
        >
          <header id="wheelchair-accessibility-header">{t`How wheelchair accessible is this place?`}</header>
        </RadioStatusEditor>
      )}
    </AppContextConsumer>
  );
}
