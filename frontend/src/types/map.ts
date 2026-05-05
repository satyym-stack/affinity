export type MapUser = {
  user_id: number;
  username: string;
  display_name: string;
  x: number;
  y: number;
};

export type MapRecomputeResult = {
  updated_count: number;
  message: string;
};
