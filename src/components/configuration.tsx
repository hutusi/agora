"use client";

import { useState, useCallback } from "react";
import type {
  AgoraTheme,
  MappingStrategy,
  InputPosition,
} from "@/lib/types/agora";

interface RepoValidation {
  isValid: boolean;
  repoId: string;
  categories: Array<{ id: string; name: string; emojiHTML: string }>;
  error?: string;
}

export function Configuration() {
  const [repo, setRepo] = useState("");
  const [repoValidation, setRepoValidation] = useState<RepoValidation | null>(
    null
  );
  const [isValidating, setIsValidating] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [mapping, setMapping] = useState<MappingStrategy>("pathname");
  const [term, setTerm] = useState("");
  const [strict, setStrict] = useState(false);
  const [reactionsEnabled, setReactionsEnabled] = useState(true);
  const [inputPosition, setInputPosition] = useState<InputPosition>("bottom");
  const [theme, setTheme] = useState<AgoraTheme>("system");
  const [lazy, setLazy] = useState(false);
  const [copied, setCopied] = useState(false);

  const validateRepo = useCallback(async (repoName: string) => {
    if (!repoName.match(/^[\w.-]+\/[\w.-]+$/)) {
      setRepoValidation({
        isValid: false,
        repoId: "",
        categories: [],
        error: "Invalid format. Use owner/repo.",
      });
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch(
        `/api/discussions/categories?repo=${encodeURIComponent(repoName)}`
      );
      const data = await res.json();
      if (data.error) {
        setRepoValidation({
          isValid: false,
          repoId: "",
          categories: [],
          error: data.error,
        });
      } else {
        setRepoValidation({
          isValid: true,
          repoId: data.repositoryId,
          categories: data.categories,
        });
      }
    } catch {
      setRepoValidation({
        isValid: false,
        repoId: "",
        categories: [],
        error: "Failed to validate repository.",
      });
    }
    setIsValidating(false);
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setCategoryId(selectedId);
    const cat = repoValidation?.categories.find((c) => c.id === selectedId);
    setCategoryName(cat?.name || "");
  };

  const snippet = generateSnippet({
    repo,
    repoId: repoValidation?.repoId || "YOUR_REPO_ID",
    category: categoryName || "YOUR_CATEGORY",
    categoryId: categoryId || "YOUR_CATEGORY_ID",
    mapping,
    term,
    strict,
    reactionsEnabled,
    inputPosition,
    theme,
    lazy,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Repository */}
      <Section title="Repository" description="The GitHub repository where discussions will be stored.">
        <div className="flex gap-2">
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            onBlur={() => repo && validateRepo(repo)}
            placeholder="owner/repo"
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
          <button
            onClick={() => repo && validateRepo(repo)}
            disabled={isValidating || !repo}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isValidating ? "Checking..." : "Connect"}
          </button>
        </div>
        {repoValidation && !repoValidation.isValid && (
          <p className="mt-1 text-sm text-red-500">{repoValidation.error}</p>
        )}
        {repoValidation?.isValid && (
          <p className="mt-1 text-sm text-green-600">
            Repository connected successfully.
          </p>
        )}
      </Section>

      {/* Discussion Category */}
      <Section
        title="Discussion Category"
        description="Choose a category for the discussions. Only Announcements-type categories are recommended."
      >
        <select
          value={categoryId}
          onChange={handleCategoryChange}
          disabled={!repoValidation?.isValid}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 disabled:opacity-50"
        >
          <option value="">Select a category...</option>
          {repoValidation?.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </Section>

      {/* Page ↔ Discussion Mapping */}
      <Section
        title="Page ↔ Discussion Mapping"
        description="How the current page is mapped to a GitHub Discussion."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MAPPING_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition-colors ${
                mapping === opt.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
              }`}
            >
              <input
                type="radio"
                name="mapping"
                value={opt.value}
                checked={mapping === opt.value}
                onChange={() => setMapping(opt.value)}
                className="sr-only"
              />
              <div>
                <div className="font-medium">{opt.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {opt.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {(mapping === "specific" || mapping === "number") && (
          <input
            type={mapping === "number" ? "number" : "text"}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={
              mapping === "number" ? "Discussion number" : "Search term"
            }
            className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        )}
      </Section>

      {/* Features */}
      <Section title="Features" description="Toggle optional features.">
        <div className="space-y-3">
          <Checkbox
            label="Enable reactions"
            description="Show reaction buttons on the discussion and comments."
            checked={reactionsEnabled}
            onChange={setReactionsEnabled}
          />
          <Checkbox
            label="Strict matching"
            description="Use a SHA-1 hash in the discussion body for strict page matching."
            checked={strict}
            onChange={setStrict}
          />
          <Checkbox
            label="Lazy loading"
            description="Defer loading until the widget scrolls into view."
            checked={lazy}
            onChange={setLazy}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comment input position
          </label>
          <div className="flex gap-2">
            {(["bottom", "top"] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => setInputPosition(pos)}
                className={`rounded-md border px-4 py-2 text-sm capitalize transition-colors ${
                  inputPosition === pos
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Theme */}
      <Section
        title="Theme"
        description="Choose a color scheme for the widget."
      >
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                theme === t.value
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Generated snippet */}
      <Section
        title="Generated Code"
        description="Copy this code into your React component."
      >
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
            <code>{snippet}</code>
          </pre>
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 rounded-md bg-gray-700 px-3 py-1 text-xs font-medium text-gray-200 hover:bg-gray-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      <p className="mt-1 mb-3 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {children}
    </section>
  );
}

function Checkbox({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </div>
      </div>
    </label>
  );
}

const MAPPING_OPTIONS: Array<{
  value: MappingStrategy;
  label: string;
  description: string;
}> = [
  { value: "pathname", label: "pathname", description: "URL path" },
  { value: "url", label: "URL", description: "Full URL" },
  { value: "title", label: "title", description: "Page title" },
  { value: "og:title", label: "og:title", description: "Open Graph title" },
  { value: "specific", label: "specific", description: "Custom term" },
  { value: "number", label: "number", description: "Discussion #" },
];

const THEMES: Array<{ value: AgoraTheme; label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function generateSnippet(config: {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: MappingStrategy;
  term: string;
  strict: boolean;
  reactionsEnabled: boolean;
  inputPosition: InputPosition;
  theme: AgoraTheme;
  lazy: boolean;
}): string {
  const lines = [
    `import { Agora } from "agora";`,
    `import "agora/styles.css";`,
    ``,
    `<Agora`,
    `  repo="${config.repo}"`,
    `  repoId="${config.repoId}"`,
    `  category="${config.category}"`,
    `  categoryId="${config.categoryId}"`,
  ];

  if (config.mapping !== "pathname") {
    lines.push(`  mapping="${config.mapping}"`);
  }
  if (config.term && (config.mapping === "specific" || config.mapping === "number")) {
    lines.push(`  term="${config.term}"`);
  }
  if (config.strict) {
    lines.push(`  strict={true}`);
  }
  if (!config.reactionsEnabled) {
    lines.push(`  reactionsEnabled={false}`);
  }
  if (config.inputPosition !== "bottom") {
    lines.push(`  inputPosition="${config.inputPosition}"`);
  }
  if (config.theme !== "system") {
    lines.push(`  theme="${config.theme}"`);
  }
  if (config.lazy) {
    lines.push(`  lazy={true}`);
  }

  lines.push(`/>`);
  return lines.join("\n");
}
