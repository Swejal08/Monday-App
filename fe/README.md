# Monday App - Frontend

React + TypeScript + Vite frontend for the Monday.com clone application.

## Tech Stack

- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **ESLint** - Code Linting
- **Prettier** - Code Formatting

## Project Structure

```
fe/
├── src/              # Source code
├── public/           # Static assets
├── Dockerfile        # Docker configuration
├── package.json      # Dependencies & scripts
├── vite.config.ts    # Vite configuration
└── tsconfig.json     # TypeScript configuration
```

## Development

### Local Development

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Start development server:**
   ```bash
   yarn dev
   ```
   
   Frontend will be available at `http://localhost:5173`

### Docker Development

1. **From project root, start all services:**
   ```bash
   docker-compose up -d
   ```
   
   This starts:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`
   - MongoDB: `localhost:27018`

2. **View logs:**
   ```bash
   docker-compose logs -f frontend
   ```

## Available Scripts

- `yarn dev` - Start development server with HMR
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn preview` - Preview production build

## Features

- ⚡ **Hot Module Replacement (HMR)** - Instant updates during development
- 🔧 **TypeScript** - Full type safety
- 📦 **Vite** - Fast build tool and dev server
- 🎨 **ESLint + Prettier** - Code quality and formatting
- 🐳 **Docker Support** - Containerized development

## API Integration

The frontend communicates with the backend API running on:
- **Development**: `http://localhost:3000`
- **Docker**: `http://backend:3000` (internal network)

## Expanding the ESLint Configuration

For production applications, consider enabling type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    // For stricter rules:
    ...tseslint.configs.strictTypeChecked,
    // For stylistic rules:
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

## React-Specific Linting

Install additional React plugins for enhanced linting:

```bash
yarn add -D eslint-plugin-react-x eslint-plugin-react-dom
```

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
