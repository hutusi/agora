const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

export class GraphQLError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Array<{ message: string; type?: string }>
  ) {
    super(message);
    this.name = "GraphQLError";
  }
}

export async function graphqlFetch<T = unknown>(
  query: string,
  variables: Record<string, unknown>,
  token: string
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new GraphQLError(
      `GitHub API error: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  const json = await response.json();

  if (json.errors?.length) {
    throw new GraphQLError(
      json.errors[0]?.message || "GraphQL error",
      undefined,
      json.errors
    );
  }

  return json as T;
}
