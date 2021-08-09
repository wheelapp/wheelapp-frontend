import { t } from 'ttag';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';

import Toolbar from '../Toolbar';
import CategoryMenu from './CategoryMenu';
import AccessibilityFilterMenu from './AccessibilityFilterMenu';

import colors from '../../lib/colors';
import { isAccessibilityFiltered, WheelmapFeature } from '../../lib/Feature';
import { PlaceFilter } from './AccessibilityFilterModel';
import { CategoryLookupTables } from '../../lib/Categories';
import ErrorBoundary from '../ErrorBoundary';
import { isOnSmallViewport } from '../../lib/ViewportSize';

export type Props = PlaceFilter & {
  categories: CategoryLookupTables,
  hidden: boolean,
  inert: boolean,
  category: null | string,
  showCategoryMenu?: boolean,
  searchQuery: null | string,
  onAccessibilityFilterButtonClick: (filter: PlaceFilter) => void,
  isExpanded: boolean,
  minimalTopPosition: number,
};

type State = {
  isCategoryFocused: boolean,
};

const StyledToolbar = styled(Toolbar)`
  transition: opacity 0.3s ease-out, transform 0.15s ease-out, width 0.15s ease-out,
    height 0.15s ease-out;
  display: flex;
  flex-direction: column;
  padding: 0;
  border-top: none;
  border-radius: 8px;
  bottom: auto !important;

  .search-results {
    padding: 0 10px 5px 10px;
  }

  > div {
    > header {
      /* Add relative positioning for browsers not supporting position sticky. */
      position: relative;
      position: sticky;
      display: flex;
      top: 0;
      height: 50px;
      min-height: 50px;
      z-index: 1;
      border-bottom: 1px ${colors.borderColor} solid;
      background: white;

      > form {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
      }
    }

    > section {
      overflow: auto;
    }
  }

  .search-icon {
    position: absolute;
    /* center vertically */
    top: 50%;
    transform: translate(0, -50%);
    left: 1em;
    pointer-events: none;
    width: 1em;
    height: 1em;
    opacity: 0.5;
  }

  .close-link {
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translate(0, -50%);
    background-color: transparent;
    display: flex;
    flex-direction: row-reverse;
    &.has-open-category {
      left: 8px;
    }
  }

  @media (max-width: 512px), (max-height: 512px) {
    &.toolbar-iphone-x {
      input,
      input:focus {
        background-color: white;
      }
    }

    border-top: 0;
    position: fixed;

    &.on-small-vp {
      top: 50px !important;
    }

    width: 100%;
    max-height: 100%;
    right: 0;
    left: 0;
    margin: 0;
    padding-right: max(constant(safe-area-inset-right), 0px);
    padding-left: max(constant(safe-area-inset-left), 0px);
    padding-right: max(env(safe-area-inset-right), 0px);
    padding-left: max(env(safe-area-inset-left), 0px);
    margin-top: constant(safe-area-inset-top);
    margin-top: env(safe-area-inset-top);
    transform: translate3d(0, 0, 0) !important;
    z-index: 1000000000;
    border-radius: 0;

    .isExpanded {
      left: 10px;
      width: calc(100% - 80px);
      max-height: 100%;
      max-width: 320px;
      margin: 0;
    }

    > div > header,
    .search-results,
    ${CategoryMenu} {
      padding: 0;
    }

    .search-results .link-button {
      margin: 0;
    }

    @media (max-height: 400px) {
      .category-button {
        flex-basis: 16.666666% !important;
      }
    }
  }

  .search-results {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .rai-activity-indicator {
    display: flex !important;
    justify-content: center;
    height: 4em;
    align-items: center;
  }
`;

const FilterToolbar = (props: Props) => {
  const [isCategoryFocused, setIsCategoryFocused] = React.useState<boolean>(false);

  React.useEffect(() => {}, []);

  const renderCategoryMenu = () => {
    if (!props.category && !props.isExpanded) return null;
    if (!props.showCategoryMenu) return null;

    return (
      <CategoryMenu
        onFocus={() => setIsCategoryFocused(true)}
        onBlur={() => {
          setTimeout(() => setIsCategoryFocused(false));
        }}
        category={props.category}
        accessibilityFilter={props.accessibilityFilter}
      />
    );
  };

  const renderAccessibilityFilterToolbar = () => {
    const {
      accessibilityFilter,
      isExpanded,
      toiletFilter,
      onAccessibilityFilterButtonClick,
      category,
    } = props;

    if (!isAccessibilityFiltered(accessibilityFilter) && !isExpanded) return null;

    return (
      <AccessibilityFilterMenu
        accessibilityFilter={accessibilityFilter}
        toiletFilter={toiletFilter}
        category={category}
        onButtonClick={onAccessibilityFilterButtonClick}
        onBlur={() => {
          setTimeout(() => setIsCategoryFocused(false));
        }}
      />
    );
  };

  const renderFilters = () => {
    return (
      <React.Fragment>
        {renderCategoryMenu()}
        {renderAccessibilityFilterToolbar()}
      </React.Fragment>
    );
  };

  const { searchQuery, hidden, inert, isExpanded } = props;

  let filterMenu = null;

  if (searchQuery) {
  } else {
    filterMenu = renderFilters();
  }

  const classNames = [isOnSmallViewport() ? 'on-small-vp' : null, isExpanded ? 'isExpanded' : null];

  return (
    <StyledToolbar
      inert={inert}
      hidden={hidden}
      minimalHeight={75}
      isSwipeable={false}
      enableTransitions={false}
      minimalTopPosition={props.minimalTopPosition}
      role="search"
      className={classNames.join(' ')}
    >
      <ErrorBoundary>
        <section
        // onTouchStart={() =>  this.blur()}
        >
          {filterMenu}
        </section>

        {/* Touch event handler: remove? replace? */}
      </ErrorBoundary>
    </StyledToolbar>
  );
};

export default FilterToolbar;
