import bookmarksData from '@/data/bookmarks.json';

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  category: string;
  domain: string;
  pathname: string;
}

export interface CategoryData {
  name: string;
  slug: string;
  count: number;
}

export function getBookmarksData(): { bookmarks: Bookmark[]; categories: CategoryData[] } {
  return bookmarksData as { bookmarks: Bookmark[]; categories: CategoryData[] };
}
