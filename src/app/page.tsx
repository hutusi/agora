import { Configuration } from "@/components/configuration";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Agora</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            A commenting system powered by GitHub Discussions. Configure your
            widget below, then copy the generated code into your React app.
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Configuration />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
        <div className="mx-auto max-w-3xl px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Agora is open source.{" "}
            <a
              href="https://github.com/anthropics/agora"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
