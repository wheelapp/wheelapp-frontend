import * as React from 'react';
import styled from 'styled-components';
import uuidv4 from 'uuid/v4';
import { App } from '../../lib/types/App';
import colors from '../../lib/colors';
import { EquipmentInfo } from '../../lib/model/EquipmentInfo';
import { NodeProperties, YesNoLimitedUnknown, YesNoUnknown } from '../../lib/types/Feature';
import { MappingEvent, MappingEvents } from '../../lib/types/MappingEvent';
import { SearchResultCollection } from '../../lib/model/searchPlaces';
import { isOnSmallViewport } from '../../lib/ViewportSize';
import ErrorBoundary from '../ErrorBoundary';
import FullscreenBackdrop from '../FullscreenBackdrop';
import PhotoUploadInstructionsToolbar from '../PhotoUpload/PhotoUploadInstructionsToolbar';
import { PlaceFilter } from '../SearchToolbar/AccessibilityFilterModel';
import SearchButton from '../SearchToolbar/SearchButton';
import SearchToolbar from '../SearchToolbar/SearchToolbar';
import classnames from 'classnames';

type Props = {
  className?: string,

  category: string | null,

  toiletFilter: YesNoUnknown[],
  accessibilityFilter: YesNoLimitedUnknown[],
  searchQuery: string | null,
  lat: number | null,
  lon: number | null,
  zoom: number | null,
  extent: [number, number, number, number] | null,
  inEmbedMode: boolean,
  includeSourceIds: Array<string>,
  excludeSourceIds: Array<string>,
  disableWheelmapSource: boolean | null,

  isMainMenuOpen: boolean,
  isSearchBarVisible: boolean,
  isSearchToolbarExpanded: boolean,
  isSearchButtonVisible: boolean,
  shouldLocateOnStart: boolean,
  searchResults: SearchResultCollection | Promise<SearchResultCollection> | null,

  onSearchToolbarClick: () => void,
  onSearchToolbarClose: () => void,
  onClickSearchButton: () => void,
  onToggleMainMenu: () => void,
  onMainMenuHomeClick: () => void,
  onClickFullscreenBackdrop: () => void,
  onMoveEnd: () => void,
  onMapClick: () => void,
  onMarkerClick: (featureId: string, properties: NodeProperties | null) => void,
  onMappingEventClick: (eventId: string) => void,
  onError: () => void,
  onCloseMappingEventsToolbar: () => void,
  onCloseModalDialog: () => void,
  onCloseWheelchairAccessibility: () => void,
  onCloseToiletAccessibility: () => void,
  onSearchQueryChange: (searchQuery: string) => void,
  onEquipmentSelected: (placeInfoId: string, equipmentInfo: EquipmentInfo) => void,
  onShowPlaceDetails: (featureId: string | number) => void,

  // simple 3-button status editor feature
  accessibilityPresetStatus?: YesNoLimitedUnknown,

  app: App,

  // mapping event
  invitationToken: string,
  mappingEvents: MappingEvents,
  mappingEvent: MappingEvent | null,
  joinedMappingEventId: string | null,
  joinedMappingEvent?: MappingEvent,
};

type State = {
  isOnSmallViewport: boolean,
  uniqueSurveyId: string,
};

class MainView extends React.Component<Props, State> {
  props: Props;

  state: State = {
    isOnSmallViewport: isOnSmallViewport(),
    uniqueSurveyId: uuidv4(),
  };

  map: { focus: () => void, snapToFeature: () => void } | null;

  lastFocusedElement: HTMLElement | null;
  nodeToolbar: NodeToolbarFeatureLoader | null;
  searchToolbar: SearchToolbar | null;
  photoUploadCaptchaToolbar: PhotoUploadCaptchaToolbar | null;
  photoUploadInstructionsToolbar: PhotoUploadInstructionsToolbar | null;

  resizeListener = () => {
    updateTouchCapability();
    this.updateViewportSizeState();
  };

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resizeListener);
    }
    this.resizeListener();
  }

  componentWillUnmount() {
    delete this.resizeListener;
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  updateViewportSizeState() {
    this.setState({ isOnSmallViewport: isOnSmallViewport() });
  }

  focusSearchToolbar() {
    if (this.searchToolbar) {
      this.searchToolbar.focus();
    }
  }

  focusMap() {
    if (this.map) {
      this.map.focus();
    }
  }

  onClickCurrentMarkerIcon = () => {
    if (this.map) {
      this.map.snapToFeature();
    }
  };

  onMappingEventHeaderClick = () => {
    this.map && this.map.snapToFeature();
  };

  renderSearchButton() {
    return (
      <SearchButton
        onClick={event => {
          event.stopPropagation();
          // Using setTimeout to prevent touch-up events from hovering components
          // in the search toolbar
          setTimeout(() => this.props.onClickSearchButton(), 10);
        }}
        category={this.props.category}
        toiletFilter={this.props.toiletFilter}
        accessibilityFilter={this.props.accessibilityFilter}
      />
    );
  }

  renderFullscreenBackdrop() {
    const isActive =
      this.props.isMainMenuOpen ||
      this.props.isOnboardingVisible ||
      this.props.isMappingEventWelcomeDialogVisible ||
      this.props.isNotFoundVisible ||
      this.props.isPhotoUploadCaptchaToolbarVisible ||
      this.props.isPhotoUploadInstructionsToolbarVisible ||
      Boolean(this.props.photoMarkedForReport);

    return (
      <FullscreenBackdrop onClick={this.props.onClickFullscreenBackdrop} isActive={isActive} />
    );
  }

  render() {
    const { className, isMainMenuOpen, isSearchButtonVisible, inEmbedMode } = this.props;

    const isNodeRoute = Boolean(featureId);
    // TODO: const isDialogVisible = this.isAnyDialogVisible();
    const isMainMenuInBackground = isDialogVisible;

    const classNames = classnames([
      'main-view',
      className,
      // TODO: isDialogVisible ? 'is-dialog-visible' : null,
      isMainMenuOpen ? 'is-main-menu-open' : null,
      // TODO: modalNodeState ? 'is-modal' : null,
      inEmbedMode ? 'in-embed-mode' : null,
    ]);

    const searchToolbarIsHidden = isNodeRoute && this.state.isOnSmallViewport;
    const searchToolbarIsInert: boolean = searchToolbarIsHidden || isMainMenuOpen;

    return (
      <div className={classNames}>
        {!inEmbedMode && !isMainMenuInBackground && this.renderMainMenu()}
        <ErrorBoundary>
          <div className="behind-backdrop">
            {!inEmbedMode && isMainMenuInBackground && this.renderMainMenu()}
            {!inEmbedMode && this.renderSearchToolbar(searchToolbarIsInert)}
            {!inEmbedMode && isSearchButtonVisible && this.renderSearchButton()}
            {props.children}
          </div>
          {this.renderFullscreenBackdrop()}
        </ErrorBoundary>
      </div>
    );
  }
}

const StyledMainView = styled(MainView)`
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  a {
    color: ${colors.linkColor};
    text-decoration: none;
  }

  > * {
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  }

  > .rai-activity-indicator {
    display: inline-block;
    font-size: 36px;
    line-height: 0;
    top: 50%;
    left: 50%;
    position: absolute;
    transform: translate(-50%, -50%);
  }

  > .behind-backdrop {
    .toolbar {
      z-index: 1001;
    }
  }

  &.is-dialog-visible,
  &.is-modal,
  &.is-main-menu-open {
    > .behind-backdrop {
      .toolbar {
        z-index: 999;
      }
      filter: blur(5px);
      transform: scale3d(0.99, 0.99, 1);
      @media (max-width: 512px), (max-height: 512px) {
        transform: scale3d(0.9, 0.9, 1);
      }
      @media (prefers-reduced-motion: reduce) {
        transform: scale3d(1, 1, 1);
      }
      &,
      * {
        pointer-events: none;
      }
    }
  }

  &.is-modal {
    .node-toolbar,
    .toolbar {
      z-index: 1001;
    }
  }

  &.is-main-menu-open {
    > .main-menu {
      z-index: 1001;
    }
  }
`;

export default StyledMainView;
export { MainView as UnstyledMainView };
