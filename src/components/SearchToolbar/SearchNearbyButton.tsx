import * as React from 'react';
import SearchIcon from './SearchIcon';
import MapButton from '../MapButton';
import { t } from 'ttag';
import styled from 'styled-components';

import BreadcrumbChevron from '../icons/ui-elements/BreadcrumbChevron';
import { Switch } from '@blueprintjs/core';

type Props = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  className?: string,
};

const Caption = styled.div.attrs({ className: 'caption' })`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 0.75rem 0 0;
`;

function SearchNearbyButton(props: Props) {
  const classNames = ['btn-unstyled', 'search-nearby-button', props.className];

  // translator: Shown in collapsed search/filter combi button when there is no category filter set
  const searchPlacesnearbyCaption = t`Nearby?`;

  return (
    <MapButton
      {...props}
      aria-label={t`search`}
      aria-controls="search"
      className={classNames.join(' ')}
    >
      <div>
        {/* <SearchIcon /> */}
        <Switch checked={false} onChange={null} className="nearby-switch" label="Nearby"></Switch>
        {/* <BreadcrumbChevron /> */}

        {/* <Caption>{searchPlacesnearbyCaption}</Caption> */}
      </div>
    </MapButton>
  );
}

const StyledSearchNearbyButton = styled(SearchNearbyButton)`
  > div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  font-size: 1.2rem;

  top: 120px;
  width: auto;
  max-width: calc(100vw - 80px);
  min-height: 50px;
  margin-top: constant(safe-area-inset-top);
  margin-top: env(safe-area-inset-top);
  margin-left: constant(safe-area-inset-left);
  margin-left: env(safe-area-inset-left);

  .nearby-switch {
    height: 20px;
    margin-left: 0.75rem;
    margin-right: 10px;
  }

  .breadcrumb-chevron {
    width: 24px;
    height: 40px;
    margin-right: 10px;
    opacity: 0.5;
  }

  svg.search-icon {
    width: 20px;
    height: 20px;
    margin-left: 0.75rem;
    path {
      fill: #334455;
    }
  }
`;

export default StyledSearchNearbyButton;
