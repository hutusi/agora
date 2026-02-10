const VIEWER_FIELDS = `
  viewer {
    avatarUrl
    login
    url
  }
`;

const REACTION_FIELDS = `
  reactionGroups {
    content
    users { totalCount }
    viewerHasReacted
  }
`;

const REPLY_FIELDS = `
  id
  author { avatarUrl login url }
  viewerDidAuthor
  createdAt
  url
  authorAssociation
  lastEditedAt
  deletedAt
  isMinimized
  bodyHTML
  ${REACTION_FIELDS}
  replyTo { id }
`;

const COMMENT_FIELDS = `
  id
  upvoteCount
  viewerHasUpvoted
  viewerCanUpvote
  author { avatarUrl login url }
  viewerDidAuthor
  createdAt
  url
  authorAssociation
  lastEditedAt
  deletedAt
  isMinimized
  bodyHTML
  ${REACTION_FIELDS}
  replies(last: 100) {
    totalCount
    nodes { ${REPLY_FIELDS} }
  }
`;

const DISCUSSION_FIELDS = `
  id
  url
  locked
  repository { nameWithOwner }
  reactions { totalCount }
  ${REACTION_FIELDS}
  comments(first: $first, last: $last, after: $after, before: $before) {
    totalCount
    pageInfo {
      startCursor
      hasNextPage
      hasPreviousPage
      endCursor
    }
    nodes { ${COMMENT_FIELDS} }
  }
`;

/** Search for a discussion by term in title */
export const SEARCH_DISCUSSION_QUERY = `
  query SearchDiscussion(
    $query: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    ${VIEWER_FIELDS}
    search(type: DISCUSSION, last: 1, query: $query) {
      discussionCount
      nodes {
        ... on Discussion { ${DISCUSSION_FIELDS} }
      }
    }
  }
`;

/** Search for a discussion by hash in body (strict mode) */
export const SEARCH_DISCUSSION_STRICT_QUERY = `
  query SearchDiscussionStrict(
    $query: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    ${VIEWER_FIELDS}
    search(type: DISCUSSION, last: 1, query: $query) {
      discussionCount
      nodes {
        ... on Discussion { ${DISCUSSION_FIELDS} }
      }
    }
  }
`;

/** Get a specific discussion by number */
export const GET_DISCUSSION_BY_NUMBER = `
  query GetDiscussion(
    $owner: String!
    $name: String!
    $number: Int!
    $first: Int
    $last: Int
    $after: String
    $before: String
  ) {
    ${VIEWER_FIELDS}
    repository(owner: $owner, name: $name) {
      discussion(number: $number) { ${DISCUSSION_FIELDS} }
    }
  }
`;

/** Get discussion categories for a repository */
export const GET_CATEGORIES_QUERY = `
  query GetCategories($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      discussionCategories(first: 25) {
        nodes {
          id
          name
          emojiHTML
        }
      }
    }
  }
`;
