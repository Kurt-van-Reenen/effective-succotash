# Effective Succotash

Effective Succotash is a small React and TypeScript application shell with an accounts list, an API boundary, and a realistic mock-backed workflow. It is designed as a starting point for a production application and runs in a hardened Nginx container with no backend required.

## Architecture decisions

- **Feature-based structure:** account screens and API functions live together under `src/features/accounts/`; reusable UI lives under `src/components/`.
- **Single API boundary:** feature code calls typed API functions, not `fetch`. The shared API types are derived from Zod schemas, and every response is validated before it reaches the UI.
- **MSW for realistic mocks:** Mock Service Worker intercepts the same `/accounts` request in development, tests, and the default production image. Its browser code is dynamically imported only when `VITE_ENABLE_MOCKS=true`.
- **Hardened static hosting:** a multi-stage build keeps Node and development dependencies out of the final image. An unprivileged Nginx image serves the SPA with a health check, gzip, security headers, and fallback routing.

## Prerequisites

For the Docker workflow:

- Docker Engine 24.0 or newer, or Docker Desktop 4.25.0 or newer.
- Docker Compose plugin 2.20.0 or newer (`docker compose`).

For local development:

- Node.js 24.15.0 or newer in the 24.x LTS line.
- npm 11.0.0 or newer.

The Docker build pins Node.js 24.18.0 and the runtime image to `nginxinc/nginx-unprivileged:1.28.0-alpine`.

## Quick start

From a terminal with Docker running:

```sh
git clone https://github.com/Kurt-van-Reenen/effective-succotash.git
cd effective-succotash
docker compose up --build
```

Open <http://localhost:8080>. The page shows three clearly labelled sample accounts served by MSW; no API server or Node.js installation is needed on the host. Stop the foreground service with `Ctrl+C`.

## Build and run

Build the default image (mocks enabled):

```sh
docker build -t effective-succotash .
```

Run it with Docker:

```sh
docker run --rm -p 8080:8080 effective-succotash
```

Or build and start it with Compose:

```sh
docker compose up --build
```

Stop a Compose deployment with `docker compose down`. The container listens on port `8080`. To use a different host port with `docker run`, for example:

```sh
docker run --rm -p 8081:8080 effective-succotash
```

## Tests, lint, and formatting

Run the tests inside Docker without installing Node.js on the host:

```sh
docker build --target test -t effective-succotash-test .
```

The test stage runs the suite during the image build and fails the build if a test fails.

For local development, install Node.js and npm as listed above, then run:

```sh
npm ci
npm test
npm run lint
npm run format:check
```

Run `npm run format` to format the project. `npm run build` type-checks TypeScript and creates the production bundle. `npm run dev` starts Vite with MSW enabled by default.

## Switching to a real API

The placeholder contract is `GET /accounts` returning a JSON object with an `accounts` array. Each entry has a non-empty `id`, a non-empty `name`, and a valid `email`, for example:

```json
{
  "accounts": [
    {
      "id": "account-123",
      "name": "Avery Example",
      "email": "avery@example.com"
    }
  ]
}
```

Build the image with the real API's HTTPS base URL and MSW disabled:

```sh
docker build --build-arg VITE_ENABLE_MOCKS=false --build-arg VITE_API_BASE_URL=https://api.example.com -t effective-succotash:real-api .
docker run --rm -p 8080:8080 effective-succotash:real-api
```

The app requests `https://api.example.com/accounts`. The API must allow cross-origin requests from the app's origin. For Compose, set `VITE_ENABLE_MOCKS=false` and `VITE_API_BASE_URL=https://api.example.com` in a local `.env` file before running `docker compose up --build`. Vite settings are baked into the static bundle at build time; changing container runtime environment variables does not change them.

To return to the sample API with Compose, set `VITE_ENABLE_MOCKS=true` and `VITE_API_BASE_URL=/api` in `.env`, then rebuild:

```sh
docker compose up --build
```

## Project structure

```text
.
├── .github/workflows/ci.yml       # Lint, tests, app build, and Docker build
├── public/mockServiceWorker.js    # MSW browser worker
├── src/
│   ├── api/                       # Shared response schemas, types, and client
│   ├── components/                # Reusable UI components
│   ├── features/accounts/         # Accounts API, page, and feature tests
│   ├── mocks/data/                # Clearly labelled sample account data
│   ├── mocks/                     # Browser MSW worker and request handlers
│   └── test/                      # Test setup and MSW server
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── vite.config.ts
```

## Configuration

| Variable            | Default | Description                                                                                              |
| ------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `VITE_ENABLE_MOCKS` | `true`  | Enables MSW when `true`; when `false`, mock startup and handlers are omitted from the production bundle. |
| `VITE_API_BASE_URL` | `/api`  | API base path or absolute URL. The app appends `/accounts`.                                              |

Copy `.env.example` to `.env` when you want to set these values for Compose. Do not put secrets in Vite variables: values prefixed with `VITE_` are public and included in the browser bundle.

## Troubleshooting

- **Port 8080 is already in use:** stop the process/container using it, or run the image with another host port, such as `docker run --rm -p 8081:8080 effective-succotash`. For Compose, change the host-side port in `docker-compose.yml` and rerun `docker compose up --build`.
- **Docker is not running:** start Docker Desktop or the Docker Engine service, then retry `docker compose up --build`.
- **Compose is unavailable:** install or update the Docker Compose plugin and confirm `docker compose version` works.
- **A real API request fails in the browser:** check that the built image has `VITE_ENABLE_MOCKS=false`, the API URL is correct, the endpoint returns the documented JSON shape, and the API allows CORS from the app origin.
- **The sample accounts do not appear:** wait for MSW's service worker to register, then refresh the page. Confirm the image was built with `VITE_ENABLE_MOCKS=true` and that the browser can load `/mockServiceWorker.js`.
