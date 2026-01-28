# # Use lightweight Node image
# FROM node:18-alpine

# # Set working directory inside container
# WORKDIR /app


# RUN apk add --no-cache openssl

# # Copy package files first (for layer caching)
# COPY package.json package-lock.json* ./

# # Install dependencies
# RUN npm install

# # Copy rest of the backend code
# COPY . .

# # Generate Prisma Client
# RUN npx prisma generate

# # Expose API port
# EXPOSE 5000

# # Start the server
# CMD ["npm", "start"]





#######################################
# Stage 1: Dependencies & Prisma build
#######################################
FROM node:18-alpine AS builder

WORKDIR /app

# Prisma + Neon need OpenSSL
RUN apk add --no-cache openssl

# Copy dependency files
COPY package.json package-lock.json* ./

# Install ALL deps (including dev deps for Prisma)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate


#######################################
# Stage 2: Production runtime
#######################################
FROM node:18-alpine AS runner

WORKDIR /app

# Install only runtime system deps
RUN apk add --no-cache openssl

# Copy only what we need from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Environment
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
