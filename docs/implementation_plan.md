# Implementation Plan - Project Reorganization & Replit Cleanup

This plan outlines the steps to restructure the codebase by creating a top-level `backend` folder and a top-level `dashboard` folder, moving the shared libraries into their appropriate locations, and completely removing all Replit-related configurations and files.

## Summary of Restructuring Plan
- `lib/db` -> `backend/lib/db`
- `lib/api-zod` -> `backend/lib/api-zod`
- `lib/api-spec` -> `backend/lib/api-spec`
- `lib/api-client-react` -> `dashboard/lib/api-client-react`

The root `lib/` folder has been completely removed.
The mockup sandbox (`artifacts/mockup-sandbox`) has been deleted.

## Workspace Packages Configuration
- **pnpm-workspace.yaml**:
  ```yaml
  packages:
    - backend
    - backend/lib/*
    - dashboard
    - dashboard/lib/*
    - scripts
  ```

## Package Configurations
- **Backend package**: Renamed to `@workspace/backend`
- **Dashboard package**: Renamed to `@workspace/dashboard` (removed `@replit/*` dependencies/plugins)
