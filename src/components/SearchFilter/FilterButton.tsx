import * as React from 'react';
import SearchIcon from './SearchIcon';
import MapButton from '../MapButton';
import { t } from 'ttag';
import styled from 'styled-components';
import { YesNoLimitedUnknown, YesNoUnknown } from '../../lib/Feature';
import { isAccessibilityFiltered } from '../../lib/Feature';
import Categories from '../../lib/Categories';
import CombinedIcon from './CombinedIcon';
//import BreadcrumbChevron from '../icons/ui-elements/BreadcrumbChevron';
import FilterIcon from './FilterIcon';
import { isOnSmallViewport } from '../../lib/ViewportSize';

type Props = {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
  className?: string,
  category: string | null,
  accessibilityFilter: YesNoLimitedUnknown[],
  toiletFilter: YesNoUnknown[],
};

const Caption = styled.div.attrs({ className: 'caption' })`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 0.75rem 0 0;
`;

function FilterButton(props: Props) {
  const classNames = ['btn-unstyled', 'filter-button',isOnSmallViewport() ? 'on-small-vp' : null, props.className];

  const { toiletFilter, accessibilityFilter, category } = props;
  const isAnyFilterSet = isAccessibilityFiltered(accessibilityFilter) || category;
  // translator: Shown in collapsed search/filter combi button when there is no category filter set
  const allPlacesCaption = t`Alle Orte`;

  return (
    <>
      {
        <MapButton
          {...props}
          aria-label={t`Filter`}
          aria-controls="filter"
          className={classNames.join(' ')}
        >
          <div>
            <FilterIcon />

            {/* <BreadcrumbChevron /> */}

            {isAnyFilterSet && (
              <CombinedIcon
                {...{ toiletFilter, accessibilityFilter, category, isMainCategory: true }}
              />
            )}

            <Caption>
              {category ? Categories.translatedRootCategoryName(category) : allPlacesCaption}
            </Caption>
          </div>
        </MapButton>
      }
    </>
  );
}

// max-width: calc(100vw - 80px);

const StyledFilterButton = styled(FilterButton)`
  > div {
    display: flex;
    flex-direction: row;
    align-items: right;
  }
  top: 120px;
  font-size: 1.2rem;

  left: 10px;
  width: auto;
  max-width: -webkit-min-content;
  min-height: 50px;
  margin-top: constant(safe-area-inset-top);
  margin-top: env(safe-area-inset-top);
  margin-left: constant(safe-area-inset-left);
  margin-left: env(safe-area-inset-left);
  white-space: nowrap;

  /* .breadcrumb-chevron {
    width: 24px;
    height: 40px;
    margin-right: 10px;
    opacity: 0.5;
  } */

  /* .filter-on-small-vp{
    font-size: 1.0rem !important;
  } */

  @media (max-width: 512px) {
    &.on-small-vp{
      font-size: 16px !important;
    }
    top: 60px;
  }

  svg.filter-icon {
    width: 20px;
    height: 20px;
    margin-left: 0.75rem;
    margin-right: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    path {
      fill: #334455;
    }
  }



`;

export default StyledFilterButton;
