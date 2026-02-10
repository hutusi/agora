import type {
  DiscussionProvider,
  GetDiscussionParams,
  DiscussionResult,
  CategoryResult,
  CreateDiscussionParams,
  AddCommentParams,
  AddReplyParams,
  ToggleReactionParams,
} from "../types/provider";
import type { IComment, IReply } from "../types/adapter";
import type {
  GSearchResponse,
  GDiscussionByNumberResponse,
  GCategoriesResponse,
  GCreateDiscussionResponse,
  GAddCommentResponse,
  GReactionResponse,
} from "../types/github";
import { graphqlFetch } from "../graphql/client";
import {
  SEARCH_DISCUSSION_QUERY,
  GET_DISCUSSION_BY_NUMBER,
  GET_CATEGORIES_QUERY,
} from "../graphql/queries";
import {
  CREATE_DISCUSSION_MUTATION,
  ADD_COMMENT_MUTATION,
  ADD_REPLY_MUTATION,
  ADD_REACTION_MUTATION,
  REMOVE_REACTION_MUTATION,
} from "../graphql/mutations";
import {
  adaptDiscussion,
  adaptComment,
  adaptReply,
  adaptUser,
} from "../adapter";
import { buildSearchQuery } from "../mapping";

export class GitHubDiscussionsProvider implements DiscussionProvider {
  readonly name = "github-discussions";

  constructor(
    private getToken: () => string | null,
    private host: string
  ) {}

  async getDiscussion(params: GetDiscussionParams): Promise<DiscussionResult> {
    const token = this.getToken();

    // Use direct GraphQL when authenticated, proxy when not
    if (token) {
      return this.getDiscussionDirect(params, token);
    }
    return this.getDiscussionProxy(params);
  }

  private async getDiscussionDirect(
    params: GetDiscussionParams,
    token: string
  ): Promise<DiscussionResult> {
    if (params.number) {
      const [owner, name] = params.repo.split("/");
      const response = await graphqlFetch<GDiscussionByNumberResponse>(
        GET_DISCUSSION_BY_NUMBER,
        {
          owner,
          name,
          number: params.number,
          first: params.first ?? null,
          last: params.last ?? null,
          after: params.after ?? null,
          before: params.before ?? null,
        },
        token
      );
      const disc = response.data.repository.discussion;
      return {
        viewer: adaptUser(response.data.viewer),
        discussion: disc ? adaptDiscussion(disc) : null,
      };
    }

    const query = buildSearchQuery(
      params.repo,
      params.category || "",
      params.term || "",
      params.strict || false
    );

    const response = await graphqlFetch<GSearchResponse>(
      SEARCH_DISCUSSION_QUERY,
      {
        query,
        first: params.first ?? null,
        last: params.last ?? null,
        after: params.after ?? null,
        before: params.before ?? null,
      },
      token
    );

    const disc = response.data.search.nodes[0] ?? null;
    return {
      viewer: adaptUser(response.data.viewer),
      discussion: disc ? adaptDiscussion(disc) : null,
    };
  }

  private async getDiscussionProxy(
    params: GetDiscussionParams
  ): Promise<DiscussionResult> {
    const searchParams = new URLSearchParams();
    searchParams.set("repo", params.repo);
    if (params.term) searchParams.set("term", params.term);
    if (params.number) searchParams.set("number", String(params.number));
    if (params.category) searchParams.set("category", params.category);
    if (params.strict) searchParams.set("strict", "1");
    if (params.first) searchParams.set("first", String(params.first));
    if (params.last) searchParams.set("last", String(params.last));
    if (params.after) searchParams.set("after", params.after);
    if (params.before) searchParams.set("before", params.before);

    const response = await fetch(
      `${this.host}/api/discussions?${searchParams}`
    );

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    return response.json();
  }

  async getCategories(repo: string): Promise<CategoryResult> {
    const token = this.getToken();

    if (token) {
      const [owner, name] = repo.split("/");
      const response = await graphqlFetch<GCategoriesResponse>(
        GET_CATEGORIES_QUERY,
        { owner, name },
        token
      );
      const repoNode = response.data.search?.nodes?.[0];
      // Handle the direct repository query format
      const data = response.data as unknown as {
        repository?: {
          id: string;
          discussionCategories: {
            nodes: Array<{ id: string; name: string; emojiHTML: string }>;
          };
        };
      };
      if (data.repository) {
        return {
          repositoryId: data.repository.id,
          categories: data.repository.discussionCategories.nodes,
        };
      }
      throw new Error("Repository not found");
    }

    const response = await fetch(
      `${this.host}/api/discussions/categories?repo=${encodeURIComponent(repo)}`
    );
    if (!response.ok) throw new Error(`Proxy error: ${response.status}`);
    return response.json();
  }

  async createDiscussion(
    params: CreateDiscussionParams
  ): Promise<{ id: string }> {
    const token = this.getToken();
    if (!token) throw new Error("Authentication required");

    const response = await graphqlFetch<GCreateDiscussionResponse>(
      CREATE_DISCUSSION_MUTATION,
      {
        input: {
          repositoryId: params.repositoryId,
          categoryId: params.categoryId,
          title: params.title,
          body: params.body,
        },
      },
      token
    );

    return { id: response.data.createDiscussion.discussion.id };
  }

  async addComment(params: AddCommentParams): Promise<IComment> {
    const token = this.getToken();
    if (!token) throw new Error("Authentication required");

    const response = await graphqlFetch<GAddCommentResponse>(
      ADD_COMMENT_MUTATION,
      { body: params.body, discussionId: params.discussionId },
      token
    );

    return adaptComment(response.data.addDiscussionComment.comment);
  }

  async addReply(params: AddReplyParams): Promise<IReply> {
    const token = this.getToken();
    if (!token) throw new Error("Authentication required");

    const response = await graphqlFetch<{
      data: {
        addDiscussionComment: {
          comment: import("../types/github").GReply;
        };
      };
    }>(
      ADD_REPLY_MUTATION,
      {
        body: params.body,
        discussionId: params.discussionId,
        replyToId: params.commentId,
      },
      token
    );

    return adaptReply(response.data.addDiscussionComment.comment);
  }

  async toggleReaction(params: ToggleReactionParams): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error("Authentication required");

    const mutation = params.viewerHasReacted
      ? REMOVE_REACTION_MUTATION
      : ADD_REACTION_MUTATION;

    await graphqlFetch<GReactionResponse>(
      mutation,
      {
        content: params.reaction,
        subjectId: params.subjectId,
      },
      token
    );
  }
}
