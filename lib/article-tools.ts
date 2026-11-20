// File: lib/article-tools.ts

export type ArticleTool = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  type?: string;
  url: string;
  isExternal?: boolean;
  badge?: string;
};

// All mock/unrelated tools cleared - only admin uploaded tool links are used
export const FIELD_TOOLS_DATABASE: Record<string, ArticleTool[]> = {};

export const UNIVERSAL_FIELD_TOOLS: ArticleTool[] = [];

export function getToolsForArticle(_categorySlug: string): ArticleTool[] {
  return [];
}
