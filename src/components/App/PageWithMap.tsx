import 'focus-visible';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import includes from 'lodash/includes';
import dynamic from 'next/dynamic';
import queryString from 'query-string';
import * as React from 'react';
import 'react-activity/dist/react-activity.css';
import { trackModalView } from '../../lib/Analytics';
import config from '../../lib/config';
import { trackingEventBackend } from '../../lib/global-context/api/TrackingEventBackend';
import { ModalNodeState } from '../../lib/ModalNodeState';
import { EquipmentInfo, EquipmentInfoProperties } from '../../lib/model/EquipmentInfo';
import { SearchResultCollection } from '../../lib/model/searchPlaces';
import { RouterHistory } from '../../lib/RouterHistory';
import savedState, { getJoinedMappingEventId as readStoredJoinedMappingEventId, saveState, setJoinedMappingEventData, setJoinedMappingEventId as storeJoinedMappingEventId } from '../../lib/savedState';
import { App as AppModel } from '../../lib/types/App';
import { Feature, getFeatureId, isAccessibilityFiltered, isToiletFiltered, NodeProperties, YesNoLimitedUnknown, YesNoUnknown } from '../../lib/types/Feature';
import { canMappingEventBeJoined, isMappingEventVisible, MappingEvent, MappingEvents } from '../../lib/types/MappingEvent';
import { hasBigViewport } from '../../lib/ViewportSize';
import { Cluster } from '../Map/Cluster';
import { PlaceFilter } from '../SearchToolbar/AccessibilityFilterModel';
import './App.css';
import './Global.css';
import MainView, { UnstyledMainView } from './MainView';







const DynamicMap = dynamic(import('../Map/Map'), {
  ssr: false,
  loading: () => <MapLoading />,
});

interface Props extends PlaceDetailsProps {
  className?: string,
  router: Router,
  routerHistory: RouterHistory,
  routeName: string,
  userAgent: UAResult,
  searchQuery?: string | null,
  searchResults?: SearchResultCollection | Promise<SearchResultCollection>,
  category?: string,
  app: AppModel,
  lat: string | null,
  lon: string | null,
  zoom: string | null,
  extent: [number, number, number, number] | null,
  inEmbedMode: boolean,
  mappingEvents: MappingEvents,
  mappingEvent?: MappingEvent,

  includeSourceIds: Array<string>,
  excludeSourceIds: Array<string>,
  disableWheelmapSource?: boolean,
  overriddenAppId?: boolean,

  toiletFilter: YesNoUnknown[],
  accessibilityFilter: YesNoLimitedUnknown[],
};

interface State {
  mappingEvents: MappingEvents,
  isOnboardingVisible: boolean,
  joinedMappingEventId: string | null,
  joinedMappingEvent: MappingEvent | null,
  isMainMenuOpen: boolean,
  modalNodeState: ModalNodeState,
  accessibilityPresetStatus?: YesNoLimitedUnknown | null,
  isSearchBarVisible: boolean,
  isOnSmallViewport: boolean,

  activeCluster?: Cluster | null,

  // map controls
  lat?: number | null,
  lon?: number | null,
  isSpecificLatLonProvided: boolean,
  zoom?: number | null,
  extent?: [number, number, number, number] | null,
};


// filters mapping events for the active app & shown mapping event
function filterMappingEvents(
  mappingEvents: MappingEvents,
  appId: string,
  activeEventId?: string
): MappingEvents {
  return mappingEvents
    .filter(event => isMappingEventVisible(event) || activeEventId === event._id)
    .filter(event => appId === event.appId);
}

class App extends React.Component<Props, State> {
  props: Props;

  state: State = {
    lat: null,
    lon: null,
    isSpecificLatLonProvided: false,
    zoom: null,
    mappingEvents: filterMappingEvents(
      this.props.mappingEvents,
      this.props.app._id,
      this.props.mappingEvent && this.props.mappingEvent._id
    ),
    isOnboardingVisible: false,
    joinedMappingEventId: null,
    joinedMappingEvent: null,
    isMainMenuOpen: false,
    modalNodeState: null,
    accessibilityPresetStatus: null,
    isOnSmallViewport: false,
  };

  map: any;

  mainView: UnstyledMainView;

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> {
    const placeDetailsRoute = props.routeName === 'placeDetail' || props.routeName === 'equipment';
    if (placeDetailsRoute) {
      const { accessibilityFilter, toiletFilter, category } = props;

      newState.isSearchBarVisible =
        !isAccessibilityFiltered(accessibilityFilter) &&
        !isToiletFiltered(toiletFilter) &&
        !category;
    }

    return newState;
  }

  componentDidMount() {
    const { routeName, inEmbedMode } = this.props;

    const shouldStartInSearch = routeName === 'map' && !inEmbedMode;

    if (shouldStartInSearch) {
      this.openSearch(true);
    }

    this.setupMappingEvents();

    trackingEventBackend.track(this.props.app, {
      type: 'AppOpened',
      query: queryString.parse(window.location.search),
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // update filter, to include change in shown mapping event
    if (prevProps.mappingEvent !== this.props.mappingEvent) {
      this.setupMappingEvents();
    }
  }

  setupMappingEvents() {
    const mappingEvents = filterMappingEvents(
      this.props.mappingEvents,
      this.props.app._id,
      this.props.mappingEvent && this.props.mappingEvent._id
    );
    this.setState({ mappingEvents });
    this.initializeJoinedMappingEvent();
  }

  initializeJoinedMappingEvent() {
    const {
      mappingEvents,
      routeName,
      router: { query },
    } = this.props;

    let joinedMappingEventId = readStoredJoinedMappingEventId();
    const joinedMappingEvent = joinedMappingEventId
      ? mappingEvents.find(event => event._id === joinedMappingEventId)
      : null;
    const state = {
      joinedMappingEvent,
      joinedMappingEventId,
      isMappingEventWelcomeDialogVisible: false,
    };

    if (routeName === 'mappingEventJoin') {
      const mappingEventIdToJoin = query.id;
      const mappingEventToJoin = mappingEvents.find(event => event._id === mappingEventIdToJoin);
      if (mappingEventToJoin && canMappingEventBeJoined(mappingEventToJoin)) {
        state.isMappingEventWelcomeDialogVisible = true;
      }
    }

    // invalidate already locally stored mapping event if it already expired
    if (!joinedMappingEvent || !canMappingEventBeJoined(joinedMappingEvent)) {
      joinedMappingEventId = null;
      storeJoinedMappingEventId(joinedMappingEventId);
      setJoinedMappingEventData();
    }

    this.setState(state);
  }

  openSearch(replace: boolean = false) {
    if (this.props.routeName === 'search') {
      return;
    }

    const params = this.getCurrentParams() as any;

    delete params.id;
    delete params.eid;

    if (replace) {
      this.props.routerHistory.replace('search', params);
    } else {
      this.props.routerHistory.push('search', params);
    }

    if (this.mainView) this.mainView.focusSearchToolbar();
  }

  closeSearch() {
    if (this.props.routeName !== 'search') {
      return;
    }

    const params = this.getCurrentParams();

    this.props.routerHistory.push('map', params);
  }

  onClickSearchButton = () => ();

  onToggleMainMenu = (isMainMenuOpen: boolean) => {
    this.setState({ isMainMenuOpen });
  };

  onMainMenuHomeClick = () => {
    saveState({ onboardingCompleted: 'false' });
    this.setState({ isOnboardingVisible: true });

    const params = this.getCurrentParams() as any;
    delete params.id;
    delete params.eid;
    this.props.routerHistory.push('map', params);
  };

  onMoveEnd = (state: Partial<State>) => {
    let { zoom, lat, lon } = state;

    // Adjust zoom level to be stored in the local storage to make sure the user can
    // see some places when reloading the app after some time.
    const lastZoom = String(
      Math.max(zoom || 0, config.minZoomWithSetCategory, config.minZoomWithoutSetCategory)
    );

    saveState({
      'map.lastZoom': lastZoom,
      'map.lastCenter.lat': String(lat),
      'map.lastCenter.lon': String(lon),
      'map.lastMoveDate': new Date().toString(),
    });

    this.setState({ extent: null, lat, lon, zoom });
  };

  onMapClick = () => {
    if (this.state.isSearchToolbarExpanded) {
      this.closeSearch();
      this.mainView && this.mainView.focusMap();
    }
  };

  showSelectedFeature = (
    featureId: string | number,
    properties: NodeProperties | EquipmentInfoProperties | any
  ) => {
    const featureIdString = featureId.toString();
    const { routerHistory } = this.props;

    // show equipment inside their place details
    let routeName = 'placeDetail';
    const params = this.getCurrentParams() as any;

    params.id = featureIdString;
    delete params.eid;

    if (properties && typeof properties.placeInfoId === 'string') {
      const placeInfoId = properties.placeInfoId;
      if (includes(['elevator', 'escalator'], properties.category)) {
        routeName = 'equipment';
        params.id = placeInfoId;
        params.eid = featureIdString;
      }
    }

    let activeCluster = null;
    if (this.state.activeCluster) {
      const index = findIndex(
        this.state.activeCluster.features,
        // @ts-ignore
        f => (f.id || f._id) === featureIdString
      );
      activeCluster = index !== -1 ? this.state.activeCluster : null;
    }

    this.setState({ activeCluster }, () => {
      routerHistory.push(routeName, params);
    });
  };

  showSelectedMappingEvent = (eventId: string) => {
    const event =
      this.state.mappingEvents && this.state.mappingEvents.find(event => event._id === eventId);
    const extent = event && event.area && event.area.properties.extent;

    if (extent) {
      this.setState({ extent });
    }

    const params = this.getCurrentParams() as any;
    params.id = eventId;
    this.props.routerHistory.push('mappingEventDetail', params);
  };

  showCluster = (cluster: Cluster) => {
    this.setState({ activeCluster: cluster }, () => {
      const params = this.getCurrentParams() as any;
      delete params.id;
      delete params.eid;
      this.props.routerHistory.push('map', params);
    });
  };

  closeActiveCluster = () => {
    this.setState({ activeCluster: null });
  };

  onAccessibilityFilterButtonClick = (filter: PlaceFilter) => {
    let { routeName } = this.props;
    const params = this.getCurrentParams() as any;

    delete params.accessibility;
    delete params.toilet;

    if (filter.accessibilityFilter.length > 0) {
      params.accessibility = filter.accessibilityFilter.join(',');
    }

    if (filter.toiletFilter.length > 0) {
      params.toilet = filter.toiletFilter.join(',');
    }

    this.props.routerHistory.push(routeName, params);
  };


  onClickFullscreenBackdrop = () => {
    this.setState({ isMainMenuOpen: false, isOnboardingVisible: false, modalNodeState: null });
    trackModalView(null);
    this.onCloseNodeToolbar();
  };

  getCurrentParams() {
    const params = {} as any;
    const {
      app,
      category,
      accessibilityFilter,
      toiletFilter,
      featureId,
      equipmentInfoId,
      disableWheelmapSource,
      includeSourceIds,
      excludeSourceIds,
      overriddenAppId,
      inEmbedMode,
    } = this.props;

    if (category) {
      params.category = category;
    }

    if (isAccessibilityFiltered(accessibilityFilter)) {
      params.accessibility = accessibilityFilter.join(',');
    }

    if (isToiletFiltered(toiletFilter)) {
      params.toilet = toiletFilter.join(',');
    }

    if (featureId) {
      params.id = featureId;
    }

    if (equipmentInfoId) {
      params.eid = equipmentInfoId;
    }

    // ensure to keep widget/custom whitelabel parameters
    if (includeSourceIds && includeSourceIds.length > 0) {
      const includeSourceIdsAsString = includeSourceIds.join(',');
      if (includeSourceIdsAsString !== app.clientSideConfiguration.includeSourceIds.join(',')) {
        params.includeSourceIds = includeSourceIdsAsString;
      }
    }

    if (excludeSourceIds && excludeSourceIds.length > 0) {
      const excludeSourceIdsAsString = excludeSourceIds.join(',');
      if (excludeSourceIdsAsString !== app.clientSideConfiguration.excludeSourceIds.join(',')) {
        params.excludeSourceIds = excludeSourceIdsAsString;
      }
    }

    if (
      typeof disableWheelmapSource !== 'undefined' &&
      disableWheelmapSource !== app.clientSideConfiguration.disableWheelmapSource
    ) {
      params.disableWheelmapSource = disableWheelmapSource ? 'true' : 'false';
    }

    if (overriddenAppId) {
      params.appId = overriddenAppId;
    }

    if (inEmbedMode) {
      params.embedded = 'true';
    }

    return params;
  }

  // this is called also when the report dialog is closed
  onCloseNodeToolbar = () => {
    const currentModalState = this.state.modalNodeState;

    if (!currentModalState) {
      const params = this.getCurrentParams();

      delete params.id;
      delete params.eid;

      this.props.routerHistory.push('map', params);
    } else {
      this.setState({ modalNodeState: null });
      trackModalView(null);
    }
  };

  onCloseMappingEventsToolbar = () => {
    const params = this.getCurrentParams();
    delete params.id;
    this.props.routerHistory.push('map', params);
  };

  onCloseModalDialog = () => {
    const params = this.getCurrentParams();
    this.props.routerHistory.push('map', params);
  };

  onSearchToolbarClick = () => {
    this.openSearch();
  };

  onSearchToolbarClose = () => {
    this.closeSearch();

    if (this.mainView) this.mainView.focusMap();
  };


  onShowSelectedFeature = (feature: Feature | EquipmentInfo) => {
    const featureId = getFeatureId(feature);

    if (!featureId) {
      return;
    }

    this.showSelectedFeature(featureId, feature.properties);
  };

  gotoCurrentFeature() {
    if (this.props.featureId) {
      this.setState({ modalNodeState: null });
      trackModalView(null);
    }
  }

  onCloseWheelchairAccessibility = () => {
    this.gotoCurrentFeature();
  };

  onCloseToiletAccessibility = () => {
    this.gotoCurrentFeature();
  };

  onSelectWheelchairAccessibility = (value: YesNoLimitedUnknown) => {
    if (this.props.featureId) {
      this.setState({
        modalNodeState: 'edit-wheelchair-accessibility',
        accessibilityPresetStatus: value,
      });
      trackModalView('edit-wheelchair-accessibility');
    }
  };

  onSearchQueryChange = (newSearchQuery: string | null) => {
    const params = this.getCurrentParams();

    if (!newSearchQuery || newSearchQuery.length === 0) {
      delete params.q;

      return this.props.routerHistory.replace('map', params);
    }

    params.q = newSearchQuery;

    this.props.routerHistory.replace('search', params);
  };

  onEquipmentSelected = (placeInfoId: string, equipmentInfo: EquipmentInfo) => {
    this.props.routerHistory.replace('equipment', {
      id: placeInfoId,
      eid: get(equipmentInfo, 'properties._id'),
    });
  };

  isNodeToolbarDisplayed(props: Props = this.props, state: State = this.state) {
    return (
      props.feature &&
      !props.mappingEvent &&
      !state.isPhotoUploadCaptchaToolbarVisible &&
      !state.isPhotoUploadInstructionsToolbarVisible &&
      !state.photoMarkedForReport
    );
  }

  onMappingEventsLinkClick = () => {
    this.setState({ isMainMenuOpen: false });
  };

  render() {
    const { isSpecificLatLonProvided } = this.state;
    const isNodeRoute = Boolean(this.props.featureId);
    const isNodeToolbarDisplayed = this.isNodeToolbarDisplayed();
    const mapMoveDate = savedState.map.lastMoveDate;
    // @ts-ignore
    const wasMapMovedRecently = mapMoveDate && new Date() - mapMoveDate < config.locateTimeout;

    const shouldLocateOnStart = !isSpecificLatLonProvided && !isNodeRoute && !wasMapMovedRecently;

    const isSearchBarVisible = this.state.isSearchBarVisible;
    const isMappingEventsToolbarVisible = this.state.isMappingEventsToolbarVisible;
    const isMappingEventToolbarVisible = this.state.isMappingEventToolbarVisible;
    const isSearchButtonVisible =
      !isSearchBarVisible && !isMappingEventsToolbarVisible && !isMappingEventToolbarVisible;

    const extraProps = {
      isNodeRoute,
      modalNodeState: this.state.modalNodeState,
      isNodeToolbarDisplayed,
      isMappingEventsToolbarVisible,
      isMappingEventToolbarVisible,
      shouldLocateOnStart,
      isSearchButtonVisible,
      isSearchBarVisible,

      featureId: this.props.featureId,
      feature: this.props.feature,
      lightweightFeature: this.props.lightweightFeature,
      equipmentInfoId: this.props.equipmentInfoId,
      equipmentInfo: this.props.equipmentInfo,
      photos: this.props.photos,
      category: this.props.category,
      categories: this.props.categories,
      sources: this.props.sources,
      userAgent: this.props.userAgent,
      toiletFilter: this.props.toiletFilter,
      accessibilityFilter: this.props.accessibilityFilter,
      searchQuery: this.props.searchQuery,
      lat: this.state.lat,
      lon: this.state.lon,
      zoom: this.state.zoom,
      extent: this.state.extent,
      isMainMenuOpen: this.state.isMainMenuOpen,
      isOnSmallViewport: this.state.isOnSmallViewport,
      searchResults: this.props.searchResults,
      mappingEvents: this.state.mappingEvents,
      mappingEvent: this.props.mappingEvent,
      invitationToken: this.props.router.query.token,

      disableWheelmapSource: this.props.disableWheelmapSource,
      includeSourceIds: this.props.includeSourceIds,
      excludeSourceIds: this.props.excludeSourceIds,

      // photo feature
      isPhotoUploadCaptchaToolbarVisible:
        this.props.feature && this.state.isPhotoUploadCaptchaToolbarVisible,
      isPhotoUploadInstructionsToolbarVisible:
        this.props.feature && this.state.isPhotoUploadInstructionsToolbarVisible,
      photosMarkedForUpload: this.state.photosMarkedForUpload,
      waitingForPhotoUpload: this.state.waitingForPhotoUpload,
      photoCaptchaFailed: this.state.photoCaptchaFailed,
      photoFlowNotification: this.state.photoFlowNotification,
      photoFlowErrorMessage: this.state.photoFlowErrorMessage,
      photoMarkedForReport: this.state.photoMarkedForReport,

      // simple 3-button status editor feature
      accessibilityPresetStatus: this.state.accessibilityPresetStatus,

      // feature list (e.g. cluster panel)
      activeCluster: this.state.activeCluster,

      app: this.props.app,
    } as any;

    return (
      <MainView
        {...extraProps}
        ref={mainView => {
          this.mainView = mainView;
        }}
        onClickSearchButton={this.openSearch}
        onToggleMainMenu={this.onToggleMainMenu}
        onMoveEnd={this.onMoveEnd}
        onMapClick={this.onMapClick}
        onMarkerClick={this.showSelectedFeature}
        onClusterClick={this.showCluster}
        onCloseClusterPanel={this.closeActiveCluster}
        onSelectFeatureFromCluster={this.onShowSelectedFeature}
        onClickFullscreenBackdrop={this.onClickFullscreenBackdrop}
        onCloseOnboarding={this.onCloseOnboarding}
        onSearchToolbarClick={this.onSearchToolbarClick}
        onSearchToolbarClose={this.onSearchToolbarClose}
        onCloseModalDialog={this.onCloseModalDialog}
        onCloseWheelchairAccessibility={this.onCloseWheelchairAccessibility}
        onCloseToiletAccessibility={this.onCloseToiletAccessibility}
        onSearchQueryChange={this.onSearchQueryChange}
        onEquipmentSelected={this.onEquipmentSelected}
        onShowPlaceDetails={this.showSelectedFeature}
        onMainMenuHomeClick={this.onMainMenuHomeClick}
        onMappingEventsLinkClick={this.onMappingEventsLinkClick}
        onMappingEventClick={this.showSelectedMappingEvent}
        joinedMappingEventId={this.state.joinedMappingEventId}
        joinedMappingEvent={this.state.joinedMappingEvent}
        onCloseMappingEventsToolbar={this.onCloseMappingEventsToolbar}
      />
    );
  }
}

export default App;


getMapPadding() {
  const hasPanel = !!this.props.feature;
  let isPortrait = false;
  if (typeof window !== 'undefined') {
    isPortrait = window.innerWidth < window.innerHeight;
  }
  if (hasBigViewport()) {
    return { left: hasPanel ? 400 : 32, right: 32, top: 82, bottom: 64 };
  }

  if (isPortrait) {
    return { left: 32, right: 32, top: 82, bottom: hasPanel ? 256 : 64 };
  }
  return { left: hasPanel ? 400 : 32, right: 32, top: 82, bottom: 64 };
}

renderMap() {
  const {
    lat,
    lon,
    zoom,
    category: categoryId,
    featureId,
    equipmentInfoId,
    isNodeToolbarDisplayed: isNodeToolbarVisible,
    inEmbedMode,
  } = this.props;
  return (
    <DynamicMap
      forwardedRef={map => {
        this.map = map;
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window.map = map;
        }
      }}
      accessibilityCloudAppToken={this.props.app.tokenString}
      onMoveEnd={this.props.onMoveEnd}
      onClick={this.props.onMapClick}
      onMarkerClick={this.props.onMarkerClick}
      onClusterClick={this.props.onClusterClick}
      onMappingEventClick={this.props.onMappingEventClick}
      onError={this.props.onError}
      lat={lat}
      lon={lon}
      zoom={zoom}
      extent={this.props.extent}
      includeSourceIds={this.props.includeSourceIds}
      excludeSourceIds={this.props.excludeSourceIds}
      disableWheelmapSource={this.props.disableWheelmapSource}
      activeCluster={this.props.activeCluster}
      categoryId={categoryId}
      feature={this.props.lightweightFeature || this.props.feature}
      featureId={featureId}
      mappingEvents={this.props.mappingEvents}
      equipmentInfo={this.props.equipmentInfo}
      equipmentInfoId={equipmentInfoId}
      categories={this.props.categories}
      accessibilityFilter={this.props.accessibilityFilter}
      toiletFilter={this.props.toiletFilter}
      locateOnStart={this.props.shouldLocateOnStart}
      padding={this.getMapPadding()}
      hideHints={
        this.state.isOnSmallViewport && (isNodeToolbarVisible || this.props.isMainMenuOpen)
      }
      inEmbedMode={inEmbedMode}
      {...config}
    />
  );
}


renderMainMenu() {
  const {
    customMainMenuLinks,
    logoURL,
    addPlaceURL,
    textContent,
  } = this.props.app.clientSideConfiguration;

  return (
    <MainMenu
      productName={translatedStringFromObject(textContent.product.name)}
      className="main-menu"
      uniqueSurveyId={this.state.uniqueSurveyId}
      isOpen={this.props.isMainMenuOpen}
      onToggle={this.props.onToggleMainMenu}
      onHomeClick={this.props.onMainMenuHomeClick}
      onMappingEventsLinkClick={this.props.onMappingEventsLinkClick}
      joinedMappingEvent={this.props.joinedMappingEvent}
      logoURL={logoURL}
      claim={textContent.product.claim}
      links={customMainMenuLinks}
      lat={this.props.lat}
      lon={this.props.lon}
      zoom={this.props.zoom}
    />
  );
}