# The Erasure Bureau - GDPR Automator

## Overview
A React-based web application that automates the creation of GDPR Article 17 ("Right to Erasure") requests. The app processes data locally in the browser without server uploads.

## Project Structure
- `index.html` - Main HTML entry point
- `index.tsx` - React entry point
- `App.tsx` - Main application component with wizard flow
- `ProfileStep.tsx` - Step 1: User profile and identity declaration
- `DiscoveryStep.tsx` - Step 2: Service discovery and selection
- `ExecutionStep.tsx` - Step 3: Email generation and execution
- `types.ts` - TypeScript type definitions
- `constants.ts` - Service database and initial data
- `templates.ts` - GDPR email template generation
- `vite.config.ts` - Vite build configuration

## Tech Stack
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS (via CDN)
- JSZip (for file downloads)
- Google Generative AI SDK (optional AI features)

## Development
- Run: `npm run dev`
- Build: `npm run build`
- Preview production build: `npm run preview`

## Configuration
- Frontend runs on port 5000
- Vite configured with `allowedHosts: true` for Replit proxy compatibility
