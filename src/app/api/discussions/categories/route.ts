import { NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/graphql/client";
import { GET_CATEGORIES_QUERY } from "@/lib/graphql/queries";

/**
 * Proxy endpoint for fetching discussion categories.
 * Used by the configuration UI to populate the category dropdown.
 */
export async function GET(request: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "No GITHUB_TOKEN configured" },
      { status: 500 }
    );
  }

  const repo = request.nextUrl.searchParams.get("repo");
  if (!repo) {
    return NextResponse.json(
      { error: "repo is required" },
      { status: 400 }
    );
  }

  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    return NextResponse.json(
      { error: "Invalid repo format. Expected: owner/name" },
      { status: 400 }
    );
  }

  try {
    const response = await graphqlFetch<{
      data: {
        repository: {
          id: string;
          discussionCategories: {
            nodes: Array<{ id: string; name: string; emojiHTML: string }>;
          };
        };
      };
    }>(GET_CATEGORIES_QUERY, { owner, name }, token);

    return NextResponse.json({
      repositoryId: response.data.repository.id,
      categories: response.data.repository.discussionCategories.nodes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
