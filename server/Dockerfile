FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install

# Copy prisma schema for generate
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Source code will be mounted as volume in dev mode
# CMD runs the dev server with hot reload
CMD ["npm", "run", "dev"]
