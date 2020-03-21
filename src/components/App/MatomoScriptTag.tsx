export default function MatomoScriptTag() {
  return (
    <script
      type="text/javascript"
      dangerouslySetInnerHTML={{
        __html: `
      var _paq = window._paq || [];
      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */

      function trackNativeAppStats() {
        try {
          var isNative = !!window.navigator.userAgent.match(/AllyApp/);

          window._paq.push([
            'setCustomDimension',
            1, // Native app used
            isNative ? 'Native Mobile App' : 'Desktop Browser'
          ]);

          if (!isNative) {
            return;
          }

          var nativeAppVersionMatch = window.navigator.userAgent.match(
            /AllyApp\\/(?:([^ ]+)(?: \\(([^)]+)\\))?)/
          );
          if (!nativeAppVersionMatch[1]) {
            return;
          }

          window._paq.push([
            'setCustomDimension',
            2, // Native app version
            nativeAppVersionMatch[1]
          ]);

          if (!nativeAppVersionMatch[2]) {
            return;
          }

          window._paq.push([
            'setCustomDimension',
            3, // Native app OS
            nativeAppVersionMatch[2],
          ]);
        } catch (e) {
          console.log('Error: Could not track native app usage:', e);
        }
      }

      trackNativeAppStats();
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      _paq.push(['enableHeartBeatTimer']);

      (function() {
        var u="https://sozialhelden.matomo.cloud/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '1']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.defer=true; g.src='//cdn.matomo.cloud/sozialhelden.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
      })();`,
      }}
    ></script>
  );
}
