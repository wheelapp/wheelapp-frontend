import { NextPageContext } from 'next';
import { createContext } from 'react';
import { Translations } from '../i18n';
import { App } from '../model/App';
import { MappingEvent } from '../model/MappingEvent';
import { getMappingEvents } from './caches/MappingEventsCache';
import { getAppForHostname } from './CurrentApp';
import { setResponseHeadersForEmbedMode } from './EmbedModeAuthorization';
import { getHostnameInfoIsometric, HostnameInfo } from './Hostname';
import { getCachedTranslationsForContext } from './LanguageTagResolution';
import {
  getUserAgentFromIncomingMessage,
  isTouchDevice,
  UserAgent,
} from './UserAgent';

type GlobalContext = {
  currentApp: App;
  hostnameInfo: HostnameInfo;
  isInEmbedMode: boolean;
  isEmbedModeAllowed: boolean;
  isTouchDevice: boolean;
  translations: Translations[];
  userAgent: UserAgent;
  mappingEvents: MappingEvent[];
};

export async function getGlobalContext(
  ctx: NextPageContext,
): Promise<GlobalContext> {
  const hostnameInfo = getHostnameInfoIsometric(ctx.req);
  const translations = getCachedTranslationsForContext(ctx);
  const userAgent = getUserAgentFromIncomingMessage(ctx.req);
  const isInEmbedMode = !!ctx?.query.embedded;
  const currentApp = await getAppForHostname(hostnameInfo.hostname);
  const embedToken = ctx?.query.embedToken;
  const isEmbedModeAllowed =
    typeof embedToken === 'string' &&
    setResponseHeadersForEmbedMode(embedToken, currentApp, ctx.res);
  const mappingEvents = await getMappingEvents(currentApp);
  const categoryLookupTable = '';

  return {
    currentApp,
    hostnameInfo,
    isInEmbedMode,
    isEmbedModeAllowed,
    isTouchDevice: isTouchDevice(userAgent),
    translations,
    userAgent,
    mappingEvents,
  };
}

const GlobalContext = createContext<GlobalContext | undefined>(undefined);

export default GlobalContext;
