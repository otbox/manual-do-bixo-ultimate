# Manual do Bixo Ultimate — site HQ estático (Astro → nginx)
# Build:  docker build -t manual-do-bixo-ultimate .
# Run:    docker run --rm -p 8080:80 manual-do-bixo-ultimate

# ---------- build ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web/ ./

ARG SITE_URL=https://manualdobixo.otbox.run.place
ARG BASE_PATH=/
ENV SITE_URL=$SITE_URL \
    BASE_PATH=$BASE_PATH

RUN npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
