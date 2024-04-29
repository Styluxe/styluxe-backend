export interface PostCategoryInterface {
  post_category_id: number;
  category_name: string | null;
}

export interface PostInterface {
  post_id: number;
  author_id: number | null;
  category_id: number | null;
  title: string | null;
  content: string | null;
}

export interface ReactionInterface {
  reaction_id: number;
  post_id: number | null;
  user_id: number | null;
  reaction: string | null;
}

export interface PostCommentInterface {
  comment_id: number;
  post_id: number | null;
  user_id: number | null;
  content: string | null;
}

export interface PostImagesInterface {
  image_id: number;
  post_id: number | null;
  image_uri: string | null;
}

export interface BookmarkInterface {
  bookmark_id: number;
  post_id: number | null;
  user_id: number | null;
}
