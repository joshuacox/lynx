import { getBookmarksData } from '@/lib/bookmarks';
import BookmarksView from '@/components/BookmarksView';

export default function HomePage() {
  const { bookmarks, categories } = getBookmarksData();

  return (
    <BookmarksView initialBookmarks={bookmarks} categories={categories} />
  );
}
