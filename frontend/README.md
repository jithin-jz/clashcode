# CLASHCODE - Frontend

| Framework | React 19 |
| --- | --- |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| State | Zustand |

High-performance client application for the CLASHCODE platform. Implements a Zero Layout Shift (ZLS) architecture with premium micro-animations.

## Technical Specifications

* Engine: React 19 with Concurrent Rendering
* Editor: Monaco Editor integration for real-time code evaluation
* Animations: Framer Motion for interface transitions
* State: Atomized stores via Zustand
* Icons: Lucide React (Vector-based)

## Directory Structure

* /src/game | Core arena logic and editor orchestration
* /src/pages | Routed views and layout compositions
* /src/components | Atomic and molecular UI components
* /src/stores | State management layers
* /src/services | API/WebSocket integration drivers

## Development Workflow

### Prerequisites
* Node.js v18+
* npm | yarn | pnpm

### Environment Configuration
Configure `.env` with backend gateway targets.
* VITE_API_URL | Core service entrypoint
* VITE_WS_URL | Chat/Notification WebSocket endpoint
* VITE_AI_URL | AI service entrypoint

### Execution
* Install: `npm install`
* Dev: `npm run dev`
* Build: `npm run build`

## Architecture Guide
Refer to `docs/UI_ARCHITECTURE.md` for ZLS implementation details and component design patterns.
