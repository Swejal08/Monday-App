FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install

RUN yarn add ts-node-dev

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN yarn tsc

# Expose port
EXPOSE 3000

# Start the application
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]
