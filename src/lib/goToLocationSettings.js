import { t } from 'ttag';
import { getUserAgent } from '../lib/userAgent';
import { saveState } from './savedState';

// Open location settings or show the user how to open them

export default function goToLocationSettings() {
  saveState({ hasOpenedLocationHelp: 'true' });

  const userAgent = getUserAgent();

  const identity = userAgent.browser.name;

  const supportURLs = {
    // android https://support.google.com/nexus/answer/3467281
    Safari: 'https://support.apple.com/en-us/ht204690',
    'Mobile Safari': 'https://support.apple.com/en-us/ht203033',
    Chrome: 'https://support.google.com/chrome/answer/142065',
    Firefox: 'https://support.mozilla.org/en-US/kb/does-firefox-share-my-location-websites',
    Edge: 'http://www.monitorconnect.com/allow-location-tracking-on-microsoft-edge-web-solution-b/',
  };

  const supportURL = supportURLs[identity];

  if (supportURL) {
    window.open(supportURL, '_blank');
    return;
  }

  window.alert(
    t`To locate yourself on the map, open browser settings and allow Wheelmap.org to use location services.`
  );
}
