# Frontend Dockerfile for Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build args for environment variables
ARG VITE_NETWORK=monad
ARG VITE_CONTRACT_ADDRESS
ARG VITE_API_URL

# Set environment variables for build
ENV VITE_NETWORK=$VITE_NETWORK
ENV VITE_CONTRACT_ADDRESS=$VITE_CONTRACT_ADDRESS
ENV VITE_API_URL=$VITE_API_URL

# Build
RUN pnpm build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

