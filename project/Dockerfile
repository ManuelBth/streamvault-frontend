# Build stage
FROM node:22-alpine AS build

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build Angular app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy Angular build output
COPY --from=build /app/dist/streamvault-front/browser /usr/share/nginx/html

# Create config directory
RUN mkdir -p /usr/share/nginx/html/config

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx with our entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
