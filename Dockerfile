# syntax=docker/dockerfile:1

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY vendor ./vendor
RUN npm install --legacy-peer-deps
COPY . .
# vite.config.ts requires PORT/BASE_PATH at build time too (not just dev/serve).
# VITE_* vars are baked into the static bundle at build time — pass real
# Firebase config as build args when building the image. This is Firebase's
# public web config (apiKey etc.), not a secret — safe to appear in the
# built JS bundle and in build args/labels despite Docker's generic linter
# warning on ARG/ENV names containing "KEY".
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV PORT=5173
ENV BASE_PATH=/
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
