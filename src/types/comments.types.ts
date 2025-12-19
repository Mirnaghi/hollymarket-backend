export interface CommentProfile {
  address: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  twitter?: string;
}

export interface CommentReaction {
  id: string;
  commentId: string;
  userAddress: string;
  reactionType: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  body: string | null;
  parentEntityType: string | null;
  parentEntityID: number | null;
  parentCommentID: string | null;
  userAddress: string | null;
  replyAddress: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  profile: CommentProfile | null;
  reactions: CommentReaction[];
  reportCount: number | null;
  reactionCount: number | null;
}

export interface GetCommentsParams {
  limit?: number;
  offset?: number;
  order?: string;
  ascending?: boolean;
  parent_entity_type?: 'Event' | 'Series' | 'market';
  parent_entity_id?: number;
  get_positions?: boolean;
  holders_only?: boolean;
}

export interface CreateCommentParams {
  body: string;
  parent_entity_type: 'Event' | 'Series' | 'market';
  parent_entity_id: number;
  parent_comment_id?: string;
  reply_address?: string;
}

export interface UpdateCommentParams {
  body: string;
}

export interface CommentReactionParams {
  reaction_type: string;
}
