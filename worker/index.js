/**
 *
 * SVN: https://github.com/mountainash/CycleTreks
 *
 * 1. Auth with Strava:
 * http://www.strava.com/oauth/authorize?client_id=69728&response_type=code&redirect_uri=http://../exchange_token&approval_prompt=force&scope=read,activity:read
 * redirects to http://.../exchange_token?state=&code=b0439b3a237331cbd6f81d30d12fa878626cce5f&scope=read,activity:read
 * 2. Get `code` from the redirected URL
 * 3. POST the `client_id`, `client_secret`, `grant_type=authorization_code`, with `code` from step 2 to:
 * https://www.strava.com/oauth/token
 * 3. Get the `refresh_token` and `access_token` from the response - use this to make requests to the API as the user
 */
const config = {
	endpoints: {
		host: 'https://www.strava.com',
		auth: 'https://www.strava.com/oauth/authorize',
	},
	client_id: CLIENT_ID, // CF Workers use env vars
	client_code: CLIENT_CODE,
	client_secret: CLIENT_SECRET,
	athlete_id: ATHLETE_ID,
	scopes: [
		'read',
		'activity:read',
	],
	grant_type: 'authorization_code',
};

function handleError(results) {
	return new Response(JSON.stringify(results), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		}
	});
};

async function handleReturnActivities(authresults) {
	const endpoint = `${config.endpoints.host}/api/v3/athlete/activities`;

	const init = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${authresults.access_token}`,
		},
	};
	const response = await fetch(endpoint, init);
	const activities = await response.json();
	if (activities.errors) {
		return handleError(activities);
	}

	return new Response(JSON.stringify(activities));
}

async function handleAccessToken(auth_code) {
	const endpoint = `${config.endpoints.host}/api/v3/oauth/token`;
	const body = {
		code: auth_code,
		client_id: config.client_id,
		client_secret: config.client_secret,
		grant_type: config.grant_type,
	}

	const init = {
		body: JSON.stringify(body),
		method: 'POST',
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	}
	const response = await fetch(endpoint, init);
	const authresults = await response.json();
	if (authresults.errors) {
		return handleError(authresults);
	}

	return await handleReturnActivities(authresults);
}

function handleRequest(request) {
	const url = new URL(request.url)
	// Check if incoming request has a query
	if (url.pathname == '/favicon.ico') {
		return new Response('resource not found', {
			status: 404,
			statusText: 'not found',
			headers: {
				'content-type': 'text/plain'
			}
		});
	}
	else if (url.pathname == '/exchange_token') {
		const auth_code = url.searchParams.get('code');

		return handleAccessToken(auth_code);
	}
	else {
		return new Response(`<center style="display:flex; height:100%; align-items:center; background:#EFEFEF; font:bold 2rem sans-serif"><a href="http://www.strava.com/oauth/authorize?client_id=69728&response_type=code&redirect_uri=${request.url}exchange_token&approval_prompt=force&scope=read,activity:read" style="flex-grow:1"><big>Login</big></a></center>`, {
			headers: {
				'content-type': 'text/html;charset=UTF-8',
			}
		});
	}
}

addEventListener('fetch', event => event.respondWith(handleRequest(event.request)));