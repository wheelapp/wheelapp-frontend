import { localeFromString, Locale } from '../../lib/i18n';
import allTranslations from '../../lib/translations.json';
import { useRouter } from 'next/router';

const availableLocales: Locale[] = Object.keys(allTranslations).map(localeFromString);

export default function AlternateLocaleLinks() {
  const router = useRouter();
  const { pathname } = router;

  return (
    <>
      {availableLocales.map(locale => (
        <link
          key={locale.string}
          href={`${pathname}?locale=${locale.string}`}
          hrefLang={locale.string}
          rel="alternate"
        />
      ))}
    </>
  );
}
