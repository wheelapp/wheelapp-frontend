const accessibilityFilter = getAccessibilityFilterFrom(accessibility);
const toiletFilter = getToiletFilterFrom(toilet);

const includeSourceIdsArray =
  (includeSourceIds ? includeSourceIds.split(/,/) : null) ||
  (clientSideConfiguration ? clientSideConfiguration.includeSourceIds : []);
const excludeSourceIdsArray =
  (excludeSourceIds ? excludeSourceIds.split(/,/) : null) ||
  (clientSideConfiguration ? clientSideConfiguration.excludeSourceIds : []);

const parsedZoom =
  typeof props.zoom === 'string' ? parseInt(props.zoom, 10) : null;
const parsedLat = typeof props.lat === 'string' ? parseFloat(props.lat) : null;
const parsedLon = typeof props.lon === 'string' ? parseFloat(props.lon) : null;

newState.extent = state.extent || props.extent || null;
newState.zoom =
  state.zoom ||
  parsedZoom ||
  Number.parseInt(savedState.map.lastZoom, 10) ||
  null;
newState.lat =
  state.lat ||
  parsedLat ||
  (savedState.map.lastCenter &&
    Number.parseFloat(savedState.map.lastCenter[0])) ||
  null;
newState.lon =
  state.lon ||
  parsedLon ||
  (savedState.map.lastCenter &&
    Number.parseFloat(savedState.map.lastCenter[1])) ||
  null;

newState.isSpecificLatLonProvided = Boolean(parsedLat) && Boolean(parsedLon);
