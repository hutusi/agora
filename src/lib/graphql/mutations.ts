export const CREATE_DISCUSSION_MUTATION = `
  mutation CreateDiscussion($input: CreateDiscussionInput!) {
    createDiscussion(input: $input) {
      discussion { id }
    }
  }
`;

export const ADD_COMMENT_MUTATION = `
  mutation AddComment($body: String!, $discussionId: ID!) {
    addDiscussionComment(input: { body: $body, discussionId: $discussionId }) {
      comment {
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
        reactionGroups {
          content
          users { totalCount }
          viewerHasReacted
        }
        replies(last: 100) {
          totalCount
          nodes {
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
            reactionGroups {
              content
              users { totalCount }
              viewerHasReacted
            }
            replyTo { id }
          }
        }
      }
    }
  }
`;

export const ADD_REPLY_MUTATION = `
  mutation AddReply($body: String!, $discussionId: ID!, $replyToId: ID!) {
    addDiscussionComment(input: {
      body: $body,
      discussionId: $discussionId,
      replyToId: $replyToId
    }) {
      comment {
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
        reactionGroups {
          content
          users { totalCount }
          viewerHasReacted
        }
        replyTo { id }
      }
    }
  }
`;

export const ADD_REACTION_MUTATION = `
  mutation AddReaction($content: ReactionContent!, $subjectId: ID!) {
    addReaction(input: { content: $content, subjectId: $subjectId }) {
      reaction { content id }
    }
  }
`;

export const REMOVE_REACTION_MUTATION = `
  mutation RemoveReaction($content: ReactionContent!, $subjectId: ID!) {
    removeReaction(input: { content: $content, subjectId: $subjectId }) {
      reaction { content id }
    }
  }
`;
