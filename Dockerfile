FROM node:24.18.0-alpine3.23 AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS test

COPY . .
RUN npm test

FROM dependencies AS build

ARG VITE_ENABLE_MOCKS=true
ARG VITE_API_BASE_URL=/api
ARG VITE_CUSTOMER_ID=12345
ARG VITE_ASSET_BASE_URL=/
ENV VITE_ENABLE_MOCKS=${VITE_ENABLE_MOCKS}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CUSTOMER_ID=${VITE_CUSTOMER_ID}
ENV VITE_ASSET_BASE_URL=${VITE_ASSET_BASE_URL}

COPY . .
RUN npm run build
RUN ASSET_ORIGIN="$(printf '%s' "$VITE_ASSET_BASE_URL" | sed -nE 's#^(https://[^/]+).*##p')"     && sed "s#__ASSET_ORIGIN__#${ASSET_ORIGIN:+ $ASSET_ORIGIN}#g" nginx.conf > nginx.generated.conf

FROM nginxinc/nginx-unprivileged:1.28.0-alpine AS runtime

COPY --from=build /app/nginx.generated.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

USER 101
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
