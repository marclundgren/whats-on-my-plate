FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm install

# Source code will be mounted as volume in dev mode
# CMD runs the vite dev server
CMD ["npm", "run", "dev"]
