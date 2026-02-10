"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { LoginButton } from "./login-button";

interface CommentBoxProps {
  onSubmit: (body: string) => Promise<void>;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
}

export function CommentBox({
  onSubmit,
  placeholder = "Write a comment...",
  submitLabel = "Comment",
  compact = false,
}: CommentBoxProps) {
  const { isAuthenticated, viewer } = useAuth();
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const handleSubmit = useCallback(async () => {
    if (!body.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(body);
      setBody("");
      setActiveTab("write");
    } finally {
      setIsSubmitting(false);
    }
  }, [body, isSubmitting, onSubmit]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-[var(--agora-border)] bg-[var(--agora-bg-secondary)] p-4 text-center">
        <p className="text-sm text-[var(--agora-text-secondary)] mb-3">
          Sign in to join the conversation.
        </p>
        <LoginButton />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--agora-border)] bg-[var(--agora-bg)]">
      {/* Tab header */}
      <div className="flex items-center border-b border-[var(--agora-border)] bg-[var(--agora-bg-secondary)] px-2 rounded-t-lg">
        <button
          onClick={() => setActiveTab("write")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "write"
              ? "border-[var(--agora-text-link)] text-[var(--agora-text)]"
              : "border-transparent text-[var(--agora-text-secondary)] hover:text-[var(--agora-text)]"
          }`}
        >
          Write
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === "preview"
              ? "border-[var(--agora-text-link)] text-[var(--agora-text)]"
              : "border-transparent text-[var(--agora-text-secondary)] hover:text-[var(--agora-text)]"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="p-3">
        {activeTab === "write" ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={placeholder}
            rows={compact ? 3 : 5}
            className="w-full rounded-md border border-[var(--agora-border)] bg-[var(--agora-bg)] p-3 text-sm text-[var(--agora-text)] placeholder:text-[var(--agora-text-secondary)] resize-y focus:outline-none focus:border-[var(--agora-text-link)] focus:ring-1 focus:ring-[var(--agora-text-link)]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
        ) : (
          <div className="agora-markdown min-h-[80px] rounded-md border border-[var(--agora-border)] bg-[var(--agora-bg)] p-3 text-sm">
            {body ? (
              <p className="whitespace-pre-wrap">{body}</p>
            ) : (
              <p className="text-[var(--agora-text-secondary)] italic">
                Nothing to preview
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--agora-border)] px-3 py-2">
        <span className="text-xs text-[var(--agora-text-secondary)]">
          Markdown is supported. Ctrl+Enter to submit.
        </span>
        <button
          onClick={handleSubmit}
          disabled={!body.trim() || isSubmitting}
          className="rounded-md bg-[var(--agora-btn-primary)] px-4 py-1.5 text-sm font-medium text-[var(--agora-btn-text-primary)] transition-colors hover:bg-[var(--agora-btn-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
