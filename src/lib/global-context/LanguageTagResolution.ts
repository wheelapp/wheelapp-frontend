import HamsterCache from '@sozialhelden/hamster-cache';
import { getAvailableTranslationsByPreference, Translations } from '../i18n';
import allTranslations from '../translations.json';
import { NextPageContext } from 'next';
import uniq from 'lodash/uniq';

type PreferredLanguageTagsSeparatedByComma = string;
type ResolvedExistingTranslations = Translations[];

export const cache = new HamsterCache<
  PreferredLanguageTagsSeparatedByComma,
  ResolvedExistingTranslations
>({
  defaultTTL: 24 * 60 * 60 * 1000,
  maximalItemCount: 10000,
  evictExceedingItemsBy: 'lru',
});

setInterval(() => cache.evictExpiredItems(), 10000);

export function parseAcceptLanguageString(acceptLanguage: string): string[] {
  return acceptLanguage
    .split(',')
    .map(item => {
      const [locale, q] = item.split(';');

      return {
        locale: locale.trim().slice(0, 100),
        score: q ? parseFloat(q.slice(2)) || 0 : 1,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.locale);
}

export function getCachedTranslationsForAcceptLanguageHeader(
  httpAcceptLanguageHeader: string,
  overriddenLanguageTag?: string,
): ResolvedExistingTranslations {
  const preferredLocaleStrings = parseAcceptLanguageString(
    httpAcceptLanguageHeader,
  ).slice(0, 5);
  const key: PreferredLanguageTagsSeparatedByComma = preferredLocaleStrings.join(
    ',',
  );

  const existingResult = cache.get(key);
  if (existingResult) {
    return existingResult;
  }

  const newResult = getAvailableTranslationsByPreference(
    allTranslations,
    preferredLocaleStrings,
    overriddenLanguageTag,
  );

  cache.set(key, newResult);
}

export function getCachedTranslationsForContext(
  ctx: NextPageContext,
): ResolvedExistingTranslations {
  const languageTags =
    ctx?.req?.headers['accept-language'] ??
    uniq(
      (window.navigator.languages || []).concat(window.navigator.language),
    ).join(', ');
  const overriddenLanguageTag =
    ctx?.query.lang || ctx?.query.language || ctx?.query.locale;

  return getCachedTranslationsForAcceptLanguageHeader(
    languageTags,
    typeof overriddenLanguageTag === 'string'
      ? overriddenLanguageTag
      : overriddenLanguageTag[0],
  );
}
