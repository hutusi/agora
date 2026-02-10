import { NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/graphql/client";
import {
  SEARCH_DISCUSSION_QUERY,
  GET_DISCUSSION_BY_NUMBER,
} from "@/lib/graphql/queries";
import { buildSearchQuery } from "@/lib/mapping";
import { adaptDiscussion, adaptUser } from "@/lib/adapter";
import type {
  GSearchResponse,
  GDiscussionByNumberResponse,
} from "@/lib/types/github";

/**
 * Proxy endpoint for unauthenticated discussion reads.
 * Uses the server-side GITHUB_TOKEN to fetch data.
 */
export async function GET(request: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "No GITHUB_TOKEN configured" },
      { status: 500 }
    );
  }

  const params = request.nextUrl.searchParams;
  const repo = params.get("repo");
  if (!repo) {
    return NextResponse.json(
      { error: "repo is required" },
      { status: 400 }
    );
  }

  const numberStr = params.get("number");
  const term = params.get("term");
  const category = params.get("category") || "";
  const strict = params.get("strict") === "1";
  const first = params.get("first") ? Number(params.get("first")) : null;
  const last = params.get("last") ? Number(params.get("last")) : null;
  const after = params.get("after");
  const before = params.get("before");

  try {
    if (numberStr) {
      const [owner, name] = repo.split("/");
      const response = await graphqlFetch<GDiscussionByNumberResponse>(
        GET_DISCUSSION_BY_NUMBER,
        { owner, name, number: Number(numberStr), first, last, after, before },
        token
      );
      const disc = response.data.repository.discussion;
      return NextResponse.json({
        viewer: adaptUser(response.data.viewer),
        discussion: disc ? adaptDiscussion(disc) : null,
      });
    }

    if (term) {
      const query = buildSearchQuery(repo, category, term, strict);
      const response = await graphqlFetch<GSearchResponse>(
        SEARCH_DISCUSSION_QUERY,
        { query, first, last, after, before },
        token
      );
      const disc = response.data.search.nodes[0] ?? null;
      return NextResponse.json({
        viewer: adaptUser(response.data.viewer),
        discussion: disc ? adaptDiscussion(disc) : null,
      });
    }

    return NextResponse.json(
      { error: "term or number is required" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
