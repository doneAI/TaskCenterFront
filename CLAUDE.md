# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based admin dashboard for a distributed GPU task scheduling system (分布式任务调度系统). It provides real-time monitoring and management interfaces for GPU nodes, task execution, system health, and alerts.

**Tech Stack**: React 18 + TypeScript + Ant Design + Redux Toolkit + ECharts

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm start

# Production build
npm run build

# Run tests
npm test
```

## Architecture Overview

### API Layer (`src/services/`)
- **api.ts**: Axios instance with interceptors, handles authentication (Bearer token), error handling, and timestamp-based cache prevention
- **Service modules**: gpu.ts, task.ts, monitoring.ts, alert.ts - correspond to backend API domains
- **Base URL**: Configured via `REACT_APP_API_BASE_URL` (defaults to http://34.54.181.225:80/api/v2)
- **Authentication**: Uses `REACT_APP_API_KEY` in Authorization header

### State Management (`src/store/`)
Redux Toolkit with five domain slices:
- **gpuSlice**: GPU node management (list, status, operations)
- **taskSlice**: Task monitoring (list, progress, results)
- **monitoringSlice**: System metrics and overview
- **alertSlice**: Alert management
- **settingsSlice**: Application settings (theme, refresh intervals, API config)

All slices use `createAsyncThunk` for async operations. Store is configured in `src/store/index.ts`.

### Custom Hooks (`src/hooks/`)
- **useApi**: Generic hook for API calls with loading/error states, auto-refresh capability, and dependency-based re-fetching
- **useAutoRefresh**: Interval-based refresh control for real-time data updates

### Page Components (`src/pages/`)
Six main page modules corresponding to routes:
- `/` - Dashboard: System overview with key metrics and charts
- `/gpu-management` - GpuManagement: GPU node list and operations
- `/task-monitoring` - TaskMonitoring: Task list, status tracking, progress
- `/health-check` - HealthCheck: System health monitoring
- `/alert-management` - AlertManagement: Alert list and acknowledgment
- `/settings` - Settings: API configuration and display preferences

### Type Definitions (`src/types/index.ts`)
Centralized TypeScript interfaces for:
- API response structures (ApiResponse<T>)
- Domain models (GpuNodeInfo, TaskInfo, AlertInfo, etc.)
- Monitoring data (MonitoringOverview, HealthStatus, MonitoringMetrics)
- Application state (SystemSettings, PaginationParams, FilterParams)

### Key Architectural Patterns

1. **Service Layer Pattern**: Each API domain has dedicated service module with typed methods
2. **Redux Async Thunks**: All async operations use createAsyncThunk for consistent state handling
3. **Type Safety**: Comprehensive TypeScript interfaces ensure type safety across app
4. **Component Composition**: Layout wrapper (AppLayout) with route-based page components
5. **Real-time Updates**: Auto-refresh hooks enable configurable polling intervals

## API Integration Notes

- All API endpoints are under `/api/v2` prefix
- Response format: `{ code, message, data }`
- Timestamps are Unix milliseconds
- GET requests include `_t` timestamp parameter to prevent caching
- Error handling centralized in api.ts interceptor with Ant Design message notifications

## Development Notes

- Uses Chinese locale (zhCN) for Ant Design components
- Default API refresh interval: 30 seconds
- TypeScript strict mode enabled
- No state persistence configured (Redux does not persist to localStorage)
- Environment variables prefix: `REACT_APP_*`

## API Documentation

Comprehensive API specification available in `design/API_SPECIFICATION.md` covering:
- Monitoring endpoints (`/monitoring/*`)
- GPU management (`/gpus/*`)
- Task management (`/tasks/*`)
- Alert management (`/monitoring/alerts/*`)
- Cluster status (`/cluster/*`)
