import * as React from 'react';
import SearchIcon from './SearchIcon';
import MapButton from '../MapButton';
import { t } from 'ttag';
import styled from 'styled-components';

import BreadcrumbChevron from '../icons/ui-elements/BreadcrumbChevron';

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

function SearchButton(props: Props) {
  const classNames = ['btn-unstyled', 'omnisearchbar-button', props.className];

  // translator: Shown in collapsed search/filter combi button when there is no category filter set
  const searchPlacesCaption = t`Search`;

  return (
    <MapButton
      {...props}
      aria-label={t`search`}
      aria-controls="search"
      className={classNames.join(' ')}
    >
      <div>
        <SearchIcon />

        <BreadcrumbChevron />

        <Caption>{searchPlacesCaption}</Caption>
      </div>
    </MapButton>
  );
}

// max-width: calc(100vw - 80px);

const StyledSearchButton = styled(SearchButton)`
  > div {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  font-size: 1.2rem;

  width: auto;

  max-width: -webkit-min-content;
  min-height: 50px;
  margin-top: constant(safe-area-inset-top);
  margin-top: env(safe-area-inset-top);
  margin-left: constant(safe-area-inset-left);
  margin-left: env(safe-area-inset-left);

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

export default StyledSearchButton;
