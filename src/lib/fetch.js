import fetchViaCordova from './fetchViaCordova';
import unfetch from 'unfetch';

export default function (url, options) {
	options = options || {};

	// If we're running in a cordova app and it has http, make our lives easier by using native HTTP
	// connections.
	if (window.cordova && options.cordova === true) {
		return fetchViaCordova(url, options);
	}

	if (typeof fetch === 'function') {
		// Use browser WhatWG fetch implementation if existing
		return fetch(url, options);
	} else {
		// ...otherwise use unfetch polyfill. It doesn't support everything in the WhatWG proposal, but
		// has enough features for this app.
		return unfetch(url, options);
	}
}