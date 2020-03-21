import env from '../lib/env';

export default function ContentSecurityPolicyMetaTag() {
  return (
    <meta
      httpEquiv="Content-Security-Policy"
      content={`
              default-src
                ws:
                data:
                'self'
                'unsafe-eval'
                'unsafe-inline'
                https://ssl.gstatic.com
                https://photon.komoot.de
                https://sozialhelden.matomo.cloud
                https://cdn.matomo.cloud
                http://cdn.matomo.cloud

                ${env.REACT_APP_LEGACY_API_BASE_URL || ''}
                ${env.REACT_APP_ACCESSIBILITY_CLOUD_BASE_URL || ''}
                ${env.REACT_APP_ACCESSIBILITY_CLOUD_UNCACHED_BASE_URL || ''}
                ${env.REACT_APP_ACCESSIBILITY_APPS_BASE_URL || ''}
                ${env.REACT_APP_ELASTIC_APM_SERVER_URL || ''}
                ${env.REACT_APP_ALLOW_ADDITIONAL_DATA_URLS || ''};

                style-src
                'self'
                'unsafe-inline';
              frame-src
                'self';
              media-src
                'self';
              img-src
                'self'
                data:
                https://accessibility-cloud-uploads.s3.amazonaws.com
                https://sozialhelden.matomo.cloud
                https://api.mapbox.com
                https://asset0.wheelmap.org
                https://asset1.wheelmap.org
                https://asset2.wheelmap.org
                https://asset3.wheelmap.org
                https://asset4.wheelmap.org
                ${env.REACT_APP_ACCESSIBILITY_CLOUD_BASE_URL || ''}
                ${env.REACT_APP_ACCESSIBILITY_CLOUD_UNCACHED_BASE_URL || ''}
                ${env.REACT_APP_ACCESSIBILITY_APPS_BASE_URL || ''}
                ${env.REACT_APP_ALLOW_ADDITIONAL_IMAGE_URLS || ''};
            `}
    />
  );
}
