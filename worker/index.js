/**
 *
 * VCS: https://github.com/mountainash/CycleTreks
 *
 * 1. Auth with Strava:
 * http://www.strava.com/oauth/authorize?client_id=69728&response_type=code&redirect_uri=http://../exchange_token&approval_prompt=force&scope=read,activity:read
 * redirects to http://.../exchange_token?state=&code=b0439b3a237331cbd6f81d30d12fa878626cce5f&scope=read,activity:read
 * 2. Get `code` from the redirected URL
 * 3. POST the `client_id`, `client_secret`, `grant_type=authorization_code`, with `code` from step 2 to: https://www.strava.com/oauth/token
 * 4. Get the `refresh_token` and `access_token` from the response - use this to make requests to the API as the user
 */

const config = {
	endpoint: 'https://www.strava.com/api/v3',
};

function handleError(results) {
	return new Response(JSON.stringify(results), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	});
}

async function handleReturnActivities(authresults) {
	const endpoint = `${config.endpoint}/athlete/activities`;
	const init = {
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
	const endpoint = `${config.endpoint}/oauth/token`;
	const body = {
		code: auth_code,
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		grant_type: 'authorization_code',
	};
	const init = {
		body: JSON.stringify(body),
		method: 'POST',
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	};
	const response = await fetch(endpoint, init);
	const authresults = await response.json();

	console.info('authresults', authresults);

	if (authresults.errors) {
		return handleError(authresults);
	}

	return await handleReturnActivities(authresults);
}

function handleRequest(request) {
	const url = new URL(request.url);

	if (url.pathname === '/favicon.ico') {
		return new Response('resource not found', {
			status: 404,
			statusText: 'not found',
			headers: {
				'content-type': 'text/plain',
			},
		});
	}

	if (url.pathname === '/exchange_token') {
		const auth_code = url.searchParams.get('code');

		return handleAccessToken(auth_code);
	}

	return new Response(
		`<center style="display:flex; height:100%; align-items:center; background:#EFEFEF; font:bold 2rem sans-serif">
			<a href="${config.endpoint}/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${request.url}exchange_token&approval_prompt=force&scope=read,activity:read" style="flex-grow:1">
				<big>Login</big>
			</a>
		</center>`,
		{
			headers: {
				'content-type': 'text/html;charset=UTF-8',
			},
		}
	);
}

addEventListener('fetch', (event) =>
	event.respondWith(handleRequest(event.request))
);
