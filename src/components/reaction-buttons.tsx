"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { REACTIONS } from "@/lib/reactions";
import type { IReactionGroups, ReactionContent } from "@/lib/types/adapter";

interface ReactionButtonsProps {
  reactionGroups: IReactionGroups;
  onToggle: (reaction: ReactionContent) => void;
}

export function ReactionButtons({
  reactionGroups,
  onToggle,
}: ReactionButtonsProps) {
  const { isAuthenticated } = useAuth();

  const activeReactions = reactionGroups.filter((g) => g.count > 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {activeReactions.map((group) => {
        const info = REACTIONS.find((r) => r.content === group.content);
        if (!info) return null;

        return (
          <button
            key={group.content}
            onClick={() => isAuthenticated && onToggle(group.content)}
            disabled={!isAuthenticated}
            title={`${info.label} (${group.count})`}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
              group.viewerHasReacted
                ? "border-[var(--agora-reaction-border-active)] bg-[var(--agora-reaction-bg-active)] text-[var(--agora-text-link)]"
                : "border-[var(--agora-border)] bg-[var(--agora-reaction-bg)] text-[var(--agora-text-secondary)] hover:bg-[var(--agora-reaction-bg-hover)]"
            } disabled:cursor-default disabled:opacity-70`}
          >
            <span>{info.emoji}</span>
            <span>{group.count}</span>
          </button>
        );
      })}

      {/* Add reaction popover trigger */}
      {isAuthenticated && (
        <ReactionPicker onSelect={onToggle} existing={reactionGroups} />
      )}
    </div>
  );
}

function ReactionPicker({
  onSelect,
  existing,
}: {
  onSelect: (reaction: ReactionContent) => void;
  existing: IReactionGroups;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[var(--agora-border)] bg-[var(--agora-reaction-bg)] text-[var(--agora-text-secondary)] transition-colors hover:bg-[var(--agora-reaction-bg-hover)] text-xs"
        title="Add reaction"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zM5 8a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zM5.32 9.636a.75.75 0 011.038.175l.007.009c.103.118.22.222.35.31.264.178.581.292.945.292.364 0 .681-.114.945-.292a2.13 2.13 0 00.35-.31l.007-.008a.75.75 0 011.222.87l-.614-.431c.614.43.614.431.613.431v.001l-.001.002-.002.003-.005.007-.014.019a2.066 2.066 0 01-.184.213 3.63 3.63 0 01-.534.413A2.926 2.926 0 018 11.5a2.926 2.926 0 01-1.44-.382 3.63 3.63 0 01-.534-.413 2.066 2.066 0 01-.184-.213l-.014-.019-.005-.007-.002-.003v-.002h-.001l.613-.432-.614.43a.75.75 0 01.183-1.044h.001z"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-1 z-20 flex gap-1 rounded-lg border border-[var(--agora-border)] bg-[var(--agora-bg)] p-1.5 shadow-lg">
            {REACTIONS.map((r) => {
              const group = existing.find((g) => g.content === r.content);
              return (
                <button
                  key={r.content}
                  onClick={() => {
                    onSelect(r.content);
                    setIsOpen(false);
                  }}
                  title={r.label}
                  className={`w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--agora-reaction-bg-hover)] text-base transition-transform hover:scale-110 ${
                    group?.viewerHasReacted
                      ? "bg-[var(--agora-reaction-bg-active)]"
                      : ""
                  }`}
                >
                  {r.emoji}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
