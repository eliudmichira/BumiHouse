# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY client/package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production
RUN cd server && npm ci --only=production

# Build the client
FROM base AS client-builder
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build the server
FROM base AS server-builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=client-builder --chown=nextjs:nodejs /app/dist ./client/dist
COPY --from=server-builder --chown=nextjs:nodejs /app/dist ./server/dist
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./client/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/server/node_modules ./server/node_modules

# Copy server files
COPY server/package*.json ./server/
COPY server/prisma ./server/prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server/dist/index.js"]
