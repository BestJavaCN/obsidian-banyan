import { App, getAllTags, TFile } from "obsidian";
import { TagFilter } from "./TagFilter";

export interface FileInfo {
  file: TFile;
  tags: string[];
  created?: number;
}

export const createFileInfo = (file: TFile, app: App): FileInfo | null => {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache) return null;
  const fileTags = getAllTags(cache)?.map((tag) => tag.slice(1)) ?? [];
  const tags = Array.from(new Set(fileTags));
  
  let created: number | undefined;
  if (cache.frontmatter?.created) {
    const createdValue = cache.frontmatter.created;
    if (typeof createdValue === 'string') {
      created = new Date(createdValue).getTime();
    } else if (typeof createdValue === 'number') {
      created = createdValue;
    }
  }
  
  return { file, tags, created };
}
