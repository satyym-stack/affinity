export type PublicProfileThought = {
  id: number;
  content: string;
  created_at: string;
};

export type PublicUserProfile = {
  user_id: number;
  username: string;
  display_name: string;
  thoughts: PublicProfileThought[];
};

export type UserSearchResult = {
  user_id: number;
  username: string;
  display_name: string;
};
