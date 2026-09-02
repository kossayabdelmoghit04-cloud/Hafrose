# ── Stage 1: Build React SPA ──────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_STORAGE_URL=/storage
ARG VITE_APP_ENV=production

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_STORAGE_URL=$VITE_STORAGE_URL
ENV VITE_APP_ENV=$VITE_APP_ENV

RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
