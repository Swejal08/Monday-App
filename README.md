# Monday App

A full-stack Monday.com clone built with React (Frontend) and Node.js (Backend).

## Project Structure

```
Monday-App/
├── fe/          # Frontend (React + Vite)
├── be/          # Backend (Node.js + Express + MongoDB)
├── docker-compose.yml
└── .husky/      # Git hooks
```

## Quick Start

### Prerequisites
- Node.js
- Yarn
- Docker & Docker Compose
- MongoDB

### Installation

1. **Install dependencies for both applications:**
   ```bash
   # Frontend
   cd fe && yarn install
   
   # Backend
   cd ../be && yarn install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy example file and configure 
   cp be/.env.example be/.env and cp fe/.env.example fe/.env
   


3. **Start development servers:**
   ```bash
   # Frontend (from fe/ directory)
   cd fe && yarn dev
   
   # Backend (from be/ directory) - in another terminal
   cd be && yarn dev
   ```

### Docker Setup

1. **Start with Docker:**
   ```bash
   docker-compose up 
   ```


## Tech Stack

### Frontend
- React 
- Vite
- TypeScript
- ESLint

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- TypeScript

### Development Tools
- **Husky** for git hooks
- **Lint-staged** for pre-commit linting
- **Prettier** for code formatting
- **ESLint** for code linting
- **Yarn** for package management

## Docker Services

- **MongoDB**: Runs on port `27018` (mapped from container port 27017)
- **Backend**: Runs on port `3000`
- **Frontend**: Runs on port `5173`


