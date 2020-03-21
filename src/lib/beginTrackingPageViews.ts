import NextRouter from 'next/router';
import { trackPageView } from './Analytics';

export default function beginTrackingPageViews() {
  NextRouter.events.on('routeChangeStart', trackPageView);
}
