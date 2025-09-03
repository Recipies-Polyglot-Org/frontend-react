# Stage 1: Build React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Create non-root user & group, copy build output, fix ownership in one layer
RUN addgroup -S www && adduser -D -G www appuser && \
    rm -rf ./* && \
    mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chown -R appuser:www /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx

# Copy nginx.conf (overwrites default) & React build
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/build ./

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
