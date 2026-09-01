export type TBlog = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  thumbnail?: string;
  category?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};
