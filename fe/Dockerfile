# Multi-stage build for React + Vite frontend

# Development stage
FROM node:20-alpine as development
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Expose development port
EXPOSE 5173

# Start development server
CMD ["yarn", "dev", "--host", "0.0.0.0"]


