/*
  Model of json output from https://api.hnpwa.com/v0/{cmd}/{arg}.json
*/
export type { HnUser, HnContent, HnComment, HnItem }
export type { HnSearchItem, HnSearchResults }

interface HnUser {
  id: string;
  created_time: number;
  created: string;
  karma: number;
  about: string;
}

interface HnContent {
  id: number;
  user: string;
  time: number;
  time_ago: string;
  content?: string;
  comments?: HnComment[];
}

interface HnComment extends HnContent {
  level: number;
}

interface HnItem extends HnContent {
  points: number;
  title: string;
  type: string;
  url: string;
  domain?: string;
  comments_count: number;
}

interface HnSearchItem {
  title: string;
  url?: string;
  author: string;
  points: number;
  num_comments: number;
  created_at: string;
  objectID: string;
}

interface HnSearchResults {
  hits: HnSearchItem[];
  page: number;
  nbHits: number;
  nbPages: number;
  hitsPerPage: number;
  query: string;
  params: string;
}
