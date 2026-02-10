# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Agora

Agora is a commenting system (like giscus) that uses GitHub Discussions as backend storage. It ships as both a **React component library** (`<Agora />`) for embedding in any React app, and a **Next.js app** that hosts OAuth routes and a configuration UI.

## Build Commands

```bash
bun run dev              # Start Next.js dev server (Turbopack)
bun run build            # Build Next.js app
bun run build:lib        # Build npm library (tsup + CSS)
bunx tsup                # Build library JS/types only
bun run build:css        # Build library CSS only
bun run lint             # ESLint
```

## Architecture

**Dual build system:**
- `next build` — Next.js app (OAuth API routes + config UI page at `/`)
- `tsup` — npm library exporting `<Agora />` component (ESM + CJS + `.d.ts`)

**Key separation:** `src/app/` is Next.js-only (not published to npm). `src/components/` and `src/lib/` are the library code exported via `src/index.ts`.

**Data flow:**
```
<Agora> → useAuthInit() → createProvider("github-discussions") → useDiscussion(SWR)
  ├─ Authenticated: direct GitHub GraphQL with user's OAuth token
  └─ Unauthenticated: proxy through /api/discussions (uses server GITHUB_TOKEN)
```

**Provider pattern:** `DiscussionProvider` interface (`src/lib/types/provider.ts`) abstracts the backend. `GitHubDiscussionsProvider` is the only implementation. Future backends (GitHub Issues, GitLab) would implement the same interface — all UI depends only on normalized types from `src/lib/types/adapter.ts`.

**OAuth flow:** Encrypt redirect URI → GitHub OAuth → callback exchanges code for token → encrypt token as session → redirect back with `?agora_session=` → client stores in localStorage → exchanges for raw token via `/api/oauth/token`. Encryption uses AES-GCM via Web Crypto API (`src/lib/oauth/state.ts`).

**Theming:** CSS variables scoped under `.agora[data-theme]`. Light/dark/system themes in `src/styles/themes/`. System theme uses `prefers-color-scheme`. Custom themes supported via URL (dynamically injected `<link>` tag).

## Build Gotchas

- **Next.js auto-adds `incremental: true`** to `tsconfig.json` on every build — this breaks tsup DTS generation. The fix is `compilerOptions: { incremental: false }` in tsup's dts config and using `tsconfig.lib.json`.
- **Google Fonts fail without internet** — layout uses system fonts instead of `next/font/google`.
- **Tailwind CSS v4** uses `@import "tailwindcss"` not `@tailwind` directives.
- **JSX files must use `.tsx`** extension (not `.ts`) — TypeScript strict mode.
- **Library CSS** is built separately via `tailwindcss` CLI into `dist/styles.css`, not bundled by tsup.

## Key Config Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | Main TypeScript config (Next.js, `@/*` path alias) |
| `tsconfig.lib.json` | Library build — excludes `src/app/`, disables incremental |
| `tsup.config.ts` | Library bundler — ESM/CJS, externals react/swr/next |
| `next.config.ts` | React compiler enabled |
| `.env.example` | Required env vars: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ENCRYPTION_SECRET` |

## Conventions

- All client components use `"use client"` directive
- Hooks in `src/lib/hooks/`, contexts in `src/lib/context/`
- GraphQL queries/mutations are raw strings in `src/lib/graphql/`, not using a codegen tool
- Adapter functions (`src/lib/adapter.ts`) transform raw GitHub types (`G*`) into normalized types (`I*`)
- SWR `useDiscussion` hook handles optimistic updates for comments and reactions via `mutate()`
- Page size is 20 comments (hardcoded in `use-discussion.ts`)
