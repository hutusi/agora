# Agora

A commenting system powered by [GitHub Discussions](https://docs.github.com/en/discussions). Similar to [giscus](https://giscus.app), but delivered as a **React component** you import directly into your app — no iframes needed.

- Comments stored in GitHub Discussions (no database required)
- GitHub OAuth for authentication
- Reactions, threaded replies, markdown support
- Light, dark, and system themes
- Extensible provider architecture for future backends

## Quick Start

### 1. Install

```bash
bun add agora
# or
npm install agora
```

Peer dependencies: `react` (18+) and `react-dom` (18+).

### 2. Use the Component

```tsx
import { Agora } from "agora";
import "agora/styles.css";

export default function BlogPost() {
  return (
    <article>
      <h1>My Blog Post</h1>
      <p>Content here...</p>

      <Agora
        repo="your-username/your-repo"
        repoId="R_kgDOxxxxxxx"
        category="Announcements"
        categoryId="DIC_kwDOxxxxxxx"
        mapping="pathname"
        theme="system"
      />
    </article>
  );
}
```

### 3. Get Your repo/category IDs

Use the [configuration page](#configuration-ui) or the GitHub GraphQL API Explorer to find your `repoId` and `categoryId`.

## Prerequisites

Before using Agora, you need:

1. **A GitHub repository** with [Discussions enabled](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository)
2. **A GitHub OAuth App** — Create one at [github.com/settings/developers](https://github.com/settings/developers)
   - Set the callback URL to `https://your-agora-host.com/api/oauth/callback`
3. **An Agora backend** deployed (for OAuth token exchange and unauthenticated API proxy)

## Component API

### `<Agora />` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `repo` | `string` | *required* | GitHub repository in `"owner/name"` format |
| `repoId` | `string` | *required* | Repository node ID from GitHub GraphQL API |
| `category` | `string` | *required* | Discussion category name |
| `categoryId` | `string` | *required* | Discussion category node ID |
| `mapping` | `MappingStrategy` | `"pathname"` | How to map pages to discussions |
| `term` | `string` | — | Search term (for `specific` mapping) or discussion number (for `number` mapping) |
| `strict` | `boolean` | `false` | Use SHA-1 hash matching for stricter page-discussion mapping |
| `host` | `string` | `window.location.origin` | Agora backend URL for OAuth and API proxy |
| `theme` | `AgoraTheme` | `"system"` | `"light"`, `"dark"`, `"system"`, or a custom CSS URL |
| `inputPosition` | `InputPosition` | `"bottom"` | Comment input box position: `"top"` or `"bottom"` |
| `defaultCommentOrder` | `CommentOrder` | `"oldest"` | Sort order: `"oldest"` or `"newest"` |
| `reactionsEnabled` | `boolean` | `true` | Show reaction buttons |
| `lazy` | `boolean` | `false` | Defer rendering until scrolled into view |
| `onMetadata` | `(metadata: DiscussionMetadata) => void` | — | Callback when discussion metadata loads |
| `onError` | `(error: Error) => void` | — | Error callback |

### Mapping Strategies

| Strategy | Description |
|----------|-------------|
| `pathname` | Uses `window.location.pathname` (strips extensions and trailing slashes) |
| `url` | Uses the full URL (removes tracking params) |
| `title` | Uses `document.title` |
| `og:title` | Uses the `<meta property="og:title">` tag |
| `specific` | Uses a fixed value from the `term` prop |
| `number` | Looks up a specific discussion by number via the `term` prop |

### Themes

Built-in themes: `light`, `dark`, `system` (follows OS preference).

For custom themes, pass a CSS URL that defines the Agora CSS variables:

```tsx
<Agora theme="https://example.com/my-theme.css" ... />
```

See `src/styles/themes/light.css` for the full list of CSS variables to override.

## Deploying the Backend

The Agora backend is a Next.js app that provides:

- **OAuth routes** — Token exchange between your site and GitHub
- **API proxy** — Allows unauthenticated users to read comments
- **Configuration UI** — Interactive form to generate `<Agora />` snippets

### Setup

```bash
git clone https://github.com/hutusi/agora.git
cd agora
bun install
```

Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

Fill in the required values:

```env
# From your GitHub OAuth App
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Random 32+ character string for encrypting OAuth state/sessions
ENCRYPTION_SECRET=your_random_secret_string_at_least_32_chars

# Optional: GitHub PAT for unauthenticated comment reads
GITHUB_TOKEN=ghp_xxxxxxxxxxxx

# Public URL of your Agora deployment
NEXT_PUBLIC_AGORA_HOST=https://your-agora-host.com
```

### Run

```bash
bun run dev         # Development (http://localhost:3000)
bun run build       # Production build
bun run start       # Start production server
```

### Deploy

Deploy as any Next.js app. Works with Vercel, Netlify, Docker, or any Node.js host.

Ensure the OAuth callback URL in your GitHub OAuth App matches:
```
https://your-domain.com/api/oauth/callback
```

## Configuration UI

Visit the deployed Agora app at `/` to access the interactive configuration page. It lets you:

1. Connect a GitHub repository
2. Select a discussion category
3. Choose a mapping strategy
4. Toggle features (reactions, strict mode, lazy loading)
5. Pick a theme
6. Copy the generated `<Agora />` code snippet

## Architecture

```
┌─────────────────────────────────┐
│  Your React App                 │
│  ┌───────────────────────────┐  │
│  │  <Agora />                │  │
│  │  ├── AuthContext           │  │
│  │  ├── useDiscussion (SWR)  │  │
│  │  └── CommentSection       │  │
│  │      ├── ReactionButtons  │  │
│  │      ├── Comment (n)      │  │
│  │      │   └── Reply (n)    │  │
│  │      └── CommentBox       │  │
│  └───────────────────────────┘  │
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────┐     ┌─────────────────────┐
│  Agora Backend       │     │  GitHub GraphQL API  │
│  (Next.js)           │     │                     │
│  ├── /api/oauth/*    │◄───►│  Discussions        │
│  └── /api/discussions│     │  Comments, Reactions │
└──────────────────────┘     └─────────────────────┘
```

**Data flow:**
- **Authenticated users** call the GitHub GraphQL API directly with their OAuth token
- **Unauthenticated users** read comments through the Agora backend proxy (using a server-side `GITHUB_TOKEN`)
- **OAuth** is handled entirely by the backend: encrypt state, redirect to GitHub, exchange code for token, encrypt session, redirect back

**Provider pattern:** The `DiscussionProvider` interface (`src/lib/types/provider.ts`) abstracts the backend. Currently only `GitHubDiscussionsProvider` exists, but the architecture is designed for future backends (GitHub Issues, GitLab Issues, etc.) to be added without changing any UI code.

## Project Structure

```
src/
├── index.ts                    # Library entry point (npm exports)
├── app/                        # Next.js app (backend + config UI, not in npm)
│   ├── page.tsx                # Configuration UI
│   └── api/
│       ├── oauth/              # authorize, callback, token routes
│       └── discussions/        # Read proxy + categories
├── components/                 # React components (exported via npm)
│   ├── agora.tsx               # Root <Agora /> component
│   ├── comment-section.tsx     # Main orchestrator
│   ├── comment.tsx             # Comment with nested replies
│   ├── comment-box.tsx         # Markdown editor + submit
│   ├── reaction-buttons.tsx    # 8 GitHub emoji reactions
│   └── ...
├── lib/
│   ├── types/                  # TypeScript interfaces
│   │   ├── agora.ts            # AgoraProps
│   │   ├── adapter.ts          # Normalized types (IComment, IReply, ...)
│   │   ├── provider.ts         # DiscussionProvider interface
│   │   └── github.ts           # Raw GitHub GraphQL types
│   ├── providers/              # Backend implementations
│   │   └── github-discussions.ts
│   ├── graphql/                # Queries, mutations, client
│   ├── hooks/                  # useDiscussion, useAuth
│   ├── context/                # Auth, Config, Theme contexts
│   ├── oauth/                  # Encryption + session management
│   └── adapter.ts              # GitHub → normalized transforms
└── styles/
    ├── agora.css               # Entry CSS
    └── themes/                 # light.css, dark.css
```

## Development

```bash
bun install                # Install dependencies
bun run dev                # Start dev server with Turbopack
bun run build              # Build Next.js app
bun run build:lib          # Build npm library (JS + CSS + types)
bun run lint               # Run ESLint
```

### Dual Build

| Target | Command | Output | Purpose |
|--------|---------|--------|---------|
| Next.js app | `bun run build` | `.next/` | Deploy the backend + config UI |
| npm library | `bun run build:lib` | `dist/` | Publish `<Agora />` component |

The library build uses [tsup](https://tsup.egoist.dev/) for JS bundling and Tailwind CSS CLI for styles. It outputs ESM, CommonJS, TypeScript declarations, and a minified CSS file.

## Exported Types

```typescript
// Component
import { Agora } from "agora";

// Props and config types
import type {
  AgoraProps,
  MappingStrategy,
  AgoraTheme,
  InputPosition,
  CommentOrder,
  DiscussionMetadata,
} from "agora";

// Provider interface (for building custom backends)
import type { DiscussionProvider } from "agora";

// Normalized data types (for onMetadata callbacks or custom UI)
import type {
  IComment,
  IReply,
  IUser,
  IReactionGroups,
  IDiscussion,
  ReactionContent,
} from "agora";
```

## License

MIT
