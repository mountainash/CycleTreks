# CycleTreks
> A visual diary of your cycle adventures

## About
[Strava](https://www.strava.com/) is good for tracking single-activity GPS & fitness logs. This project seeks to combine multiple single activities into a multi-day adventure journal.

Using a Cloudflare Worker to connect to the Strava API and pull concurrent cycle logs and combine them into a single journey.

## Dependencies
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Strava API v3](https://developers.strava.com/docs/reference/)

# Use
1. Create a new Worker and save the content from `./worker/index.js` into your script (note the URL)
1. Get a Strava `access_token` by creating an application at https://www.strava.com/settings/api
1. Visit your running Worker in a web browser and authorise your app

# Running locally
## Setup
1. `npm install`
1. `cp .env.example .env`
1. Edit `.env` with keys and IDs from your [Strava Application settings](https://www.strava.com/settings/api)
1. `npm run worker:init` to put the details from `.env`into `worker/wrangler.toml` (https://developers.cloudflare.com/workers/platform/environment-variables#adding-environment-variables-via-wrangler)
1. `wrangler login` (optional for easier deployment with `npm run worker:publish`, but _before_ publishing your code you need to edit `wrangler.toml` file and add your Cloudflare `account_id`)

## Develop
```sh
npm run worker:dev
npm run worker:tail # for logs from the remote Worker - good for callbacks
```

## Resources
- **Strava**
	- [API Docs](https://developers.strava.com/docs/)
	- [Strava API Auth flow](https://developers.strava.com/docs/authentication/#requestingaccess)
- **Cloudflare**
	- [Workers](https://developers.cloudflare.com/workers)
	- [Wranger](https://developers.cloudflare.com/workers/cli-wrangler)