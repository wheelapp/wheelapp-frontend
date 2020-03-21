// preferred language

// locales

// t
// translations
if (ctx.req) {
  if (ctx.req.headers['accept-language']) {
    localeStrings = parseAcceptLanguageString(
      ctx.req.headers['accept-language'],
    );
    console.log('Using languages:', localeStrings);
  }
} else {
  localeStrings = getBrowserLocaleStrings();
}

import {
  addTranslationsToTTag,
  getBrowserLocaleStrings,
  parseAcceptLanguageString,
} from '../lib/i18n';

if (translations) {
  addTranslationsToTTag(translations);
}

// setup translations
const translations = getAvailableTranslationsByPreference(
  allTranslations,
  localeStrings,
  overriddenLocaleString,
);

const preferredLocaleString = translations[0].headers.language;

// only store translations on server
if (!isServer) {
  cachedTranslations = translations || cachedTranslations;
}

let cachedTranslations: Translations[] = [];
const { Provider, Consumer } = createContext<AppContext>({
  app: {
    _id: '',
    organizationId: '',
    name: '',
    clientSideConfiguration: {} as any,
    tokenString: '',
  },
  baseUrl: '',
  categories: {
    synonymCache: {},
    idsToWheelmapCategories: {},
    classicCategoryNamesToCategories: {},
    classicRootCategoryNamesToCategories: {},
  },
  preferredLanguage: '',
});
