
interface HnUser {
  id: string;
  created_time: number;
  created: string;
  karma: number;
  about: string;
}

interface HnItem {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: string;
  comments_count: number;
  type: string;
  url: string;
  domain?: string;
  content?: string;
  comments?: HnComment[];
}

interface HnComment {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  comments?: HnComment[];
}
