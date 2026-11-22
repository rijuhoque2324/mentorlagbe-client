import { apiDelete, apiGetRaw, apiPost, toPage } from "@/lib/api";
import { normalizeBookmark } from "@/lib/normalize";
import type { Bookmark, Page } from "@/types";

export const bookmarkService = {
  async list(): Promise<Page<Bookmark>> {
    const payload = await apiGetRaw("/bookmarks");
    return toPage(payload, normalizeBookmark);
  },

  async add(tuitionId: string): Promise<Bookmark> {
    const payload = await apiPost<unknown>("/bookmarks", { tuitionId });
    return normalizeBookmark(payload);
  },

  async remove(bookmarkId: string): Promise<void> {
    await apiDelete(`/bookmarks/${bookmarkId}`);
  },

  async removeByTuition(tuitionId: string): Promise<void> {
    await apiDelete(`/bookmarks/tuition/${tuitionId}`);
  },
};
