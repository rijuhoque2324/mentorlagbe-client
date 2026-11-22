import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { normalizeUser } from "@/lib/normalize";
import type { ProfileInput, User } from "@/types";

export const userService = {
  async me(): Promise<User> {
    const payload = await apiGet<unknown>("/users/me");
    return normalizeUser(payload);
  },

  async updateMe(input: ProfileInput): Promise<User> {
    const payload = await apiPatch<unknown>("/users/me", input);
    return normalizeUser(payload);
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("image", file);

    const payload = await apiPost<unknown>("/users/me/avatar", formData);

    return normalizeUser(payload);
  },
};
