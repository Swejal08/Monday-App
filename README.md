# Monday App

A full-stack Monday.com clone built with React (Frontend) and Node.js (Backend).

## Project Structure

```
Monday-App/
├── fe/          # Frontend (React + Vite)
├── be/          # Backend (Node.js + Express + MongoDB)
├── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js
- Yarn
- Docker & Docker Compose (Optional)
- MongoDB

### Installation

1. **Install dependencies for both applications:**
   ```bash
   yarn 
   ```

2. **Set up environment variables:**
   ```bash
   # Copy example file and configure 
   cp be/.env.example be/.env 
   cp fe/.env.example fe/.env

   Backend

   PORT=
   MONGO_USERNAME=
   MONGO_PASSWORD=
   MONGO_DATABASE=
   MONGO_PORT=
   DB_PASSWORD=
   MONDAY_TOKEN=  # You need to get this from your Monday app 
   OUTPUT_COLUMN_ID=    # Copy the id from the monday board column
   MONGODB_URL=   # Example: mongodb://{username}:{password}@localhost:27018/{database}?authSource=admin  or connection string from mongo atlas
   APP_URL   # App ngrok url 

   Frontend
   VITE_API_URL= # Api ngrok url 
   VITE_APP_URL= # App ngrok url 

   ```


3. **Setup up mongoDB with docker (Optional):**
   ```bash
   docker-compose up 
   ```

4. **Use mongodb connection url from mongo atlas in env**
   ```bash
   MONGODB_URL=       # If Step 3 is skipped
   ```

4. **Add ngrok config**
   ```bash
   version: "2"
   authtoken: Use your own auth token

   tunnels:
   item-view:
      addr: 5173    # Assuming your React/Vite/Next frontend runs here
      proto: http
      region: us             # Optional: us, eu, ap, au, sa, jp, in

   backend:
      addr: 3000    # Assuming your Node/Express/Golang backend runs here
      proto: http
      region: us
   ```

5. **Start ngrok**
   ```bash
   ngrok start --all
   ```


6. **Start development servers:**
   ```bash
   yarn dev (This will run both frontend and backend)
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


## Docker Services
- **MongoDB**: Runs on port `27018` (mapped from container port 27017)


