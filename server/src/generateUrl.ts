import { URL } from 'url';

interface QueryParams {
	[key: string]: string | undefined;
}

/**
 * @description Genreates a URL encoded string from an object
 */
export const generateUrl = (baseURI: string, params: QueryParams): string | undefined => {
	// We put it in a function so we dont put everything in a try catch block
	const getURL = () => {
		try {
			const baseURL = new URL(baseURI);
			return baseURL;
		} catch {
			return undefined;
		}
	};

	const baseURL = getURL();

	if (!baseURL) {
		return;
	}

	if (baseURL.search !== '') {
		return;
	}

	let urlWithParams = baseURL.protocol+'//';

	if (baseURL.username !== '') {
		urlWithParams = urlWithParams+baseURL.username;
	}

	if (baseURL.password !== '') {
		urlWithParams = urlWithParams+':'+baseURL.password;
	}

	if (baseURL.username !== '' || baseURL.password !== '') {
		urlWithParams = urlWithParams+'@';
	}

	urlWithParams = urlWithParams+baseURL.host+baseURL.pathname;
	
	const queryParams = Object.keys(params).map(key => {
		const value = params[key];

		if (value) {
			return encodeURIComponent(key)+'='+encodeURIComponent(value);
		}

		return encodeURIComponent(key);
	}).join('&');

	if (queryParams !== '') {
		urlWithParams = urlWithParams+'?'+queryParams;
	}

	return urlWithParams+baseURL.hash;
};