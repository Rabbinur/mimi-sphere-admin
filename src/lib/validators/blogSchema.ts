import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(5, "Slug must be at least 5 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  author: z.string().min(2, "Author is required"),
  thumbnail: z.string().optional(),
  category: z.string().optional(),
  isPublished: z.boolean().default(true),
});

export type BlogFormValues = z.infer<typeof blogSchema>;
export const blogResolver = zodResolver(blogSchema);
