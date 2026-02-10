import type {
  IComment,
  IReply,
  IUser,
  IDiscussion,
  ReactionContent,
} from "./adapter";

export interface GetDiscussionParams {
  repo: string;
  term?: string;
  number?: number;
  category?: string;
  strict?: boolean;
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

export interface DiscussionResult {
  viewer: IUser | null;
  discussion: IDiscussion | null;
}

export interface CategoryInfo {
  id: string;
  name: string;
  emojiHTML: string;
}

export interface CategoryResult {
  repositoryId: string;
  categories: CategoryInfo[];
}

export interface CreateDiscussionParams {
  repositoryId: string;
  categoryId: string;
  title: string;
  body: string;
}

export interface AddCommentParams {
  discussionId: string;
  body: string;
}

export interface AddReplyParams {
  discussionId: string;
  commentId: string;
  body: string;
}

export interface ToggleReactionParams {
  subjectId: string;
  reaction: ReactionContent;
  viewerHasReacted: boolean;
}

/**
 * A DiscussionProvider abstracts the backend storage.
 * Implementations transform backend-specific data into normalized types.
 */
export interface DiscussionProvider {
  readonly name: string;

  getDiscussion(params: GetDiscussionParams): Promise<DiscussionResult>;
  getCategories(repo: string): Promise<CategoryResult>;
  createDiscussion(
    params: CreateDiscussionParams
  ): Promise<{ id: string }>;
  addComment(params: AddCommentParams): Promise<IComment>;
  addReply(params: AddReplyParams): Promise<IReply>;
  toggleReaction(params: ToggleReactionParams): Promise<void>;
}
