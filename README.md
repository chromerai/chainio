# Chainio - Workflow Automation Platform

**Chainio** is a robust workflow automation platform built with Next.js, designed to connect various services, AI providers, and communication tools through a visual editor. Users can create automation chains triggered by external webhooks or manual actions.

## 🚀 Features

### Triggers
*   **Manual Trigger**: Run workflows with a single click.
*   **Google Forms**: Execute flows upon form submissions.
*   **Stripe**: Trigger actions based on captured Stripe events.

### Execution Nodes
*   **AI Integration**: Built-in support for **OpenAI**, **Anthropic**, and **Google Gemini**.
*   **Messaging**: Send notifications via **Slack**, **Discord**, and **Telegram**.
*   **Utilities**: 
    *   **HTTP Requests**: Make external API calls.
    *   **Wait/Delay**: Add timed pauses between execution steps.

### Platform Capabilities
*   **Visual Workflow Editor**: Powered by `@xyflow/react`.
*   **Credential Management**: Securely store API keys for different providers.
*   **Execution Tracking**: Monitor run history and status (Running, Success, Failed).
*   **Subscription System**: Tiered access support via Polar integration.

## 🛠 Tech Stack

*   **Framework**: [Next.js 15.5](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [Prisma](https://www.prisma.io/) with **PostgreSQL**
*   **Background Jobs**: [Inngest](https://www.inngest.com/)
*   **API**: [tRPC](https://trpc.io/)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
*   **Authentication**: [Better Auth](https://www.better-auth.com/)
*   **Monitoring**: [Sentry](https://sentry.io/)
*   **Linting/Formatting**: [Biome](https://biomejs.dev/)

## 📂 Project Structure

```text
└── src/
    ├── app/            # Next.js Pages, API Routes, and Layouts
    ├── components/     # UI and Workflow-specific components
    ├── features/       # Modular logic for Auth, Editor, Nodes, and Workflows
    ├── inngest/        # Background function and channel definitions
    ├── lib/            # Shared utilities (DB, Auth, Encryption)
    ├── trpc/           # tRPC server and client configuration
    └── generated/      # Prisma generated types
```

## 🚥 Getting Started

### Prerequisites
*   Node.js 20+
*   PostgreSQL database
*   Inngest Dev Server (for background jobs)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd chainio
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file and configure:
    *   `DATABASE_URL`: Your PostgreSQL connection string.
    *   `NGROK_URL`: Required for local webhook testing.

4.  **Database Setup**:
    ```bash
    npx prisma migrate dev
    ```

### Running Locally

You can run the full environment (Next.js, Inngest, and Ngrok) using the multi-process script:
```bash
npm run dev:all
```

Or run them individually:
*   **Next.js**: `npm run dev`
*   **Inngest**: `npm run inngest:dev`
*   **Ngrok**: `npm run ngrok:dev`

## 📜 Available Scripts

*   `npm run dev`: Start Next.js with Turbopack.
*   `npm run build`: Build the application for production.
*   `npm run lint`: Check code quality with Biome.
*   `npm run format`: Format code with Biome.
*   `npm run postinstall`: Automatically generates Prisma client.

## 🧪 Monitoring

The project uses **Sentry** for comprehensive error tracking across Edge, Server, and Client runtimes. You can verify the setup by visiting `/sentry-example-page` in your local environment.

---